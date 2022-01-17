const ex = require('express');
const webSocket = require('ws');

const game = function (gameID, player1) {
    this.gameId = gameID;
    this.player1 = player1;
    this.empty = true;

    player1.send(JSON.stringify({
        gameID: this.gameId,
        playerName: '1',
        message: 'waiting'
    }));
}

game.prototype.addSecondPlayer = function (player2) {
    this.player2 = player2;
    this.empty = false;
    player2.send(JSON.stringify({
        gameID: this.gameId,
        playerName: '2',
        message: 'game_start'
    }));
    this.player1.send(JSON.stringify({
        message: 'game_start'
    }));
}

game.prototype.endGame = function (socket) {
    const afkPlayer = socket['playerName'];
    if (this.empty) {

    } else if (afkPlayer == '1') {
        this.player2.send(JSON.stringify({
            message: "opponent_disconnected"
        }))
    } else {
        this.player1.send(JSON.stringify({
            message: "opponent_disconnected"
        }))
    }
}

game.prototype.notifyMove = function (data) {
    if (data.playerName == '1') {
        this.player2.send(JSON.stringify({
            message: 'opponent_move',
            score: data.score
        }));
    } else {
        this.player1.send(JSON.stringify({
            message: 'opponent_move',
            score: data.score
        }))
    }
}

game.prototype.finishGame = function () {
    this.player2.send(JSON.stringify({
        message: "game_finish"
        
    }))
    this.player1.send(JSON.stringify({
        message: "game_finish"
    }))
}



module.exports = game;