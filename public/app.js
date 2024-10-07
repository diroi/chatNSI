// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBw8gIsDsvcDk0GtA70VtH0OXqsWazTpDY",
    authDomain: "chatnsi-2aedd.firebaseapp.com",
    databaseURL: "https://chatnsi-2aedd-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "chatnsi-2aedd",
    storageBucket: "chatnsi-2aedd.appspot.com",
    messagingSenderId: "390230063849",
    appId: "1:390230063849:web:ae6f0f65566c4a8f758e78",
    measurementId: "G-F468QT8G38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// The rest of your app.js code remains unchanged...


// DOM elements
const authContainer = document.getElementById('auth-container');
const chatroomCreateContainer = document.getElementById('chatroom-create-container');
const chatroomListContainer = document.getElementById('chatroom-list-container');
const chatroomContainer = document.getElementById('chatroom-container');
const chatroomNameInput = document.getElementById('chatroom-name');
const chatWindow = document.getElementById('chat-window');
const messageInput = document.getElementById('message-input');
const chatroomList = document.getElementById('chatroom-list');

let currentUser = null;
let currentChatroomId = null;

// Authentication: Login and Sign Up
document.getElementById('login-btn').addEventListener('click', loginUser);
document.getElementById('signup-btn').addEventListener('click', signUpUser);

// Creating chatroom
document.getElementById('create-chatroom-btn').addEventListener('click', createChatroom);

// Send message
document.getElementById('send-btn').addEventListener('click', sendMessage);

// Login user function
function loginUser() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            currentUser = userCredential.user;
            loadChatrooms();
        })
        .catch(error => console.error(error.message));
}

// Sign up user function
function signUpUser() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            currentUser = userCredential.user;
            set(ref(db, 'users/' + currentUser.uid), {
                email: currentUser.email
            });
            loadChatrooms();
        })
        .catch(error => console.error(error.message));
}

// Load chatrooms
function loadChatrooms() {
    authContainer.style.display = 'none';
    chatroomCreateContainer.style.display = 'block';
    chatroomListContainer.style.display = 'block';

    const chatroomsRef = ref(db, 'chatrooms');
    onValue(chatroomsRef, (snapshot) => {
        chatroomList.innerHTML = '';  // Clear list
        snapshot.forEach((childSnapshot) => {
            const chatroom = childSnapshot.val();
            const chatroomId = childSnapshot.key;
            const li = document.createElement('li');
            li.textContent = chatroom.name;
            li.addEventListener('click', () => enterChatroom(chatroomId, chatroom.name));
            chatroomList.appendChild(li);
        });
    });
}

// Create chatroom function
function createChatroom() {
    const chatroomName = chatroomNameInput.value;
    const newChatroomRef = push(ref(db, 'chatrooms'));
    set(newChatroomRef, {
        name: chatroomName,
        users: { [currentUser.uid]: true }
    });
    chatroomNameInput.value = '';  // Clear input
}

// Enter chatroom
function enterChatroom(chatroomId, chatroomName) {
    currentChatroomId = chatroomId;
    chatroomCreateContainer.style.display = 'none';
    chatroomListContainer.style.display = 'none';
    chatroomContainer.style.display = 'block';
    document.getElementById('chatroom-title').textContent = chatroomName;

    // Load messages
    const messagesRef = ref(db, 'chatrooms/' + chatroomId + '/messages');
    onValue(messagesRef, (snapshot) => {
        chatWindow.innerHTML = '';  // Clear chat window
        snapshot.forEach((childSnapshot) => {
            const message = childSnapshot.val();
            displayMessage(message);
        });
    });
}

// Send message function
function sendMessage() {
    const messageContent = messageInput.value;
    if (messageContent.trim() !== '') {
        const messageRef = push(ref(db, 'chatrooms/' + currentChatroomId + '/messages'));
        set(messageRef, {
            content: messageContent,
            timestamp: Date.now(),
            userId: currentUser.uid
        });
        messageInput.value = '';  // Clear input
    }
}

// Display message in chat
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${message.content} (${new Date(message.timestamp).toLocaleTimeString()})`;
    chatWindow.appendChild(messageDiv);
}
