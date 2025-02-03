const POLLING = 10
let last_updated = new Date(-8640000000000000);
let intervalId = null;

const DOM = (function() {
    /**
     * Initializes DOM event listeners and polling interval
     * @listens DOMContentLoaded
     */
    document.addEventListener("DOMContentLoaded", function () {
        last_updated = Date.now();
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

    /**
     * Adds new message to chat
     * @param {Event} event - Form submission event
     * @returns {Promise<void>}
     */
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

            else if (response.ok) {
                last_updated = Date.now();
                const {messages} = await response.json();
                displayMessages(messages);

                input.value = '';
                err_msg.innerHTML = '';
                scrollToBottom();
            }
            else {
                //--------------------------------------------------------------------------------------
                const error = await response.json()
                if (Array.isArray(error?.errors)){
                    throw new Error(error.errors[0].message);
                }
                throw new Error(error.message);
            }
        } catch (error) {
            err_msg.innerHTML = error.message;
        }
    }

    /**
     * Searches messages by term and displays results
     * @param {Event} event - Search form submission event
     * @returns {Promise<void>}
     */
    async function searchMessage(event){
        event.preventDefault();
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput.value.trim();
        const err_msg = document.getElementById('searchErrMsg');
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
            else if (response.ok) {
                const { messages } = await response.json();

                document.getElementById('searchTermDisplay').textContent = `Found ${messages.length} messages for: "${searchTerm}"`;
                document.getElementById('searchResultsMessageArea').innerHTML= '';

                displayMessages(messages, false,'searchResultsMessageArea');

                err_msg.innerHTML = '';
                searchInput.value = '';
            }
            else {
                const error = await response.json()
                throw new Error(error.message);
                //throw new Error('Failed to search message');
            }
        }
        catch (error) {
            //console.error(error);
            err_msg.innerHTML = error.message;
        }
    }

    /**
     * Exits search mode and returns to main chat view
     */
    function exitSearchMode(){
        const searchInput = document.getElementById('search-input');
        //const systemMessages = document.getElementById('systemMessages');

        searchInput.value = '';
        //systemMessages.innerHTML = '';

        document.getElementById('chatroom').classList.remove('d-none');
        document.getElementById('searchResults').classList.add('d-none');

        scrollToBottom();
    }
    /**
     * Toggles message edit mode UI
     * @param {Event} event - Edit button click event
     */
    function editMessageMode(event) {
        const messageElement = event.target.closest('.message');
        const displayDiv = messageElement.querySelector('.msg-display');
        const editDiv = messageElement.querySelector('.msg-edit');

        editDiv.getElementsByTagName('input')[0].value = displayDiv.innerHTML;

        displayDiv.classList.toggle("d-none");
        editDiv.classList.toggle("d-none");
    }

    /**
     * Updates message content
     * @param {Event} event - Edit form submission event
     * @returns {Promise<void>}
     */
    async function editMessage(event) {
        event.preventDefault();
        const messageElement = event.target.closest('.message');
        const messageId = messageElement.dataset.id;
        const messageInput = messageElement.querySelector('input');
        const newMessage = messageInput.value.trim();
        const oldMessage = messageElement.querySelector(".msg-display").innerHTML

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
            else if (response.ok) {
                    last_updated = Date.now();
                    const {messages} = await response.json();
                    displayMessages(messages, false);
                    editMessageMode(event);
            }
        }
        catch (error) {
            console.error(error);
            window.location.href = '/error';
        }
    }

    /**
     * Removes message from chat
     * @param {Event} event - Delete button click event
     * @returns {Promise<void>}
     */
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
            else if (response.ok) {
                last_updated = Date.now();
                const {messages} = await response.json();
                displayMessages(messages, false);
            }
        } catch (error) {
            console.error(error);
            window.location.href = '/error';
        }
    }

    /**
     * Polls server for new messages
     * @returns {Promise<void>}
     */
    async function update(){
        const response = await fetch('/api/update', {
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
            console.error('Error updating messages');
        }
    }

    /**
     * Renders messages in the chat area
     * @param {Array} messages - Array of message objects
     * @param {boolean} [scheduled=true] - Whether update is from scheduled polling
     * @param {string} [id='messageArea'] - Target element ID
     */
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
                                    <input type="text" class="form-control" pattern=".*\\S.*" required>
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

    /**
     * Scrolls chat to bottom
     */
    function scrollToBottom() {
        const messageArea = document.getElementById('messageArea');
        messageArea.scrollTop = messageArea.scrollHeight;
    }

    return{};
}());


