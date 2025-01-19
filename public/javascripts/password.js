
const Dom = (function(){
    document.addEventListener("DOMContentLoaded", function () {

        const form = document.getElementById("passwordForm");
        const back =document.getElementById("backBtn");

        back.addEventListener("click", function(){
            window.location.replace('/signup');
        })

        form.addEventListener("submit", function(event){
            const passwords = Array.from(form.querySelectorAll('[type="password"]'));
            const passwordA = passwords[0].value.trim();
            const passwordB = passwords[1].value.trim();

            //get cookie

            if(passwordA !== passwordB /* || cookie is null*/){
                event.preventDefault();
                passwords.forEach(function(field){field.classList.add('invalid');});

                const errorMessage = form.querySelector(".text-danger");
                if (errorMessage) {
                    errorMessage.innerHTML = 'The passwords are not matching';
                }
            }

            form.getElementsByTagName("email")[0].value = "";
            form.getElementsByTagName("first_name")[0].value = "";
            form.getElementsByTagName("last_name")[0].value = "";
        })

    })
    return{};
}());