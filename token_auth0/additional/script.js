const session = sessionStorage.getItem('session');

let token;

var loginForm = document.getElementById("login-form");
var loginButton = document.getElementById("login-form-submit");
var loginErrorMsg = document.getElementById("login-error-msg");
var logoutLink =  document.getElementById("logout");

window.onload = (event) => {
    loginForm = document.getElementById("login-form");
    loginButton = document.getElementById("login-form-submit");
    loginErrorMsg = document.getElementById("login-error-msg");
    logoutLink =  document.getElementById("logout");

    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem('session');
        location.reload();
    });
    
    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        const login = loginForm.login.value;
        const password = loginForm.password.value;
    
    
        axios({
            method: 'post',
            url: '/api/login',
            data: {
                login,
                password
            }
        }).then((response) => {
            const { username } =  response.data;
            sessionStorage.setItem('session', JSON.stringify(response.data));
            location.reload();
        }).catch((response) => {
            loginErrorMsg.style.opacity = 1;
        });
    })

    try {
        token = JSON.parse(session).token;
    } catch(e) {}
    
    if (token) {
        let tokenData=parseJwt(token);
        if ((tokenData.exp-Date.now()/1000)<(tokenData.exp-tokenData.iat)/4){
            refreshTokens(token);
        }
        else getData(token);
        
    }
}

function getData(token){
    console.log(JSON.parse(session).token);
    axios.get('/', {
        headers: {
            Authorization: "Bearer "+token
        }
    }).then((response) => {
        const { username } = response.data;

        if (username) {
            const mainHolder = document.getElementById("main-holder");
            const loginHeader = document.getElementById("login-header");

            loginForm.remove();
            loginErrorMsg.remove();
            loginHeader.remove();

            mainHolder.append(`Hello ${username}`);
            logoutLink.style.opacity = 1;
        }
    });
}

function refreshTokens(token){
    axios({
        method: 'post',
        url: '/',
        headers: {
            Authorization: "Bearer "+token
        },
        data: {
            refresh_token: JSON.parse(session).refresh_token
        }
    }).then((response)=>{
        const { username } =  response.data;
        sessionStorage.setItem('session', JSON.stringify(response.data));
        
        console.log("ref\n"+JSON.parse(session).token);
        getData(JSON.parse(session).token)  
    })
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}