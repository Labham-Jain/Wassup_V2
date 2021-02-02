const chatState = {
    from: undefined,
    to: undefined,
    sender: undefined,
    receiver: undefined,
}

const messages = {};

const messageField = document.querySelector('#textarea');


// functions

const setUsername = () => {
    let nameInLs = localStorage.getItem('name');
    if(nameInLs !== null){
        chatState.sender = nameInLs;
        return true;
    }

    while (chatState.sender === undefined) {
        let promptValue = prompt('Enter Your Name...');
        if(promptValue !== null){
            chatState.sender = promptValue;
        }        
    }
}
const messagesBoxField = document.querySelector('.message__area');




const checkAndUpdateMessages = () => {
    const selectedContactBox = document.querySelector('.connected.selected');
    console.log(messages);
    if(selectedContactBox === null){
        return;
    }
    
    if(selectedContactBox.dataset.id === chatState.to){
        console.log('hey1');
        let messagesKeys = Object.keys(messages);
        for (let i = 0; i <  messagesKeys.length; i++) {
            console.log('hey', i);
            if(messagesKeys[i] == chatState.to){
                messagesBoxField.innerHTML = ''
                messages[messagesKeys[i]].forEach((msg) => {
                    appendMessage(msg, msg.type);
                })
            }
        }
    }
}

const contactElemClick =  (contact, contactElem) => {
    const prevElemSelect = contactElem.parentElement.querySelector('.selected');
    if(prevElemSelect !== null){
        if(prevElemSelect.dataset.id !== contact.id){
            prevElemSelect.classList.remove('selected');
        }
    }
    messageField.parentElement.style.display = "flex";
    chatState.receiver = contact.name;
    chatState.to = contact.id;
    contactElem.classList.add('selected');
    checkAndUpdateMessages()

}
const generateSessionId = () => {
    let result = '';
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$&?';
    for (let i = 0; i < 24; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];        
    }
    chatState.from = result;
}


const updateContacts = (contacts) => {
    messagesBoxField.innerHTML = ""
    const connectionsElem = document.querySelector('.connections');

    connectionsElem.innerHTML = "";
    contacts = contacts.filter((contact) => (contact.id !== chatState.from));
    if(contacts.length == 0){
        connectionsElem.innerHTML += "0 online"
    }
    contacts.forEach((contact) => {

        const contactElem = document.createElement('div');

        contactElem.dataset.id = contact.id;
        contactElem.classList.add('connected')
        contactElem.innerText = contact.name;
        
        contactElem.addEventListener('click', () => {
            if(contactElem.dataset.id !== chatState.to){
                messagesBoxField.innerHTML = "";
            }
            contactElemClick(contact, contactElem);
        });

        connectionsElem.appendChild(contactElem);
    })
    checkAndUpdateMessages();
}




const saveMessageInSession = (messageInfo) => {
    if(messages[messageInfo.id] === undefined){
        messages[messageInfo.id] = [];
    }
    messages[messageInfo.id].push(messageInfo);
    checkAndUpdateMessages()
}


const appendMessage = (msg, type) => {


    const template = `<div class="${type === "outgoing" ? "right" : "left"}">
        <div class="message">
            <div class="sender">${msg.sender}</div>
            <div class="message-text">${msg.message}</div>
        </div>
    </div>`;

    document.querySelector('.message__area').innerHTML += template;

}

const socket = io();

// socket connections

window.addEventListener('DOMContentLoaded', () => {
    setUsername();
    generateSessionId()
    socket.emit('joining-details', {
        name: chatState.sender,
        id: chatState.from,
    })
})


socket.on('connected-clients', updateContacts)
socket.on('message', (msg) => {
    saveMessageInSession({
        id: chatState.to,
        message: msg.message,
        sender: chatState.receiver,
        type: 'incoming'
    })
})


messageField.addEventListener('keyup', e => {
    if(e.key === "Enter"){
        saveMessageInSession({
            id: chatState.to,
            sender: chatState.sender,
            message: messageField.value,
            type: 'outgoing'
        })
        socket.emit('message', {
            ...chatState,
            message: messageField.value
        });
        messageField.value = "";
    }
})