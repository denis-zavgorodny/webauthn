import base64url from "base64url";
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
    const credentials = createCredentialDefaultArgs(res.user.name, res.user.displayName, res.user.id, res.challenge);
    navigator.credentials.create(credentials)
      .then((cred) => {
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
          ).then(res => res.json()).then(response => {
            if(response.status === 'ok') alert('we created a key');
          });
      })
});
