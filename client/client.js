const socket = io();
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const playerStatus = document.getElementById('player-status');

let player;
let word; 

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


socket.on('chat message', (msg) => {
    const li = document.createElement('li');

    if (msg.startsWith(player)) {
        li.textContent = `(vous) ${msg.slice(player.length + 1)}`;
    } else {
        li.textContent = msg;
    }
    chatMessages.appendChild(li);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});


socket.on('Victoire', () => {
    alert('Victoire !');
});


