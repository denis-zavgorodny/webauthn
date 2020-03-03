import getCredentialDefaultArgs from './get-credentials';
import publicKeyCredentialToJSON from './public-key-credential-to-json';
const base = `http://${window.location.hostname}:1235`;
const authorizeUser = (name) => {
  fetch(
      base + '/webauthn/login',
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        username: name
      }),
      credentials: 'include',
    //   credentials: "same-origin",
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
        console.log(credentials);
      navigator.credentials.get(credentials).then(assertion => {
          console.log('=====>', assertion);
        // assertion has been created
          fetch(
              base + '/webauthn/login-response',
            {
              method: 'POST',
              credentials: 'include',
            //   credentials: "same-origin",
              body: JSON.stringify(publicKeyCredentialToJSON(assertion)),
              headers: {
                'Content-Type': 'application/json'
              },
              mode: 'cors'
            }
          ).then(res1 => res1.json()).then(response => {
            if (response.status === "OK" && response.verified) {
                document.getElementById(
                "info"
                ).innerText = `User has been authrized`;
                setTimeout(() => {
                    location.href='/';
                }, 1000);
            } else {
                document.getElementById(
                    "info"
                ).innerText = `[ERROR] Access denied`;
            }
          });
      }).catch(e => {
        document.getElementById(
          "info"
          ).innerText = e.toString();
      });

  });
}

export default authorizeUser;
