const username = localStorage.getItem('name');
const h1 = document.querySelector('h1');
if (username !== null) {
    h1.textContent = h1.textContent + username;
}
else {
    window.location.href = '/';
}
let Logout = (event) => {
    localStorage.removeItem('name');
    localStorage.removeItem('token');
    window.location.reload();
}
document.querySelector('#logout').addEventListener('click', Logout);
