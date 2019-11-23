import registerUser from './client/helpers/register-user';

document.getElementById('registrationButton').addEventListener('click', (event) => {
  const name = document.getElementById('login').value;
  if(!name) alert('name should not be empty');
  registerUser(name);
});



