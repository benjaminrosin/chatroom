const DOM = (function(){
    /**
     * Initializes signup form handlers and form auto-fill
     * @listens DOMContentLoaded
     */
    document.addEventListener("DOMContentLoaded", function (){
        const signUpForm = document.getElementById("signUpForm");
        const passwordForm = document.getElementById("passwordForm");
        const backBtn = document.getElementById("backBtn");

        if (signUpForm) {
            fillFormWithCookies();
        }

        backBtn?.addEventListener("click", function(){
            window.location.replace('/signup');
        })

        passwordForm?.addEventListener("submit", function(event){

            const passwords = Array.from(passwordForm.querySelectorAll('[type="password"]'));
            const passwordA = passwords[0].value.trim();
            const passwordB = passwords[1].value.trim();
            const errorMessage = passwordForm.querySelector(".text-danger");

            if(passwordA !== passwordB){
                event.preventDefault();
                errorMessage.innerHTML = 'The passwords are not matching';
            }
        })

    })

    /**
     * Fills signup form fields with stored cookie data
     */
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

    /**
     * Retrieves and parses a cookie value by name
     * @param {string} name - Name of the cookie to retrieve
     * @returns {Object|null} Parsed cookie value or null if not found
     */
    function getCookie(name) {
        if(!document.cookie){
            return null;
        }
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            const [key, value] = cookie.split("=");
            if (key === name) {
                try {
                    return JSON.parse(decodeURIComponent(value));
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





