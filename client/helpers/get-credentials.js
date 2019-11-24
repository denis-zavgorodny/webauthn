import base64url from "base64url";


const getCredentialDefaultArgs = (challenge, allowCredentials) => {
  return {
    publicKey: {
      allowCredentials: [{
        ...allowCredentials[0],
        id: base64url.toBuffer(allowCredentials[0].id),
      }],
      timeout: 60000,
      challenge: Uint8Array.from(challenge, c => c.charCodeAt(0)),
    }
  }
}

export default getCredentialDefaultArgs;