
const Dom = (function(){
    document.addEventListener("DOMContentLoaded", function () {

        const form = document.getElementById("passwordForm");
        const back =document.getElementById("backBtn");

        back.addEventListener("click", function(){
            window.location.replace('/signup');
        })

        form.addEventListener("submit", function(event){
            event.preventDefault();

            const passwords = Array.from(form.querySelectorAll('[type="password"]'));
            const passwordA = passwords[0].value.trim();
            const passwordB = passwords[1].value.trim();
            const errorMessage = form.querySelector(".text-danger");
            const registerData = getCookie("registerData");

            //get cookie

            if(passwordA !== passwordB /* || cookie is null*/){
                event.preventDefault();
            //if(passwordA !== passwordB){
                passwords.forEach(function(field){field.classList.add('invalid');});

                if (errorMessage) {
                    errorMessage.innerHTML = 'The passwords are not matching';
                }
                return;
            }
            if (!registerData) {
                window.location.replace('/signup');
                errorMessage.innerHTML = 'The registration time was too long, please start registration again.';
                return;
            }

            form.getElementsByTagName("email")[0].value = "";
            form.getElementsByTagName("first_name")[0].value = "";
            form.getElementsByTagName("last_name")[0].value = "";

            form.submit();
        })
    })
    return{};
}());