import registerUser from './client/helpers/register-user';
import authorizeUser from './client/helpers/authorize-user';

document.getElementById('registrationButton').addEventListener('click', (event) => {
  const name = document.getElementById('login').value;
  if(!name) alert('name should not be empty');
  registerUser(name);
});

document.getElementById('authorizationButton').addEventListener('click', (event) => {
  const name = document.getElementById('login').value;
  if(!name) alert('name should not be empty');
  authorizeUser(name);
});



