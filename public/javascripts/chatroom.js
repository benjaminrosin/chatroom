const POLLING = 10

const DOM = (function() {
    document.addEventListener("DOMContentLoaded", function () {
        const messageArea = document.getElementById('messageArea');
        setInterval(update, POLLING*1000);

        document.getElementById('messageForm').addEventListener('submit', addMessage);

        messageArea.scrollTop = messageArea.scrollHeight;

        document.querySelectorAll(".bi-pencil").forEach(button => {
            button.addEventListener("click", editMessage)
        })

        document.querySelectorAll(".bi-trash").forEach(button => {
            button.addEventListener("click", removeMessage)
        })

        //messageArea.addEventListener('click', removeMessage);
        //messageArea.addEventListener('click', editMessage);


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

                input.value = '';
                err_msg.innerHTML = '';
                scrollToBottom();
            } else {
                throw new Error("cannot add message");
            }
        } catch (error) {
            err_msg.innerHTML = error.message;
        }
    }

    async function editMessage(event) {
            const messageElement = event.target.closest('.message');
            const displayDiv = messageElement.querySelector('.msg-display');
            const editDiv = messageElement.querySelector('.msg-edit');

            editDiv.getElementsByTagName('input')[0].value = displayDiv.innerHTML;

            displayDiv.classList.toggle("d-none");
            editDiv.classList.toggle("d-none");

            /*const message = messageElement.querySelectorAll('p')[1].innerHTML;

            if(messageElement.querySelector('input')){
                return;
            }

            const editHtml = `
                <div class="input-group mb-3">
                    <input type="text" class="form-control" id="myInput" value=${}>
                    <button class="btn btn-success">Save</button>
                    <button class="btn btn-danger">Discard</button>
                </div>`

            const messageId = messageElement.id;
            const contentElement = messageElement.querySelector('[name="content"]');
            const currentContent = contentElement.textContent;

            const originalHTML = contentElement.innerHTML;

            const editContainer = document.createElement('div');
            editContainer.className = 'd-flex flex-column gap-2';

            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = currentContent;
            editInput.className = 'form-control';

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'd-flex gap-2';

            const saveButton = document.createElement('button');
            saveButton.className = 'btn btn-primary btn-sm';
            saveButton.textContent = 'Save';

            const cancelButton = document.createElement('button');
            cancelButton.className = 'btn btn-secondary btn-sm';
            cancelButton.textContent = 'Cancel';

            buttonsDiv.appendChild(saveButton);
            buttonsDiv.appendChild(cancelButton);

            editContainer.appendChild(editInput);
            editContainer.appendChild(buttonsDiv);

            contentElement.innerHTML = '';
            contentElement.appendChild(editContainer);
            editInput.focus();

            const cancelEdit = () => {
                contentElement.innerHTML = originalHTML;
            };

            const saveEdit = async () => {
                const newContent = editInput.value.trim();

                if (!newContent) {
                    cancelEdit();
                    return;
                }

                try {
                    const response = await fetch(`/chatroom/edit`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ messageId: messageId, newContent: newContent})
                    });

                    if (!response.ok) {
                        throw new Error('Failed to edit message');
                    }
                    contentElement.innerHTML = originalHTML;
                    await update();
                }
                catch (error) {
                    console.error(error);
                    cancelEdit();
                }
            }
            saveButton.addEventListener('click', saveEdit);
            cancelButton.addEventListener('click', cancelEdit);

            editInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    saveEdit();
                }
            });

            editInput.addEventListener('keyup', function(e) {
                if (e.key === 'Escape') {
                    cancelEdit();
                }
            });*/

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

            } else {
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

        if (response.ok) {
            const {messages} = await response.json();
            displayMessages(messages);

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
                                <p class="mb-1 msg-display">${message.content}</p>
                                <div class="input-group mb-3 msg-edit d-none">
                                    <input type="text" class="form-control">
                                    <button class="btn btn-success">Save</button>
                                    <button class="btn btn-danger">Discard</button>
                                </div>
                            </div>                           
                            </div>
                        </div>`;
                        msg_area.insertAdjacentHTML('beforeend', newMessage);

                        const newMessageElement = msg_area.lastElementChild;
                        newMessageElement.querySelector('.bi-pencil').addEventListener('click', editMessage);
                        newMessageElement.querySelector('.bi-trash').addEventListener('click', removeMessage);
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


