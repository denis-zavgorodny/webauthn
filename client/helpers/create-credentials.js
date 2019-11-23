const createCredentialDefaultArgs = (str) => ({
  publicKey: {
      // Relying Party (a.k.a. - Service):
      rp: {
          name: "Home test"
      },

      // User:
      user: {
          id: new Uint8Array(16),
          name: "denis.zavgorodny@gmail.com",
          displayName: "Denis Zavgorodny"
      },

      pubKeyCredParams: [{
          type: "public-key",
          alg: -7
      }],

      attestation: "direct",

      timeout: 60000,

      challenge: Uint8Array.from(
        str, c => c.charCodeAt(0)),
  }
});

export default createCredentialDefaultArgs;