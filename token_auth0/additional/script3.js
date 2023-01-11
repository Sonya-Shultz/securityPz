const taskData={url_get:"https://dev-8bdqod1kanjb11s5.eu.auth0.com/oauth/token",
client_id:"FWPaQcMoycqcyzRomU9HNn5pjvAQbK0V", 
client_secret:"d59djhBqaaiMnNqFKXFAL8ljiCXH0gxv0tnIoiyU-dIuGFqMAixp8CMJuj6EO9h1",
audience: 'https://dev-8bdqod1kanjb11s5.eu.auth0.com/api/v2/',
issuerBaseURL: 'https://dev-8bdqod1kanjb11s5.eu.auth0.com/',
domain: "https://dev-8bdqod1kanjb11s5.eu.auth0.com",
url_create:"https://dev-8bdqod1kanjb11s5.eu.auth0.com/api/v2/users"};

window.onload = (event) => {
    const session=JSON.parse(sessionStorage.getItem('session'));
    var token = null;
    if (session) token=session.access_token;
    const code = new URLSearchParams(new URL(location.href).search).get('code');
    const loginBtn = document.getElementById("logInAuth0");
    if (!token && code){
        axios({
            method: 'POST',
            url: "https://dev-8bdqod1kanjb11s5.eu.auth0.com/oauth/token",
            headers:{'content-type': "application/json"},
            data: {
                audience: "https://dev-8bdqod1kanjb11s5.eu.auth0.com/api/v2/",
                grant_type: 'authorization_code',
                client_id: "FWPaQcMoycqcyzRomU9HNn5pjvAQbK0V",
                realm: 'Username-Password-Authentication',
                client_secret: "d59djhBqaaiMnNqFKXFAL8ljiCXH0gxv0tnIoiyU-dIuGFqMAixp8CMJuj6EO9h1",
                code: code,
                redirect_uri: 'http://localhost:3000',
            },
            }).then( (response) => {
                sessionStorage.setItem('session', JSON.stringify(response.data));
                location="/";
        }).catch((response) => {
            const text = document.getElementById("errorText");
            text.textContent = "Invalid Code. Try Again";
        });

        // axios({
        //     method: 'get',
        //     url: "/data?code="+code
        // }).then((response) => {
        //     console.log(response.data)
        //     const { username } = response.data;

        //     if (username) {
        //         const mainHolder = document.getElementById("main-holder");
        //         const errorText = document.getElementById("errorText");
        //         const logoutLink = document.getElementById("logout");

        //         mainHolder.append(`Hello ${username}`);
        //         logoutLink.style.opacity = 1;
        //         errorText.style.opacity = 0;
                
        //         sessionStorage.setItem('session', JSON.stringify(response.data));
        //     }
        // }).catch((response) => {
        //     const text = document.getElementById("errorText");
        //     text.textContent = "Some thing went wrong ((((((((("
        // });
    }
    else if (!token && !code) {
        const text = document.getElementById("errorText");
        text.textContent = "No Code. Press LogIn button."
    }
    
    else if (token){
        loginBtn.style.display="none";
        axios.get('/data', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            const { username } = response.data;
    
            if (username) {
                const text = document.getElementById("errorText");
                text.textContent = `Hello ${username}`;
            }
        }).catch((err)=>{
            const text = document.getElementById("errorText");
            text.textContent = "Wrong token";
            loginBtn.style.display="block";
            sessionStorage.removeItem('session');
            location.reload();
        });
    }

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        location.replace(
            'https://dev-8bdqod1kanjb11s5.eu.auth0.com/authorize?client_id=FWPaQcMoycqcyzRomU9HNn5pjvAQbK0V&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code&response_mode=query&audience=https://dev-8bdqod1kanjb11s5.eu.auth0.com/api/v2/'
        );
    });
}