const username = localStorage.getItem('name');
const h1 = document.querySelector('h1');
if (username !== null) {
    h1.textContent = h1.textContent + username;
}
else {
    window.location.href = '/';
}
let Logout = (event) => {
    event.preventDefault();
    localStorage.removeItem('name');
    localStorage.removeItem('token');
    window.location.href = '/';
}
const logout = document.querySelectorAll('.logout');
logout.forEach(element => {
    element.addEventListener('click', Logout);
});
let ChangePassword = async (event) => {
    event.preventDefault();
    const newpassword = document.getElementById('pw').value;
    const chgpwURL = '../account/chgpw';
    console.log(newpassword);
    const result = await fetch(chgpwURL, {
        method: 'POST',
        redirect : 'follow',
        headers : {
            'content-type' :　'application/json'
        },
        body : JSON.stringify({
            username,
            newpassword
        })
    }).then((res)=>{return res.json();});
    console.log(result);
}
document.getElementById('form').addEventListener('submit', ChangePassword);