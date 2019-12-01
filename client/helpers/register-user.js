import createCredentialDefaultArgs from './create-credentials';
import publicKeyCredentialToJSON from './public-key-credential-to-json';
import json2html from "json2html";

const registerUser = (name) => {
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
            console.log("====>", cred);
            fetch(
              'http://localhost:3000/webauthn/register-response',
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
              if(response.status === 'OK') {
                document.getElementById(
                  "info"
                ).innerText = `User ${res.user.id} has been created\n\n${response.key}`;
                document.getElementById(
                  "dump"
                ).innerHTML = `${json2html.render(
                  response.database
                )}</pre>`;
              }
            });
        })
  });
}

export default registerUser;
