import getCredentialDefaultArgs from './get-credentials';
import publicKeyCredentialToJSON from './public-key-credential-to-json';

const authorizeUser = (name) => {
  fetch(
    'http://localhost:3000/webauthn/login',
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
      const { allowCredentials, challenge } = res;
      const credentials = getCredentialDefaultArgs(challenge, allowCredentials);
      navigator.credentials.get(credentials).then(assertion => {
        // assertion has been created
          fetch(
            'http://localhost:3000/webauthn/login-response',
            {
              method: 'POST', 
              credentials: "same-origin",
              body: JSON.stringify(publicKeyCredentialToJSON(assertion)),
              headers: {
                'Content-Type': 'application/json'
              },
              mode: 'cors'
            }
          ).then(res1 => res1.json()).then(response => {
            if(response.status === 'OK') {
              document.getElementById('info').innerText = `User has been authrized`;
            }
          });
      }).catch(e => console.log(e));
      
  });
}

export default authorizeUser;