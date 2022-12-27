var request = require("request");

let env={isChangePass:false, isMyData:false}

const task1={url_get:"https://kpi.eu.auth0.com/oauth/token", 
client_id:"JIvCO5c2IBHlAe2patn6l6q5H35qxti0", 
client_secret:"ZRF8Op0tWM36p1_hxXTU-B0K_Gq_-eAVtlrQpY24CasYiDmcXBhNS6IJMNcz1EgB",
username: "sonya.shu2107@gmail.com",
password: "BAnanaBAnana1",
password_new: "BAnanaBAnana2",
audience:"https://kpi.eu.auth0.com/api/v2/",
url_chpass:'https://kpi.eu.auth0.com/api/v2/users/auth0|ip96user26',
token:"",
refresh_token:"",
token_v2:""};
const task2={url_get:"https://dev-8bdqod1kanjb11s5.eu.auth0.com/oauth/token", 
client_id:"FWPaQcMoycqcyzRomU9HNn5pjvAQbK0V", 
client_secret:"d59djhBqaaiMnNqFKXFAL8ljiCXH0gxv0tnIoiyU-dIuGFqMAixp8CMJuj6EO9h1",
username: "sonya.shu2107@gmail.com",
password: "BAnanaBAnana1",
password_new: "BAnanaBAnana2",
audience:"https://dev-8bdqod1kanjb11s5.eu.auth0.com/api/v2/",
url_chpass:'https://dev-8bdqod1kanjb11s5.eu.auth0.com/api/v2/users/auth0|ip96user26',
token:"",
refresh_token:"",
token_v2:""};

process.argv.forEach(el => {
    if (el=="-cp") env.isChangePass=true;
    if (el=="-md") env.isMyData=true;
})

if(env.isMyData)
    getToken(task2);
else 
    getToken(task1);

function getToken(taskData){
    var options = { method: 'POST',
    url: taskData.url_get,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form:{ 
        grant_type:"password", 
        username: taskData.username,
        password: taskData.password,
        scope: 'offline_access', 
        client_id: taskData.client_id,
        client_secret: taskData.client_secret,
        audience: taskData.audience,
    }};

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        let body_obj=JSON.parse(body); 
        taskData.token=body_obj.token_type+" "+body_obj.access_token;
        taskData.refresh_token=body_obj.refresh_token;
        console.log("\nYour token:");
        console.log(taskData.token);

        console.log("\nYour refresh token:");
        console.log(taskData.refresh_token);

        getWithRefreshToken(taskData);
    });
}

function getWithRefreshToken(taskData) {
    var options = { method: 'POST',
        url: taskData.url_get,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form:{ 
            grant_type: 'refresh_token',
            client_id: taskData.client_id,
            client_secret: taskData.client_secret,
            refresh_token: taskData.refresh_token}
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        let body_obj=JSON.parse(body); 
        console.log("You new token:");
        console.log(body_obj.access_token);
        if (env.isChangePass) getToken_v2(taskData);
    });
}

function getToken_v2(taskData){
    var options = { method: 'POST',
    url: taskData.url_get,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form:{   
        client_id: taskData.client_id,
        client_secret: taskData.client_secret,
        audience: taskData.audience,
        grant_type: 'client_credentials'
    }};

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        let body_obj=JSON.parse(body); 
        taskData.token_v2=body_obj.token_type+" "+body_obj.access_token;
        console.log("\nYour token v2:");
        console.log(taskData.token_v2);
        changePass(taskData);
    });
}

function changePass(taskData){
    var options = {
        method: 'PATCH',
        url: taskData.url_chpass,
        headers: {
          'content-type': 'application/json',
          authorization: taskData.token_v2
        },
        form: {
            password: taskData.password_new, 
            connection: 'Username-Password-Authentication'
        }
    };
      
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body)
    });
}