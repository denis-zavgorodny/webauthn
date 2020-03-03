import registerUser from './client/helpers/register-user';
import authorizeUser from './client/helpers/authorize-user';

document.getElementById('registerForm').addEventListener('submit', (event) => {
  event.preventDefault();
  event.stopPropagation();
  const name = document.getElementById('login').value;
  if(!name) alert('name should not be empty');
  registerUser(name);
});



document.getElementById('loginForm').addEventListener('submit', (event) => {
  event.preventDefault();
  event.stopPropagation();
  const name = document.getElementById("login1").value;
  if(!name) alert('name should not be empty');
  authorizeUser(name);
});



