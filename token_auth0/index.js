const uuid = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const request = require("request");
const port = 3000;
const fs = require('fs');
const { auth } = require("express-oauth2-jwt-bearer");

const checkJwt = auth({
    audience: 'https://dev-8bdqod1kanjb11s5.eu.auth0.com/api/v2/',
    issuerBaseURL: 'https://dev-8bdqod1kanjb11s5.eu.auth0.com',
});
const taskData={url_get:"https://dev-8bdqod1kanjb11s5.eu.auth0.com/oauth/token", 
client_id:"FWPaQcMoycqcyzRomU9HNn5pjvAQbK0V", 
client_secret:"d59djhBqaaiMnNqFKXFAL8ljiCXH0gxv0tnIoiyU-dIuGFqMAixp8CMJuj6EO9h1",
audience: 'https://dev-8bdqod1kanjb11s5.eu.auth0.com/api/v2/',
issuerBaseURL: 'https://dev-8bdqod1kanjb11s5.eu.auth0.com/',
url_create:"https://dev-8bdqod1kanjb11s5.eu.auth0.com/api/v2/users"};

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/additional', express.static('additional'));

const myJWTCheck = (req, res, next)=>{
    checkJwt(req,res,(err)=>{
    console.log(err.status);
    next();
});
}

const SESSION_KEY = 'Authorization';

app.use((req, res, next) => {
    let currentSession = {};
    let sessionId = req.get(SESSION_KEY);

    req.session = currentSession;
    req.sessionId = sessionId;
    next();
});

app.get('/', checkJwt, (req, res) => {
    let body_obj;
    try{
        body_obj=parseJwt(req.sessionId);
    } catch(err){}
    if (body_obj) {
        return res.send({
            username: body_obj.sub,
            logout: 'http://localhost:3000/logout'
        })
    }
    return res.sendFile(path.join(__dirname+'/index.html'));
})

app.post('/', checkJwt, (req,res) =>{
    let body_obj;
    try{
        body_obj=parseJwt(req.sessionId);
    } catch(err){}
    if (body_obj){
        var options = { method: 'POST',
        url: taskData.url_get,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form:{ 
            grant_type: 'refresh_token',
            client_id: taskData.client_id,
            client_secret: taskData.client_secret,
            refresh_token: req.body.refresh_token}
    };

    request(options, function (error, response, body) {
        if (error) {res.status(401).send();throw new Error(error);}
        let ans=JSON.parse(body); 
        body_obj=parseJwt(ans.access_token);
        console.log("User get new token!");
        return res.json({token: ans.access_token, refresh_token:req.body.refresh_token, username:body_obj.sub})
    });
    }
    return ;
})

function parseJwt (token) {
    return JSON.parse((Buffer.from(token.split('.')[1], 'base64')).toString());
}

app.get('/logout', (req, res) => {
    sessions.destroy(req, res);
    res.redirect('/');
});

app.get('/signup', (req,res)=>{
    res.sendFile(path.join(__dirname+'/index2.html'));
})

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    loginUser(login,password, req,res);
});

function loginUser(login, password, req,res){
    var tokens={token: null, refresh_token:null};
    var options = { method: 'POST',
    url: taskData.url_get,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form:{ 
        grant_type:"password", 
        username: login,
        password: password,
        scope: 'offline_access', 
        client_id: taskData.client_id,
        client_secret: taskData.client_secret,
        audience: taskData.audience,
    }};
    request(options, function (error, response, body) {
        console.log("fff\n"+JSON.parse(body).error);
        if (JSON.parse(body).error) {return res.status(401).send();}
        let body_obj=JSON.parse(response.body); 
        tokens.token=body_obj.access_token;
        tokens.refresh_token=body_obj.refresh_token;
        if (tokens.token) {
            const tmp = parseJwt(tokens.token);
            console.log("User login!");
            return res.json({ token: tokens.token, refresh_token: tokens.refresh_token, username: tmp.sub });
        }
    });
}

app.post('/api/singup', (req,res)=>{
    var options = { method: 'POST',
    url: taskData.url_get,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form:{   
        client_id: taskData.client_id,
        client_secret: taskData.client_secret,
        audience: taskData.audience,
        grant_type: 'client_credentials'
    }};

    request(options, async function (error, response, body) {
        if (error) {return res.status(501).send()}
        else{
            let body_obj=JSON.parse(body); 
            let token_d=body_obj.token_type+" "+body_obj.access_token;
            createUser(req,res,token_d);
        }
    });
})

function createUser(req, res, token_d){
    const { nikname,password,given_name,family_name,email } = req.body;
    var user_id = "Ip9"+Math.round(Math.random()*10)+"user"+Math.round(Math.random()*6000); 
    var name=given_name+" "+family_name;
    var options = { method: 'POST',
    url: taskData.url_create,
    headers: { 'content-type': 'application/json',
        'Authorization': token_d
    },
    body: JSON.stringify({   
        "email": email,
        "user_metadata": {},
        "blocked": false,
        "email_verified": false,
        "app_metadata": {},
        "given_name": given_name,
        "family_name": family_name,
        "name": name,
        "nickname": nikname,
        "picture": "https://secure.gravatar.com/avatar/15626c5e0c749cb912f9d1ad48dba440?s=480&r=pg&d=https%3A%2F%2Fssl.gstatic.com%2Fs2%2Fprofiles%2Fimages%2Fsilhouette80.png",
        "user_id": user_id,
        "connection": "Username-Password-Authentication",
        "password": password,
        "verify_email": false
    })};

    request(options, function (error, response, body) {
        if (error || JSON.parse(response.body).statusCode>=300) {return res.status(400).send();}
        else{
            console.log("User created!");
            loginUser(email, password, req,res);
        }
    });
}

app.listen(port, () => {
    console.log(`Example auth0 app listening on port ${port}`)
})

app.use(function(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
       return res.sendFile(path.join(__dirname+'/index.html'));
    }

    next(err, req, res);
});