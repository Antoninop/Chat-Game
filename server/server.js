const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const publicPath = path.join(__dirname, '..', 'client');
app.use(express.static(publicPath));

let player1 = null;
let player2 = null;

const motsFrancais = ['chocolat', 'croissant', 'baguette', 'fromage', 'escargot', 'camembert', 'macaron', 'crepe', 'vin', 'boulangerie'];
const motPartie = choisirMotFrancais();
function choisirMotFrancais() {
    return motsFrancais[Math.floor(Math.random() * motsFrancais.length)];
}

io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');
    socket.on('chat message', (msg) => {
        console.log('Message reçu : ' + msg);
        io.emit('chat message', msg); 

        if (msg.split(' ')[1].toLowerCase() === motPartie && msg.split(' ')[0] === 'player2') {
            console.log('Victoire');
            io.emit('Victoire', msg);
        }

    });

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté');
        if (socket === player1) {
            player1 = null;
            console.log('Joueur 1 s\'est déconnecté');
        } else if (socket === player2) {
            player2 = null;
            console.log('Joueur 2 s\'est déconnecté');
        }
    });

    if (!player1) {
        player1 = socket;
        console.log('Joueur 1 assigné');
        socket.emit('player', 'player1');
        socket.emit('word', motPartie);

    } else if (!player2) {
        player2 = socket;
        console.log('Joueur 2 assigné');
        socket.emit('player', 'player2');
    } else {
        console.log('Trop de joueurs, redirection ou message d\'erreur...');
        socket.emit('message', 'Désolé, la partie est déjà pleine. Veuillez réessayer plus tard.');
        socket.disconnect();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
