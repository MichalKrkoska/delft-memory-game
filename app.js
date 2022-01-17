const express = require("express");
const app = express();

const http = require("http");
const webSocket = require("ws");

// if(process.argv.length < 3) {
//   console.log("Error: expected a port as argument (eg. 'node app.js 3000').");
//   process.exit(1);
// }

app.use(express.static(__dirname + "/public"));

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    //example of data to render; here gameStatus is an object holding this information
    res.render('splash.ejs', { CP: playerCount, CG: gameCount, TC:  cardFlipTotal});
})

// app.get('/' , (req, res) => {
//   res.sendFile("splash.html", {root: "./public"});
// })

// app.get('/home' , (req, res) => {
//   res.sendFile("splash.html", {root: "./public"});
// })


app.get('/play' , (req, res) => {
  res.sendFile("game.html", {root: "./public"});
})

// const port = process.argv[2];
const port = process.env.PORT || '3000';
app.set("port", port);

const server = http.createServer(app);
const webServer = new webSocket.Server({ server });

let playerCount = 0;
let playerCountTotal = 0;
let gameList = {};
let gameCount = 0;
let cardFlipTotal = 0;

const Game = require('./models/model');

webServer.on('connection', function connection(socket) {
  console.log('Player connected.');
  playerCount++;
  playerCountTotal++;
  if (playerCount % 2 != 0) {
    gameCount++;
    let newGame = new Game(gameCount, socket);
    gameList[gameCount] = newGame;
    socket['playerName'] = '1';
  } else {
    gameList[gameCount].addSecondPlayer(socket);
    socket['playerName'] = '2';
  }

  socket['gameID'] = gameCount;

  socket.onclose = event => {
    if (gameList[socket['gameID']] != null) {
      const gameSate = gameList[socket['gameID']].endGame(socket);
      delete gameList[socket['gameID']];
    }
    playerCount--;
  }

  socket.onmessage = event => {
    const data = JSON.parse(event.data);
    const message = data.message;
    if (message == 'game_over') {
      if (gameList[socket['gameID']] != null) {
        gameList[socket['gameID']].finishGame();
      } 
    }
    if (message == 'next_turn') {
      cardFlipTotal += 2;
      data['playerName'] = socket['playerName'];
      gameList[socket['gameID']].notifyMove(data);
    }
  }
});

server.listen(port);