const socket = io();
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const playerStatus = document.getElementById('player-status');

let player;
let word; 

createRoomButton.addEventListener("click", function () {
    socket.emit('create-room');
});


socket.on('player', (receivedPlayer) => {
    if (receivedPlayer === 'player1' || receivedPlayer === 'player2') {
        player = receivedPlayer;
        playerStatus.textContent = `Joueur ${player.charAt(player.length - 1)}`;

        if (receivedPlayer === 'player1') {
            socket.on('word', (receivedWord) => { 
                word = receivedWord; 
                playerStatus.textContent = 'Mot à faire deviner : ' + word;
                console.log('Mot à faire deviner : ' + word);
            });
        }

        if (receivedPlayer === 'player2') {
            playerStatus.textContent += ' - Devinez le mot du joueur 1';
            chatInput.disabled = true; 
        }

    } else {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Désolé, la partie est déjà pleine. Veuillez réessayer plus tard.';
        document.body.appendChild(errorMessage);
        socket.disconnect();
    }
});


socket.on('tour', (play) => {
    if ((play === 'player1' && player !== 'player1') || (play === 'player2' && player !== 'player2')) {
        chatInput.disabled = true;
        console.log("input activé");
    } else {
        chatInput.disabled = false;
        console.log( "input désactivé");
    }
});


chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const message = chatInput.value.trim();
        if (message !== '' && player) {
            if (player === 'player1' && message.toLowerCase() !== word.toLowerCase() || player === 'player2') {
                socket.emit('chat message', `${player} ${message}`);
                chatInput.value = '';
            }
        } else {
            console.log('Le joueur est indéfini ou le message est vide.');
        }
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
        chatMessages.innerHTML = savedMessages;
    }
});

function sauvegarderMessage(message) {
    const li = document.createElement('li');
    if (message.startsWith(player)) {
        li.textContent = `(vous) ${message.slice(player.length + 1)}`;
    } else {
        li.textContent = message;
    }
    chatMessages.appendChild(li);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    localStorage.setItem('chatMessages', chatMessages.innerHTML);
}

socket.on('chat message', (msg) => {
    sauvegarderMessage(msg);
});


socket.on('Victoire', () => {
    alert('Victoire !');
    localStorage.removeItem('chatMessages');

});


