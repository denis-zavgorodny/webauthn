const base64url = require("base64url");
const ECKey = require("ec-key");
const cbor = require("cbor");
const crypto = require("crypto");
const elliptic = require("elliptic");

const COSEALGHASH = {
  "-257": "sha256",
  "-258": "sha384",
  "-259": "sha512",
  "-65535": "sha1",
  "-39": "sha512",
  "-38": "sha384",
  "-37": "sha256",
  "-260": "sha256",
  "-261": "sha512",
  "-7": "sha256",
  "-36": "sha384",
  "-37": "sha512"
};

const COSEKEYS = {
  kty: 1,
  alg: 3,
  crv: -1,
  x: -2,
  y: -3,
  n: -1,
  e: -2
};

const COSERSASCHEME = {
  "-3": "pss-sha256",
  "-39": "pss-sha512",
  "-38": "pss-sha384",
  "-65535": "pkcs1-sha1",
  "-257": "pkcs1-sha256",
  "-258": "pkcs1-sha384",
  "-259": "pkcs1-sha512"
};

const COSECRV = {
  "1": "p256",
  "2": "p384",
  "3": "p521"
};

const COSEKTY = {
  OKP: 1,
  EC2: 2,
  RSA: 3
};

const hash = (alg, message) => {
  return crypto
    .createHash(alg)
    .update(message)
    .digest();
};

const base64ToPem = b64cert => {
  let pemcert = "";
  for (let i = 0; i < b64cert.length; i += 64)
    pemcert += b64cert.slice(i, i + 64) + "\n";

  return (
    "-----BEGIN CERTIFICATE-----\n" + pemcert + "-----END CERTIFICATE-----"
  );
};


const parseAuthData = buffer => {
  let rpIdHash = buffer.slice(0, 32);
  buffer = buffer.slice(32);
  let flagsBuf = buffer.slice(0, 1);
  buffer = buffer.slice(1);
  let flagsInt = flagsBuf[0];
  let flags = {
    up: !!(flagsInt & 0x01),
    uv: !!(flagsInt & 0x04),
    at: !!(flagsInt & 0x40),
    ed: !!(flagsInt & 0x80),
    flagsInt
  };

  let counterBuf = buffer.slice(0, 4);
  buffer = buffer.slice(4);
  let counter = counterBuf.readUInt32BE(0);

  let aaguid = undefined;
  let credID = undefined;
  let COSEPublicKey = undefined;

  if (flags.at) {
    aaguid = buffer.slice(0, 16);
    buffer = buffer.slice(16);
    let credIDLenBuf = buffer.slice(0, 2);
    buffer = buffer.slice(2);
    let credIDLen = credIDLenBuf.readUInt16BE(0);
    credID = buffer.slice(0, credIDLen);
    buffer = buffer.slice(credIDLen);
    COSEPublicKey = buffer;
  }

  return {
    rpIdHash,
    flagsBuf,
    flags,
    counter,
    counterBuf,
    aaguid,
    credID,
    COSEPublicKey
  };
};


const getKey = webAuthnResponse => {
  let attestationBuffer = base64url.toBuffer(
    webAuthnResponse.response.attestationObject
  );
  let attestationStruct = cbor.decodeAllSync(attestationBuffer)[0];

  let authDataStruct = parseAuthData(attestationStruct.authData);

  let clientDataHashBuf = hash(
    "sha256",
    base64url.toBuffer(webAuthnResponse.response.clientDataJSON)
  );
  let signatureBaseBuffer = Buffer.concat([
    attestationStruct.authData,
    clientDataHashBuf
  ]);

  let signatureBuffer = attestationStruct.attStmt.sig;
  let signatureIsValid = false;

  if (attestationStruct.attStmt.x5c) {
    throw new Error("ECDAA IS NOT SUPPORTED YET!");
  } else if (attestationStruct.attStmt.ecdaaKeyId) {
    throw new Error("ECDAA IS NOT SUPPORTED YET!");
  } else {
    /* ----- Verify SURROGATE attestation ----- */
    let pubKeyCose = cbor.decodeAllSync(authDataStruct.COSEPublicKey)[0];
    let hashAlg = COSEALGHASH[pubKeyCose.get(COSEKEYS.alg)];
    if (pubKeyCose.get(COSEKEYS.kty) === COSEKTY.EC2) {
      let x = pubKeyCose.get(COSEKEYS.x);
      let y = pubKeyCose.get(COSEKEYS.y);

      let ansiKey = Buffer.concat([Buffer.from([0x04]), x, y]);

      let ec = new elliptic.ec(COSECRV[pubKeyCose.get(COSEKEYS.crv)]);
      let key = ec.keyFromPublic(ansiKey);

      return key;
    } else if (pubKeyCose.get(COSEKEYS.kty) === COSEKTY.RSA) {
      let signingScheme = COSERSASCHEME[pubKeyCose.get(COSEKEYS.alg)];

      let key = new NodeRSA(undefined, { signingScheme });
      key.importKey(
        {
          n: pubKeyCose.get(COSEKEYS.n),
          e: 65537
        },
        "components-public"
      );

      return key;
    } else if (pubKeyCose.get(COSEKEYS.kty) === COSEKTY.OKP) {
      let x = pubKeyCose.get(COSEKEYS.x);

      let key = new elliptic.eddsa("ed25519");
      key.keyFromPublic(x);

      return key;
    }
  }
  return null;
};

module.exports = { getKey };
