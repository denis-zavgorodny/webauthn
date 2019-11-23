const util1 = require('util');
const express   = require('express');
const utils     = require('../utils');
const config    = require('../config.json');
const base64url = require('base64url');
const router    = express.Router();
const database  = require('./db');
const simpleSession  = require('./session');

router.get('/test', (request, response) => {
  simpleSession.test = 1111;

  response.json({ok: true})
})

router.get('/test1', (request, response) => {

  response.json({res: simpleSession.test})
})

router.post('/register', (request, response) => {
    if(!request.body || !request.body.username || !request.body.name) {
        response.json({
            'status': 'failed',
            'message': 'Request missing name or username field!'
        })

        return
    }

    let username = request.body.username;
    let name     = request.body.name;

    if(database[username] && database[username].registered) {
        response.json({
            'status': 'failed',
            'message': `Username ${username} already exists`
        })

        return
    }

    database[username] = {
        'name': name,
        'registered': false,
        'id': utils.randomBase64URLBuffer(),
        'authenticators': []
    }

    let challengeMakeCred    = utils.generateServerMakeCredRequest(username, name, database[username].id)
    challengeMakeCred.status = 'ok'
    challengeMakeCred.base = database

    simpleSession.challenge = challengeMakeCred.challenge;
    simpleSession.username  = username;

    response.json(challengeMakeCred)
})

router.post('/login', (request, response) => {
    if(!request.body || !request.body.username) {
        response.json({
            'status': 'failed',
            'message': 'Request missing username field!'
        })

        return
    }

    let username = request.body.username;

    if(!database[username] || !database[username].registered) {
        response.json({
            'status': 'failed',
            'message': `User ${username} does not exist!`
        })

        return
    }

    let getAssertion    = utils.generateServerGetAssertion(database[username].authenticators)
    getAssertion.status = 'ok'

    simpleSession.challenge = getAssertion.challenge;
    simpleSession.username  = username;

    response.json(getAssertion)
})

router.post('/response', (request, response) => {
    if(!request.body       || !request.body.id
    || !request.body.rawId || !request.body.response
    || !request.body.type  || request.body.type !== 'public-key' ) {
        response.json({
            'status': 'failed',
            'message': 'Response missing one or more of id/rawId/response/type fields, or type is not public-key!'
        })

        return
    }

    let webauthnResp = request.body
    let clientData   = JSON.parse(base64url.decode(webauthnResp.response.clientDataJSON));

    

    /* Check challenge... */
    if(clientData.challenge !== simpleSession.challenge) {
        response.json({
            'status': 'failed',
            'message': `Challenges don\'t match! ${clientData.challenge} but ${simpleSession.challenge}`
        })
        return
    }

    /* ...and origin */
    if(clientData.origin !== config.origin) {
        response.json({
            'status': 'failed',
            'message': 'Origins don\'t match!'
        })
        return
    }

    let result;
    if(webauthnResp.response.attestationObject !== undefined) {
        /* This is create cred */
        result = utils.verifyAuthenticatorAttestationResponse(webauthnResp);

        if(result.verified) {
            database[simpleSession.username].authenticators.push(result.authrInfo);
            database[simpleSession.username].registered = true
        }
    } else if(webauthnResp.response.authenticatorData !== undefined) {
        /* This is get assertion */
        result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, database[simpleSession.username].authenticators);
    } else {
        response.json({
            'status': 'failed',
            'message': 'Can not determine type of response!'
        })
    }

    if(result.verified) {
        simpleSession.loggedIn = true;
        response.json({ 'status': 'ok' })
    } else {
        response.json({
            'status': 'failed',
            'message': `Can not authenticate signature!, ${JSON.stringify(result)}`
        })
    }
})

module.exports = router;