const POLLING = 10

const DOM = (function() {
    document.addEventListener("DOMContentLoaded", function () {
        const messageArea = document.getElementById('messageArea');
        setInterval(update, POLLING*1000);

        document.getElementById('messageForm').addEventListener('submit', addMessage);

        messageArea.scrollTop = messageArea.scrollHeight;

        document.querySelectorAll(".bi-pencil").forEach(button => {
            button.addEventListener("click", editMessageMode)
        })

        document.querySelectorAll(".bi-trash").forEach(button => {
            button.addEventListener("click", removeMessage)
        })

        document.querySelectorAll(".msg-edit").forEach(button => {
            button.addEventListener("submit", editMessage)
        })

        document.querySelectorAll(".bi-x-circle").forEach(button => {
            button.addEventListener("click", editMessageMode)
        })
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

                input.value = '';
                err_msg.innerHTML = '';
                scrollToBottom();
            } else if(response.status === 401 || response.status === 403) {
                window.location.href = '/login';
            }
            else {
                throw new Error("cannot add message");
            }
        } catch (error) {
            err_msg.innerHTML = error.message;
        }
    }

    function editMessageMode(event) {
        const messageElement = event.target.closest('.message');
        const displayDiv = messageElement.querySelector('.msg-display');
        const editDiv = messageElement.querySelector('.msg-edit');

        editDiv.getElementsByTagName('input')[0].value = displayDiv.innerHTML;

        displayDiv.classList.toggle("d-none");
        editDiv.classList.toggle("d-none");
    }

    async function editMessage(event) {
        event.preventDefault();
        const messageElement = event.target.closest('.message');
        const messageId = messageElement.id;
        const newMessage = messageElement.querySelector('input').value.trim();
        const oldMessage = messageElement.querySelector(".msg-display").innerHTML

        if (!newMessage) {
            //add invalid?
            return;
        }
        if (newMessage === oldMessage){
            editMessageMode(event);
            return;
        }
        try {
            const response = await fetch(`/chatroom/edit`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {messageId: messageId,
                        newContent: newMessage})
            });
            if (response.ok) {
                const {messages} = await response.json();
                displayMessages(messages);
                editMessageMode(event);
            }
            else if (response.redirected) {
                window.location.href = response.url;
                //return;
            }
            else if(response.status === 401 || response.status === 403) {
                window.location.href = '/login';
            }
            else {
                throw new Error('Failed to delete message');
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function removeMessage(event) {
        const messageId = event.target.closest('.message').id;

        try {
            const response = await fetch(`/chatroom/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({messageId: messageId})
            });
            if (response.ok) {
                const {messages} = await response.json();
                displayMessages(messages);

            } else if(response.status === 401 || response.status === 403) {
                window.location.href = '/login';
            }
            else {
                throw new Error('Failed to delete message');
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function update(){
        const response = await fetch('/chatroom/update', {
            method: 'POST'
        });

        if (response.redirected) {
            window.location.href = response.url;
            return;
        }
        /*else if(response.status === 401 || response.status === 403) {
            window.location.href = '/login';
            return;
        }*/
        else if (response.ok) {
            const {messages} = await response.json();
            displayMessages(messages);
        }
        else {
            throw new Error("cannot refresh");
        }
    }

    /*async function update(){
        const response = await fetch('/chatroom/update', {
            method: 'POST'
        });

        if (response.ok) {
            const {messages} = await response.json();
            displayMessages(messages);

        } else if (response.redirected) {
            window.location.href = response.url;
            return;
        }
        else if(response.status === 401 || response.status === 403) {
            window.location.href = '/login';
            return;
        }
        else {
            throw new Error("cannot refresh");
        }
    }*/

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
                                <p class="mb-1 msg-display">${message.content}</p>
                                <form class="input-group mb-3 msg-edit d-none">
                                    <input type="text" class="form-control" required>
                                    <button class="btn btn-outline-secondary bi bi-floppy-fill" type="submit"></button>
                                    <button class="btn btn-outline-secondary bi bi-x-circle" type="button"></button>
                                </form>
                            </div>                           
                            </div>
                        </div>`;
                        msg_area.insertAdjacentHTML('beforeend', newMessage);

                        const newMessageElement = msg_area.lastElementChild;
                        newMessageElement.querySelector('.bi-pencil').addEventListener('click', editMessageMode);
                        newMessageElement.querySelector('.bi-trash').addEventListener('click', removeMessage);
                        newMessageElement.querySelector('.bi-x-circle').addEventListener('click', editMessageMode);
                        newMessageElement.querySelector('form').addEventListener('submit', editMessage);
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

    function scrollToBottom() {
        const messageArea = document.getElementById('messageArea');
        messageArea.scrollTop = messageArea.scrollHeight;
    }


    return{};
}());


