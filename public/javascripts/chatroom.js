const POLLING = 10
let last_updated = new Date(-8640000000000000);
let intervalId = null;

const DOM = (function() {
    document.addEventListener("DOMContentLoaded", function () {
        const messageArea = document.getElementById('messageArea');

        if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(update, POLLING*1000);

        document.getElementById('messageForm').addEventListener('submit', addMessage);

        messageArea.scrollTop = messageArea.scrollHeight;

        document.getElementById('msgSearch').addEventListener('submit', searchMessage);

        document.getElementById('exitSearchButton').addEventListener('click', exitSearchMode);

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
                body: JSON.stringify({ message: message, last_updated: new Date(last_updated).toISOString() })
            });

            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            else if (response.ok) {
                last_updated = Date.now();
                const {messages} = await response.json();
                displayMessages(messages);

                input.value = '';
                err_msg.innerHTML = '';
                scrollToBottom();
            }
            else {
                throw new Error("cannot add message");
            }
        } catch (error) {
            err_msg.innerHTML = error.message;
        }
    }

    async function searchMessage(event){
        event.preventDefault();
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput.value.trim();
        const err_msg = document.getElementById('searchErrMsg');
        const systemMessages = document.getElementById('systemMessages');

        if(!searchTerm){
            systemMessages.innerHTML = '';
            err_msg.innerHTML = 'Search text cannot be empty';
            document.getElementById('messageForm').classList.remove('d-none');
            document.getElementById('searchResults').classList.add('d-none');
            if (intervalId) {
                clearInterval(intervalId);
            }
            intervalId = setInterval(update, POLLING * 1000);
            scrollToBottom();
            return;
        }

        try {
            clearInterval(intervalId);
            document.getElementById('messageForm').classList.add('d-none');
            document.querySelectorAll('.message').forEach(msg => msg.classList.add('d-none'));

            const response = await fetch(`/chatroom/search`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ searchTerm: searchTerm })
            });
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            else if (response.ok) {
                const { messages } = await response.json();

                document.getElementById('searchTermDisplay').textContent = `Search results for: "${searchTerm}"`;
                document.getElementById('searchResults').classList.remove('d-none');

                if (messages.length === 0) {
                    systemMessages.innerHTML = `<div class="alert alert-info">No messages found containing the word "${searchTerm}".</div>`;
                    displayMessages([]);
                }
                else{
                    systemMessages.innerHTML = '';
                    displayMessages(messages);
                }
                err_msg.innerHTML = '';
                searchInput.value = '';
            }
            else {
                throw new Error('Failed to search message');
            }
        }
        catch (error) {
            console.error(error);
            err_msg.innerHTML = error.message;
        }
    }

    async function exitSearchMode(){
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('searchResults');
        const systemMessages = document.getElementById('systemMessages');

        searchInput.value = '';
        searchResults.classList.add('d-none');
        systemMessages.innerHTML = '';

        document.querySelectorAll('.message').forEach(msg => msg.classList.remove('d-none'));
        document.getElementById('messageForm').classList.remove('d-none');

        if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(update, POLLING * 1000);

        await update();
        scrollToBottom();
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
                        newContent: newMessage,
                        last_updated: new Date(last_updated).toISOString()})
            });

            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            else if (response.ok) {
                last_updated = Date.now();
                const {messages} = await response.json();
                displayMessages(messages);
                editMessageMode(event);
            }
            /*else if(response.status === 401 || response.status === 403) {
                window.location.href = '/login';
            }*/
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
                body: JSON.stringify({messageId: messageId, last_updated: new Date(last_updated).toISOString()})
            });
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            else if (response.ok) {
                last_updated = Date.now();
                const {messages} = await response.json();
                displayMessages(messages);

            } /*else if(response.status === 401 || response.status === 403) {
                window.location.href = '/login';
            }*/
            else {
                throw new Error('Failed to delete message');
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function update(){
        const response = await fetch('/chatroom/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({last_updated: new Date(last_updated).toISOString()})
        });

        if (response.redirected) {
            window.location.href = response.url;
            return;
        }
        else if (response.ok) {
            last_updated = Date.now();
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
        const isSearchMode = !document.getElementById('searchResults').classList.contains('d-none');

        if (isSearchMode) {
            document.querySelectorAll('.message').forEach(msg => msg.classList.add('d-none'));
            messages.forEach(message => {
                const div = document.getElementById(message.id);
                if (div) {
                    div.classList.remove('d-none');
                }
            });
        }
        else{
            document.querySelectorAll('.message').forEach(msg => msg.classList.remove('d-none'));
        }

        messages.forEach(message => {
            const div = document.getElementById(message.id);
            if (div){
                if (message.deleted) {
                    div.remove();
                }
                else{
                    //div.querySelector('small').innerText = `${new Date(message.createdAt).toLocaleString()}, edited`;
                    //[...div.querySelectorAll('p')][1].innerHTML = message.content;

                    const edited = (message.createdAt === message.updatedAt) ? '' : ', edited';
                    div.querySelector('small').innerText = `${new Date(message.createdAt).toLocaleString()}${edited}`;
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


