const REGISTER = 30;

const DOM = (function(){
    document.addEventListener("DOMContentLoaded", function (){
        const form = document.getElementById("signUpForm");
        fillFormWithCookies();

        form.addEventListener("submit", function(e){
            const registerData = {
                email: document.getElementById("email").value,
                firstName: document.getElementById("first-name").value,
                lastName: document.getElementById("last-name").value
            };

            setCookie("registerData", registerData, REGISTER);
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
            if (registerData.email) {
                document.getElementById("email").value = registerData.email;
            }
            if (registerData.firstName) {
                document.getElementById("first-name").value = registerData.firstName;
            }
            if (registerData.lastName) {
                document.getElementById("last-name").value = registerData.lastName;
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





