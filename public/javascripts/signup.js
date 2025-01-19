const REGISTER = 30;

const DOM = (function(){
    document.addEventListener("DOMContentLoaded", function (){
        const signUpForm = document.getElementById("signUpForm");
        const passwordForm = document.getElementById("passwordForm");
        const backBtn = document.getElementById("backBtn");

        fillFormWithCookies();

        signUpForm?.addEventListener("submit", function(e){
            const registerData = {
                email: document.getElementById("email").value.trim(),
                firstName: document.getElementById("first-name").value.trim(),
                lastName: document.getElementById("last-name").value.trim()
            };

            setCookie("registerData", registerData, REGISTER);
        })

        backBtn?.addEventListener("click", function(){
            window.location.replace('/signup');
        })


        passwordForm?.addEventListener("submit", function(event){

            const passwords = Array.from(passwordForm.querySelectorAll('[type="password"]'));
            const passwordA = passwords[0].value.trim();
            const passwordB = passwords[1].value.trim();
            const errorMessage = passwordForm.querySelector(".text-danger");
            const registerData = getCookie("registerData");

            if(passwordA !== passwordB || !registerData){
                event.preventDefault();
                if (!registerData){
                    window.location.replace('/signup');
                    errorMessage.innerHTML = 'The registration time was too long, please start registration again.';
                    //this error msg is in the password part
                }
                else{
                    errorMessage.innerHTML = 'The passwords are not matching';
                }
                return;
            }

            passwordForm.querySelector("[name='email']").value = registerData.email;
            passwordForm.querySelector("[name='first_name']").value = registerData.firstName;
            passwordForm.querySelector("[name='last_name']").value = registerData.lastName;

        })

    })

    function setCookie(name, value, seconds) {
        const date = new Date();
        date.setTime(date.getTime() + (seconds * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = `${name}=${JSON.stringify(value)}; ${expires}; path=/`;
    }

    function fillFormWithCookies() {
        const registerData = getCookie("registerData");
        if (registerData) {
            const email = document.getElementById("email");
            const firstName = document.getElementById("first-name");
            const lastName = document.getElementById("last-name");

            if (email) {
                email.value = registerData.email;
            }
            if (firstName) {
                firstName.value = registerData.firstName;
            }
            if (lastName) {
                lastName.value = registerData.lastName;
            }
        }
    }

    function getCookie(name) {
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            const [key, value] = cookie.split("=");
            if (key === name) {
                try {
                    return JSON.parse(value);
                }
                catch (e) {
                    console.error("Error parsing cookie:", e);
                    return null;
                }
            }
        }
        return null;
    }

    return{};
}());





