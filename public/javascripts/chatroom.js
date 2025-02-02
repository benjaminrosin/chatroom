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
            const response = await fetch('/api/add', {
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

            const data = await response.json();

            if (!response.ok) {
                if (Array.isArray(data.error?.errors)){
                    throw new Error(data.error.errors[0].message);
                }
                throw new Error(data.message);
            }

            last_updated = Date.now();
            displayMessages(data.messages);
            input.value = '';
            err_msg.innerHTML = '';
            scrollToBottom();

            /*else if (response.ok) {
                last_updated = Date.now();
                const {messages} = await response.json();
                displayMessages(messages);

                input.value = '';
                err_msg.innerHTML = '';
                scrollToBottom();
            }
            else {
                throw new Error("cannot add message");
            }*/
        } catch (error) {
            err_msg.innerHTML = error.message;
        }
    }

    async function searchMessage(event){
        event.preventDefault();
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput.value.trim();
        const err_msg = document.getElementById('searchErrMsg');
        //const systemMessages = document.getElementById('systemMessages');
        const searchResults = document.getElementById('searchResults');

        if(!searchTerm || searchTerm === ''){
            return exitSearchMode();
        }

        try {
            searchResults.classList.remove('d-none');
            document.getElementById("chatroom").classList.add('d-none');

            const response = await fetch(`/api/search`, {
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            //document.getElementById('searchTermDisplay').textContent = `Search results for: "${searchTerm}"`;
            document.getElementById('searchTermDisplay').textContent = `Found ${data.messages.length} messages for: "${searchTerm}"`;
            document.getElementById('searchResultsMessageArea').innerHTML= '';

            displayMessages(data.messages, false,'searchResultsMessageArea');


            /*
            document.getElementById('searchTermDisplay').textContent = `Search results for: "${searchTerm}"`;
            document.getElementById('searchResults').classList.remove('d-none');

            if (data.messages.length === 0) {
                systemMessages.innerHTML = `<div class="alert alert-info">No messages found containing the word "${searchTerm}".</div>`;
                displayMessages([]);
            }
            else{
                systemMessages.innerHTML = '';
                displayMessages(data.messages);
            }*/
            err_msg.innerHTML = '';
            searchInput.value = '';

            /*else if (response.ok) {
                const { messages } = await response.json();

                //document.getElementById('searchTermDisplay').textContent = `Search results for: "${searchTerm}"`;
                document.getElementById('searchTermDisplay').textContent = `Found ${messages.length} messages for: "${searchTerm}"`;
                document.getElementById('searchResultsMessageArea').innerHTML= '';

                /*if (messages.length === 0) {
                    systemMessages.innerHTML = `<div class="alert alert-info">No messages found containing the word "${searchTerm}".</div>`;
                }
                else{
                    systemMessages.innerHTML = '';
                }
                displayMessages(data.messages, false,'searchResultsMessageArea');

                err_msg.innerHTML = '';
                searchInput.value = '';
            }
            else {
                throw new Error('Failed to search message');
            }*/
        }
        catch (error) {
            //console.error(error);
            err_msg.innerHTML = error.message;
        }
    }

    function exitSearchMode(){
        const searchInput = document.getElementById('search-input');
        //const systemMessages = document.getElementById('systemMessages');

        searchInput.value = '';
        //systemMessages.innerHTML = '';

        document.getElementById('chatroom').classList.remove('d-none');
        document.getElementById('searchResults').classList.add('d-none');

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
        const messageId = messageElement.dataset.id;
        const newMessage = messageElement.querySelector('input').value.trim();
        const oldMessage = messageElement.querySelector(".msg-display").innerHTML

        if (!newMessage || newMessage === '') {
            //add invalid?
            return;
        }
        if (newMessage === oldMessage){
            editMessageMode(event);
            return;
        }
        try {
            const response = await fetch(`/api/edit`, {
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            last_updated = Date.now();
            displayMessages(data.messages, false);
            editMessageMode(event);

                /*else if (response.ok) {
                    last_updated = Date.now();
                    const {messages} = await response.json();
                    displayMessages(messages, false);
                    editMessageMode(event);
                }*/
            /*else if(response.status === 401 || response.status === 403) {
                window.location.href = '/login';
            }
            else {
                throw new Error('Failed to delete message');
            }*/
        } catch (error) {
            console.error(error);
        }
    }

    async function removeMessage(event) {
        const messageId = event.target.closest('.message').dataset.id;

        try {
            const response = await fetch(`/api/delete`, {
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            last_updated = Date.now();
            displayMessages(data.messages, false);

            /*else if (response.ok) {
                last_updated = Date.now();
                const {messages} = await response.json();
                displayMessages(messages, false);

            } */
            /*else if(response.status === 401 || response.status === 403) {
                window.location.href = '/login';
            }
            else {
                throw new Error('Failed to delete message');
            }*/
        } catch (error) {
            console.error(error);
        }
    }

    async function update() {
        try {
            const response = await fetch('/api/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    last_updated: new Date(last_updated).toISOString()
                })
            });

            if (response.redirected) {
                window.location.href = response.url;
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            last_updated = Date.now();
            displayMessages(data.messages);

        } catch (error) {
            console.error('Error updating messages:', error.message);
        }
    }

    /*async function update(){
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
    */

    /*function displayMessages(messages){
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
        }*/

    function displayMessages(messages, scheduled = true, id = 'messageArea'){
        const msg_area = document.getElementById(id);

        messages.forEach(message => {
            const div = msg_area.querySelector(`[data-id = '${message.id}']`);
            let div2 = null;

            if (scheduled === false){
                div2 = document.getElementById('searchResultsMessageArea').querySelector(`[data-id = '${message.id}']`);
            }

            if (div){
                if (message.deleted) {
                    div.remove();
                    div2?.remove();
                }
                else{
                    const edited = (message.createdAt === message.updatedAt) ? '' : ', edited';
                    div.querySelector('small').innerText = `${new Date(message.createdAt).toLocaleString()}${edited}`;
                    [...div.querySelectorAll('p')][1].innerHTML = message.content;

                    if (div2){
                        div2.querySelector('small').innerText = `${new Date(message.createdAt).toLocaleString()}${edited}`;
                        [...div2.querySelectorAll('p')][1].innerHTML = message.content;
                    }

                }

            }
            else{
                const edited = (message.createdAt === message.updatedAt)? ``:  `, edited`;

                if (!message.deleted){
                    if (message.isMine) {
                        const newMessage = `
                        <div class="message mb-3"  data-id= ${message.id}>
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
                    }
                    else {
                        const newMessage = `
                            <div class="message mb-3" data-id= ${message.id}>
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


