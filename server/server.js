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


    socket.on('create-room', () => {
        console.log('Création d\'une salle');
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase(); 
        console.log('Code de salle généré : ' + roomCode);
        rooms[roomCode] = { players: [socket.id], motPartie: choisirMotFrancais() }; 
        socket.join(roomCode); 
        socket.emit('room-created', roomCode); 
    });

    socket.on('join-room', (roomCode) => {
        if (rooms[roomCode] && rooms[roomCode].players.length < 2) { 
            rooms[roomCode].players.push(socket.id); 
            socket.join(roomCode); 
            io.to(roomCode).emit('room-joined', roomCode); 
        } else {
            socket.emit('room-error', 'La salle est pleine ou n\'existe pas'); 
        }
    });

    
    socket.on('chat message', (msg) => {
        const [player, messageWord] = msg.split(' ');
    
        if (player === 'player1' && TourJoueur === 1 && player1 === socket) {
            console.log('Message reçu : ' + msg);
            const wordToCheck = messageWord.toLowerCase();
    
            if (wordExistsInFile(wordToCheck)) {
                io.to(roomCode).emit('chat message', msg); 
                TourJoueur = 2;
                io.to(roomCode).emit('tour', 'player2');
            }

        } else if (player === 'player2' && TourJoueur === 2 && player2 === socket) {
            console.log('Message reçu : ' + msg);
            const wordToCheck = messageWord.toLowerCase();
    
            if (wordExistsInFile(wordToCheck)) {
                io.to(roomCode).emit('chat message', msg); 
                TourJoueur = 1; 
                io.to(roomCode).emit('tour', 'player1');
            }
    
            if (wordToCheck.includes(motPartie) && player === 'player2') {
                console.log('Victoire');
                io.to(roomCode).emit('Victoire', msg);
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


const fs = require('fs');

function wordExistsInFile(word) {
    try {
        const data = fs.readFileSync('mots.txt', 'utf8');
        const lines = data.split('\n');
        
        const lowercaseWord = word.toLowerCase();
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().toLowerCase(); 
            
            if (line === lowercaseWord) {
                return true; 
            }
        }        
        return false;
    } catch (err) {
        console.error("Error reading file:", err);
        return false;
    }
}

