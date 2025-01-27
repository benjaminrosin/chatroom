const POLLING = 10

const DOM = (function() {
    document.addEventListener("DOMContentLoaded", function () {
        setInterval(update, POLLING*1000);

        document.getElementById('messageForm').addEventListener('submit', addMessage);

        //change


    })

    async function addMessage(event) {
        event.preventDefault();
        const input = document.getElementById('messageInput');
        const err_msg = document.getElementById('errMsg');
        const message = input.value.trim();

        try {
            if (!message){
                throw new Error("message must contain data");
            }
            const response = await fetch('/chatroom/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            });

            if (response.ok) {
                const {messages} = await response.json();
                displayMessages(messages);

                /*const newMessage = `
                        <div class="message mb-3">
                            <div class="d-flex justify-content-between">
                            <div>
                                <p class="mb-1">
                                    <strong>You</strong>
                                    <small class="text-muted me-2">${new Date().toLocaleString()}</small>
                                    <button class="btn bi bi-trash"></button>
                                    <button class="btn bi bi-pencil"></button>
                                </p>
                                <p class="mb-1">${input.value.trim()}</p>
                            </div>
                            </div>
                        </div>`;
                msg_area.insertAdjacentHTML('beforeend', newMessage);*/
                input.value = '';
                err_msg.innerHTML = '';
            } else {
                throw new Error("cannot add message");
            }
        } catch (error) {
            err_msg.innerHTML = error.message;
        }
    }

    async function update(){
        const response = await fetch('/chatroom/update', {
            method: 'POST'
        });

        if (response.ok) {
            const {messages} = await response.json();
            displayMessages(messages);

            /*const {messages} = await response.json();
            messages.forEach(message => {
                if (false /* checking if update or delete *) {

                }
                else{
                    const newMessage = `
                    <div class="message mb-3" id= ${message.id}>
                        <p class="mb-1"><strong>${message.User.firstName + ' ' + message.User.lastName}</strong> <small class="text-muted">${new Date(message.createdAt).toLocaleString()} </small></p>
                        <p class="mb-1">${message.content}</p>
                    </div><div class="message mb-3">
                    `
                    msg_area.insertAdjacentHTML('beforeend', newMessage);
                }
            })*/

        } else {
            throw new Error("cannot refresh");
        }
    }

    function displayMessages(messages){
        const msg_area = document.getElementById('messageArea');

        messages.forEach(message => {
            const div = document.getElementById(message.id);
            if (div){
                if (message.deleted) {
                    div.remove();
                }
                else{
                    div.querySelector('small').innerText = `${new Date(message.createdAt).toLocaleString()}, edited`;
                    [...div.querySelectorAll('p')][1].innerHTML = message.content;
                }

            }
            else{
                const edited = (message.createdAt === message.updatedAt)? ``:  `, edited`;

                if (!message.deleted){
                    if (message.isMine) {
                        const newMessage = `
                        <div class="message mb-3"  id= ${message.id}>
                            <div class="d-flex justify-content-between">
                            <div>
                                <p class="mb-1">
                                    <strong>You</strong>
                                    <small class="text-muted">${new Date(message.createdAt).toLocaleString()}${edited} </small>
                                    <button class="btn bi bi-trash"></button>
                                    <button class="btn bi bi-pencil"></button>
                                </p>
                                <p class="mb-1" name="content">${message.content}</p>
                            </div>
                            </div>
                        </div>`;
                        msg_area.insertAdjacentHTML('beforeend', newMessage);
                        //add event listener
                    }
                    else {
                        const newMessage = `
                            <div class="message mb-3" id= ${message.id}>
                                <p class="mb-1"><strong>${message.User.firstName + ' ' + message.User.lastName}</strong> <small class="text-muted">${new Date(message.createdAt).toLocaleString()}${edited} </small></p>
                                <p class="mb-1">${message.content}</p>
                            </div>`
                        msg_area.insertAdjacentHTML('beforeend', newMessage);
                    }
                }
            }

        })
    }

    return{};
}());


