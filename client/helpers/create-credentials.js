
const createCredentialDefaultArgs = (name, username, id, challenge) => ({
  publicKey: {
      // Relying Party (a.k.a. - Service):
      rp: {
          name: "Home test"
      },

      // User:
      user: {
          id: Uint8Array.from(id, c => c.charCodeAt(0)),
          name: name,
          displayName: username
      },

      pubKeyCredParams: [{alg: -7, type: "public-key"}],
      authenticatorSelection: {
          authenticatorAttachment: "platform",
      },
      authenticatorSelection: {
        // Try to use UV if possible. This is also the default.
        userVerification: "preferred"
      },
      timeout: 60000,
      challenge: Uint8Array.from(challenge, c => c.charCodeAt(0)),
  }
});

export default createCredentialDefaultArgs;