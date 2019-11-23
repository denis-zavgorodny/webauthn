const createCredentialDefaultArgs = (name, username, id, challenge) => ({
  publicKey: {
      // Relying Party (a.k.a. - Service):
      rp: {
          name: "Home test"
      },

      // User:
      user: {
          id: Uint8Array.from(
            id, c => c.charCodeAt(0)),
          name: name,
          displayName: username
      },

      pubKeyCredParams: [{
          type: "public-key",
          alg: -7
      }],

      attestation: "direct",

      timeout: 60000,

      challenge: Uint8Array.from(
        challenge, c => c.charCodeAt(0)),
  }
});

export default createCredentialDefaultArgs;