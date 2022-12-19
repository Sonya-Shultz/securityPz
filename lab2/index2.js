var request = require("request");

let env={isCreateUser:false, isSecTask:false}

const task1={url_get:"https://kpi.eu.auth0.com/oauth/token", 
client_id:"JIvCO5c2IBHlAe2patn6l6q5H35qxti0", 
client_secret:"ZRF8Op0tWM36p1_hxXTU-B0K_Gq_-eAVtlrQpY24CasYiDmcXBhNS6IJMNcz1EgB",
audience:"https://kpi.eu.auth0.com/api/v2/",
url_create:"https://kpi.eu.auth0.com/api/v2/users",
token:""};
const task2={url_get:"https://dev-8bdqod1kanjb11s5.eu.auth0.com/oauth/token", 
client_id:"FWPaQcMoycqcyzRomU9HNn5pjvAQbK0V", 
client_secret:"d59djhBqaaiMnNqFKXFAL8ljiCXH0gxv0tnIoiyU-dIuGFqMAixp8CMJuj6EO9h1",
audience:"https://dev-8bdqod1kanjb11s5.eu.auth0.com/api/v2/",
url_create:"https://dev-8bdqod1kanjb11s5.eu.auth0.com/api/v2/users",
token:""};

process.argv.forEach(el => {
    if (el=="-cu") env.isCreateUser=true;
    if (el=="-t2") env.isSecTask=true;
})

if(env.isSecTask)
    getToken(task2);
else 
    getToken(task1);

function getToken(taskData){
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
        taskData.token=body_obj.token_type+" "+body_obj.access_token;
        console.log("\nYour token:");
        console.log(body);
        if (env.isCreateUser) createUser(taskData);
    });
}

function createUser(taskData){
    var options = { method: 'POST',
    url: taskData.url_create,
    headers: { 'content-type': 'application/json',
        'Authorization': taskData.token
    },
    body: JSON.stringify({   
        "email": "sonya.shu2107@gmail.com",
        "user_metadata": {},
        "blocked": false,
        "email_verified": false,
        "app_metadata": {},
        "given_name": "Sophia",
        "family_name": "Shults",
        "name": "Sophia Shults",
        "nickname": "Alois",
        "picture": "https://secure.gravatar.com/avatar/15626c5e0c749cb912f9d1ad48dba440?s=480&r=pg&d=https%3A%2F%2Fssl.gstatic.com%2Fs2%2Fprofiles%2Fimages%2Fsilhouette80.png",
        "user_id": "ip96user26",
        "connection": "Username-Password-Authentication",
        "password": "BAnanaBAnana1",
        "verify_email": false
    })};

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log("\nYour user responce:");
        console.log(body);
    });
}

