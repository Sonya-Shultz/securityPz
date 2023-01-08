window.onload = (event) => {
    singupForm = document.getElementById("singup-form");
    singupButton = document.getElementById("singup-form-submit");
    singupErrorMsg = document.getElementById("singup-error-msg");
    
    singupButton.addEventListener("click", (e) => {
        e.preventDefault();
        const nikname = singupForm.nikname.value;
        const email = singupForm.email.value;
        const password = singupForm.password.value;
        const given_name = singupForm.given_name.value;
        const family_name = singupForm.family_name.value;
    
        axios({
            method: 'post',
            url: '/api/singup',
            data: {
                nikname,
                password,
                given_name,
                family_name,
                email
            }
        }).then((response) => {
            sessionStorage.setItem('session', JSON.stringify(response.data));
            //location.reload();
            location.href="/";
        }).catch((response) => {
            singupErrorMsg.style.opacity = 1;
        });
    })
}