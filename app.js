// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBw8gIsDsvcDk0GtA70VtH0OXqsWazTpDY",
    authDomain: "chatnsi-2aedd.firebaseapp.com",
    projectId: "chatnsi-2aedd",
    storageBucket: "chatnsi-2aedd.appspot.com",
    messagingSenderId: "390230063849",
    appId: "1:390230063849:web:ae6f0f65566c4a8f758e78",
    measurementId: "G-F468QT8G38"
  };

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Elements
const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const adminControls = document.getElementById('admin-controls');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const deleteUserInput = document.getElementById('delete-user-input');
const deleteUserBtn = document.getElementById('delete-user-btn');
const usernameDisplay = document.getElementById('username-display');

let currentUser = null;

// Admin user credentials (hardcoded for simplicity)
const adminEmail = "admin@example.com";

// Login
loginBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            currentUser = userCredential.user;
            if (currentUser.email === adminEmail) {
                adminControls.style.display = 'block';  // Show admin controls
            }
            loadChat();
        })
        .catch(error => {
            console.error("Login Error", error);
        });
});

// Load chat and user
function loadChat() {
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    usernameDisplay.textContent = `Logged in as: ${currentUser.email}`;

    // Listen for chat messages
    db.ref('messages').on('child_added', (snapshot) => {
        const message = snapshot.val();
        displayMessage(message);
    });
}

// Send message
sendBtn.addEventListener('click', () => {
    const message = {
        username: currentUser.email,
        content: messageInput.value,
        timestamp: Date.now()
    };
    db.ref('messages').push(message);
    messageInput.value = '';  // Clear input
});

// Display chat message
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${message.username}: ${message.content}`;
    chatWindow.appendChild(messageDiv);
}

// Admin: Delete user
deleteUserBtn.addEventListener('click', () => {
    const usernameToDelete = deleteUserInput.value;
    db.ref('users').orderByChild('username').equalTo(usernameToDelete).once('value', (snapshot) => {
        const userKey = Object.keys(snapshot.val())[0];
        db.ref('users').child(userKey).remove();  // Remove user from database
        alert(`User ${usernameToDelete} deleted.`);
    });
});

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        currentUser = null;
        chatContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });
});