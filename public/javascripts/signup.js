const REGISTER = 30;

const DOM = (function(){
    document.addEventListener("DOMContentLoaded", function (){
        const form = document.getElementById("signUpForm");
        fillFormWithCookies();

        form.addEventListener("submit", function(e){
            e.preventDefault();
            const email = document.getElementById("email").value;
            const firstName = document.getElementById("first-name").value;
            const lastName = document.getElementById("last-name").value;

            setCookie("email", email, REGISTER);
            setCookie("first_name", firstName, REGISTER);
            setCookie("last_name", lastName, REGISTER);
            form.submit();
        })
    })
    function setCookie(name, value, seconds) {
        const date = new Date();
        date.setTime(date.getTime() + (seconds * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = `${name}=${value}; ${expires}; path=/`;
    }

    function fillFormWithCookies() {
        const email = getCookie("email");
        const firstName = getCookie("first_name");
        const lastName = getCookie("last_name");

        if (email) {
            document.getElementById("email").value = email;
        }
        if (firstName) {
            document.getElementById("first-name").value = firstName;
        }
        if (lastName) {
            document.getElementById("last-name").value = lastName;
        }
    }

    function getCookie(name) {
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            const [key, value] = cookie.split("=");
            if (key === name) {
                return value;
            }
        }
        return null;
    }

    return{};
}());





