const CBOR = require('cbor');
const util1 = require('util');
const express   = require('express');
const utils     = require('../utils');
const config    = require('../config.json');
const base64url = require('base64url');
const router    = express.Router();
const database  = require('./db');
const simpleSession  = require('./session');
const ECKey = require("ec-key");
const helpers = require('../helpers');
const NodeRSA = require("node-rsa");
const crypto = require("crypto");

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

router.post('/register-response', (request, response) => {
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
    const _challenge = base64url.toBuffer(clientData.challenge);

    /* Check challenge... */
    if(_challenge != simpleSession.challenge) {
        response.json({
            'status': 'failed',
            'message': `Challenges don\'t match! ${_challenge} but ${simpleSession.challenge}`
        })
        return
    }

    const decodedAttestationObj = CBOR.decode(
        base64url.toBuffer(webauthnResp.response.attestationObject));

    const { authData } = decodedAttestationObj;

    // get the length of the credential ID
    const dataView = new DataView(new ArrayBuffer(2));
    const idLenBytes = authData.slice(53, 55);
    idLenBytes.forEach((value, index) => dataView.setUint8(index, value));
    const credentialIdLength = dataView.getUint16();
    // get the credential ID
    const credentialId = authData.slice(55, credentialIdLength);
    // get the public key object
    const publicKeyBytes = authData.slice(55 + credentialIdLength);
    // the publicKeyBytes are encoded again as CBOR
    const publicKeyObject = CBOR.decode(publicKeyBytes);

    const key = helpers.getKey(webauthnResp);

    const key2 = new NodeRSA();
    // key2.importKey(key.keyString, "pkcs8");
    // console.log(publicKeyObject);
    // console.log(utils.COSEECDHAtoPKCS(publicKeyBytes).toString('base64'));
    // crypto.createPublicKey(
    //   utils.COSEECDHAtoPKCS(publicKeyBytes).toString("base64")
    // );
    const key2String = utils.ASN1toPEM(utils.COSEECDHAtoPKCS(publicKeyBytes));
    // key2.importKey(utils.COSEECDHAtoPKCS(publicKeyBytes), "pkcs8-public");
    // crypto.createPublicKey(key2String);

    //key.key.verify(data, signature);
    // console.log(publicKeyObject);
    // console.log(key.getPublic());

    database[simpleSession.username].authenticators.push({
      publicKeyBytes,
      publicKeyObject,
      credentialId,
      key: {
        ...key,
        key2String
      },
      rawId: webauthnResp.rawId
    });
    database[simpleSession.username].registered = true

    console.error('=============================')
    console.error('=============================')
    console.error(database)
    console.error('=============================')
    console.error('=============================')

    response.json({
      status: "OK",
      message: "OK",
      key: key2String
    });

})


router.post('/login-response', (request, response) => {
    if(!request.body       || !request.body.id
    || !request.body.rawId || !request.body.response
    || !request.body.type  || request.body.type !== 'public-key' ) {
        response.json({
            'status': 'failed',
            'message': 'Response missing one or more of id/rawId/response/type fields, or type is not public-key!'
        })

        return
    }

    let webauthnResp = request.body;

    const result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, database[simpleSession.username].authenticators);
    delete database[simpleSession.username];
    response.json({
      ...result,
      status: "OK",
      data: webauthnResp
    });

})

module.exports = router;
