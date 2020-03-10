const CBOR = require('cbor');
const express   = require('express');
const utils     = require('../utils');
const base64url = require('base64url');
const router    = express.Router();
const database  = require('./db');
const simpleSession  = require('./session');
const helpers = require('../helpers');

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
    console.error('>');
    console.error('>');
    console.error('>');
    console.error('>');
    console.error('>');
    console.error('>');
    console.error('>');
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
    console.error('========clientData======');
    console.error(clientData);
    console.error('========clientData======');
    try {
       const resVerify = helpers.verifyPackedAttestation(webauthnResp);
       if(resVerify) {
           console.error('!!!!!!!!!!!!')
           console.error('!!!KEY VERIFIED!!!')
           console.error('!!!!!!!!!!!!')
       }
    } catch (error) {
        console.error(error);
        console.error("!!!!!!!!!!!!");
        console.error("!!!KEY IS NOT VERIFIED!!!");
        console.error("!!!!!!!!!!!!");
    }



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

    const { authData, attStmt, fmt } = decodedAttestationObj;

    console.error('attStmt', attStmt);
    console.error('fmt', fmt);

    let rpIdHash = authData.slice(0, 32);
    buffer = authData.slice(32);
    /* Flags */
    let flagsBuffer = buffer.slice(0, 1);
    buffer = buffer.slice(1);
    let flagsInt = flagsBuffer[0];
    let up = !!(flagsInt & 0x01); // Test of User Presence
    let uv = !!(flagsInt & 0x04); // User Verification
    let at = !!(flagsInt & 0x40); // Attestation data
    let ed = !!(flagsInt & 0x80); // Extension data
    let flags = { up, uv, at, ed, flagsInt };
    console.error(flags);

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
    console.log(publicKeyObject);

    const keyString = utils.ASN1toPEM(utils.COSEECDHAtoPKCS(publicKeyBytes));


    database[simpleSession.username].authenticators.push({
      publicKeyBytes,
      publicKeyObject,
      credentialId,
      keyString,
      rawId: webauthnResp.rawId
    });
    database[simpleSession.username].registered = true;

    request.session.user = {
        login: simpleSession.username
    };

    console.error('=============================')
    console.error('=============================')
    console.error(database)
    console.error('=============================')
    console.error('=============================')

    response.json({
      status: "OK",
      message: "OK",
      key: keyString,
      database
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

    request.session.user = {
      login: simpleSession.username
    };
    response.json({
      ...result,
      status: "OK",
      data: webauthnResp
    });

})

module.exports = router;
