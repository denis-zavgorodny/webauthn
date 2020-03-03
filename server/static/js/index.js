import registerUser from "./helpers/register-user";
import authorizeUser from "./helpers/authorize-user";

document.getElementById("registerForm").addEventListener("submit", event => {
  event.preventDefault();
  event.stopPropagation();
  const name = document.getElementById("login").value;
  if (!name) alert("name should not be empty");
  registerUser(name);
});

document.getElementById("loginForm").addEventListener("submit", event => {
  event.preventDefault();
  event.stopPropagation();
  const name = document.getElementById("login1").value;
  if (!name) alert("name should not be empty");
  authorizeUser(name);
});

window.j2h = {
  toggleVisibility: function(el, name) {
    window.j2h.toggleClass(el.parentElement, "j2hcollapse j2hexpand");
  },
  classRe: function(name) {
    return new RegExp("(?:^|\\s)" + name + "(?!\\S)");
  },
  addClass: function(el, name) {
    el.className += " " + name;
  },
  removeClass: function(el, name) {
    var re = window.j2h.classRe(name);
    el.className = el.className.replace(window.j2h.classRe(name), "");
  },
  hasClass: function(el, name) {
    var re = window.j2h.classRe(name);
    return window.j2h.classRe(name).exec(el.className);
  },
  toggleClass: function(el, name) {
    var names = name.split(/\s+/);
    const keys = Object.keys(names);
    keys.map(key => {
        if (window.j2h.hasClass(el, names[key])) {
          window.j2h.removeClass(el, names[key]);
        } else {
          window.j2h.addClass(el, names[key]);
        }
    });

  }
};
