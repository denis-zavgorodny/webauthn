
const createCredentialDefaultArgs = (name, username, id, challenge) => ({
  publicKey: {
    rp: {
      name: "Home test"
    },

    // User:
    user: {
      id: Uint8Array.from(id, c => c.charCodeAt(0)),
      name: name,
      displayName: username
    },

    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
    authenticatorSelection: {
      //   authenticatorAttachment: "cross-platform", //platform
      // Try to use UV if possible. This is also the default.
      //   userVerification: "required",
      //requireResidentKey: true,
    },
    timeout: 60000,
    challenge: Uint8Array.from(challenge, c => c.charCodeAt(0)),
    attestation: "direct",
  }
});

export default createCredentialDefaultArgs;
