import createCredentialDefaultArgs from './create-credentials';
import publicKeyCredentialToJSON from './public-key-credential-to-json';

const registerUser = (name) => {
  // get 
  fetch(
    'http://localhost:3000/webauthn/register',
    {
      method: 'POST', 
      body: JSON.stringify({
        name,
        username: name
      }),
      credentials: "same-origin",
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    }
    ).then(response => response.json()).then(res => {
      if(res.status == 'failed') {
        alert(res.message);
        return;
      }
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
              if(response.status === 'OK') alert('User has been created');
            });
        })
  });
}

export default registerUser;