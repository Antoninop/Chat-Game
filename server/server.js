const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const publicPath = path.join(__dirname, '..', 'client');
app.use(express.static(publicPath));

const motsFrancais = ['chocolat', 'croissant', 'baguette', 'fromage', 'escargot', 'camembert', 'macaron', 'crepe', 'vin', 'boulangerie'];
let motPartie = choisirMotFrancais();

function choisirMotFrancais() {
    return motsFrancais[Math.floor(Math.random() * motsFrancais.length)];
}

let TourJoueur = 1;
let player1 = null;
let player2 = null;

io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');

    // Gestion de l'événement de réception de messages
    socket.on('chat message', (msg) => {
        if (msg.split(' ')[0] === 'player1' && TourJoueur === 1 && player1 === socket){
            console.log('Message reçu : ' + msg);
            io.emit('chat message', msg); 
            TourJoueur = 2;

        } else if (msg.split(' ')[0] === 'player2' && TourJoueur === 2 && player2 === socket) {
            console.log('Message reçu : ' + msg);
            io.emit('chat message', msg); 
            TourJoueur = 1;

            if (msg.split(' ')[1].toLowerCase() === motPartie && msg.split(' ')[0] === 'player2') {
                console.log('Victoire');
                io.emit('Victoire', msg);
            }

        } else {
            console.log('Ce n\'est pas votre tour ou vous n\'êtes pas autorisé à jouer.');
        }
    });

    // Gestion de l'événement de déconnexion
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

    // Attribution des joueurs
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
