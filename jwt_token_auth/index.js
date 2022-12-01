const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const port = 3000;

const jwt = require('jsonwebtoken');

const FAIL_COUNT = 3;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = 'Authorization';
const prKey = 'banana';
const attempts= {};

function sign(myData){
    return jwt.sign(myData, prKey, {expiresIn: '1h'});
}

function verify(token){
    try{return jwt.verify(token, prKey)}
    catch(e){ return null}
}

function getUserNameByToken(token){
    const tmp = verify(token);
    if (tmp){
        const tmpUs = users.find(el => el.login === tmp.login)
        if (tmpUs){ return tmpUs.username}
    }
    return null;
}

app.use((req, res, next) => {
    let sessionId = req.get(SESSION_KEY);

    req.username = getUserNameByToken(sessionId);
    req.sessionId = sessionId;

    next();
});

app.get('/', (req, res) => {
    if (req.username) {
        return res.json({
            username: req.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/logout', (req, res) => {
    res.redirect('/');
});

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
    },
    {
        login: 'Shults',
        password: 'banana',
        username: 'Sophia',
    }
]

class Attempts{
    #attempts = [];

    constructor() {
        try {
            this.#attempts = fs.readFileSync('./attempts.json', 'utf8');
            this.#attempts = JSON.parse(this.#attempts.trim());
            this.#attempts.forEach(el => {
                if (el.timeout > Date.nov()) {
                    el.timeout=0;
                    el.count=0;
                }
            })

        } catch(e) {
            this.#attempts = [];
            users.forEach(ele => this.addNew(ele.login))
        }
    }

    #storeAttempts() {
        fs.writeFileSync('./attempts.json', JSON.stringify(this.#attempts), 'utf-8');
    }

    addNew(login){
        this.#attempts.push({login: login, count: 0, timeout: null})
    }

    markUnvalid(login) {
        this.#attempts.forEach(el => {
            if (el.login==login) {
                el.count+=1;
                if (el.count > FAIL_COUNT){
                    var t = new Date();
                    t.setSeconds(t.getSeconds() + 10);
                    el.timeout=t;
                }
            }
        });
        this.#storeAttempts();
    }

    reset(login) {
        this.#attempts.forEach(el => {
            if (el.login==login) {
                el.count = 0;
                el.timeout = null;
            }
        })
        this.#storeAttempts();
    }

    getByName(login){
        return this.#attempts.find(el => el.login==login);
    }
}

const att = new Attempts;

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const user = users.find((user) => { 
        if (user.login == login){
            const d = att.getByName(login);
            if (d.timeout && d.timeout > Date.now()) {
                console.log('You can\'t login, wait '+(d.timeout-Date.now())/1000+' sec.');
                res.statusMessage = d.timeout;
                return false;
            }
            else if (d.timeout && d.timeout <= Date.now()) att.reset(login);
            
            if (!d.time){
                if (user.password != password) att.markUnvalid(login);
                else {att.reset(login); return true;}
            }
            
        }
        return false;
    });

    if (user) {
        const token = sign({login: user.login, username: user.username});
        console.log("Good token: "+token)
        res.json({ token: token});
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
