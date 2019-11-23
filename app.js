import createCredentialDefaultArgs from './client/helpers/create-credentials';
import publicKeyCredentialToJSON from './client/helpers/public-key-credential-to-json';


// get 
fetch(
  'http://localhost:3000/webauthn/register',
  {
    method: 'POST', 
    body: JSON.stringify({
      name: 'denis',
      username: 'denis'
    }),
    credentials: "same-origin",
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors'
  }
  ).then(response => response.json()).then(res => {
    alert(res.challenge);
    const credentials = createCredentialDefaultArgs(res.user.name, res.user.displayName, res.user.id, res.challenge);
    
    navigator.credentials.create(credentials)
      .then((cred) => {
          console.log("NEW CREDENTIAL", cred);
          fetch(
            'http://localhost:3000/webauthn/response',
            {
              method: 'POST', 
              credentials: "same-origin",
              body: JSON.stringify(publicKeyCredentialToJSON(cred)),
              headers: {
                'Content-Type': 'application/json'
              },
              mode: 'cors'
            }
          ).then();
          
          
          //id, rawId, response, type
          // normally the credential IDs available for an account would come from a server
          // but we can just copy them from above...
      })
});
