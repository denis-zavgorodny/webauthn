import createCredentialDefaultArgs from './client/helpers/create-credentials';


// get 
fetch('http://localhost:3000/webauthn/hello').then(request => request.json()).then(res => {
  const credentials = createCredentialDefaultArgs(res.randomString);
  
  navigator.credentials.create(credentials)
    .then((cred) => {
        console.log("NEW CREDENTIAL", cred);

        // normally the credential IDs available for an account would come from a server
        // but we can just copy them from above...
    })
});