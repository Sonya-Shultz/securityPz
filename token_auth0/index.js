const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const request = require("request");
const port = 3000;
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
domain: "https://dev-8bdqod1kanjb11s5.eu.auth0.com",
url_create:"https://dev-8bdqod1kanjb11s5.eu.auth0.com/api/v2/users"};

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/additional', express.static('additional'));

const SESSION_KEY = 'Authorization';

app.use((req, res, next) => {
    let currentSession = {};
    let sessionId = req.get(SESSION_KEY);
    req.session = currentSession;
    req.sessionId = sessionId;
    next();
});

app.get('/data', checkJwt, (req, res) => {
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
    return res.status(401).send();
})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/data.html'));
})

function parseJwt (token) {
    return JSON.parse((Buffer.from(token.split('.')[1], 'base64')).toString());
}

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Example auth0 app listening on port ${port}`)
})