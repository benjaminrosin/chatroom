
const DOM = (function(){
    document.addEventListener("DOMContentLoaded", function () {

        const form = document.getElementById("passwordForm");

        form.addEventListener("submit", function(event){
            const passwords = Array.from(form.querySelectorAll('[type="password"]'));
            const passwordA = passwords[0].value.trim();
            const passwordB = passwords[1].value.trim();

            console.log(passwordA, passwordB);

            if(passwordA !== passwordB){
                event.preventDefault();
                passwords.forEach(function(field){field.classList.add('invalid');});

                const errorMessage = form.querySelector(".text-danger");
                if (errorMessage) {
                    errorMessage.innerHTML = 'The passwords are not matching';
                }
            }
        })

    })
    return{};
}());