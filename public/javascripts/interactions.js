// let ws = new WebSocket('ws://localhost:3001/');
let url = location.origin;
let _ws = 'ws';
if (url.startsWith('https')) _ws = 'wss'
const ws = new WebSocket(location.origin.replace(/^https?/, _ws) + "/");

let playerName;
let score = 0;
let canMove;
let gameOn;

const endMessage = document.querySelector('.end-message');
const resetButton = document.querySelector('#newGameButton');
const waitingMessage = document.querySelector('.waiting-message');

/**
 * GAME SETTINGS
 */
let maxTries = 6;

const setupSocket = function () {
  ws.onopen = () => {
      console.log('connecting to server');
  };

  ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const message = data.message;
      if (message == 'waiting') {
          playerName = data.playerName;
          console.log("Player number " + playerName);
          if (playerName == '1') {
              waitingMessage.style.display = "block";
          }
      };

      if (message == 'game_start') {
        waitingMessage.style.display = "none";
        createBoard();
        if(playerName == '1'){
          canMove = true;
        }
        else{
          console.log("Player number 2");
        }
        turnText.textContent = canMove ? "Your turn" : "Opponent's turn";
        // starts game on
        gameOn = true;
        resultDisplay1.textContent = 0 + "/ " + maxTries;
        resultDisplay2.textContent = 0 + "/ " + maxTries;
        // starts timer
        startTimer();
      }

      if (message == 'opponent_move') {
          score = data.score;
          canMove = true;
          turnText.textContent = "Your turn";
          resultDisplay2.textContent = score + "/ " + maxTries;
          console.log('------------------------');
          console.log("Opponent score:" + score);
      }

      if(message == 'game_finish'){
        score++;
        resultDisplay2.textContent = score + "/ " + maxTries;
        console.log('------------------------');
        console.log("Opponent score:" + score);
        waitingMessage.textContent = 'You lost!'
        waitingMessage.style.display = "block";
        gameOver();
        ws.close();
      }

      if (message == 'opponent_disconnected') {
        waitingMessage.textContent = 'Other player has disconnected'
        waitingMessage.style.display = "block";
        gameOver();
        ws.close();
      }
  }

}
setupSocket();


// Array with all created cards
const cardArray = [
  {
    name: 'REA',
    img: './images/REA.png'
  },
  {
    name: 'REA',
    img: './images/REA.png'
  },
  {
    name: 'LIB',
    img: './images/LIB.png'
  },
  {
    name: 'LIB',
    img: './images/LIB.png'
  },
  {
    name: 'AER',
    img: './images/AER.png'
  },
  {
    name: 'AER',
    img: './images/AER.png'
  },
  {
    name: 'ARCH',
    img: './images/ARCH.png'
  },
  {
    name: 'ARCH',
    img: './images/ARCH.png'
  },
  {
    name: 'AULA',
    img: './images/AULA.png'
  },
  {
    name: 'AULA',
    img: './images/AULA.png'
  },
  {
    name: 'EWI',
    img: './images/EWI.png'
  },
  {
    name: 'EWI',
    img: './images/EWI.png'
  }
]

cardArray.sort(() => 0.5 - Math.random())

const grid = document.querySelector('.grid')
const turnText = document.querySelector('#turn')
const resultDisplay1 = document.querySelector('#result1')
const resultDisplay2 = document.querySelector('#result2')
var cardsChosen = [];
var cardsChosenId = [];
var cardsWon = [];
var moves = 0;

// create game board
function createBoard() {
  for(let i = 0; i < cardArray.length; i++){
    var card = document.createElement('img');
    card.setAttribute('src', './images/TUDtile.png')
    card.setAttribute('data-id', i)
    card.addEventListener('click', flipcard, true)
    grid.appendChild(card)
  }
}

function checkForMatch(){
  var cards = document.querySelectorAll('img')

  const optionOneId = cardsChosenId[0]
  const optionTwoId = cardsChosenId[1]

  if(cardsChosen[0] === cardsChosen[1]){
    //alert('You found a match!')
    cards[optionOneId].setAttribute('src', './images/won.png')
    cards[optionTwoId].setAttribute('src', './images/won.png')
    cardsWon.push(cardsChosen)
  }
  else{
    cards[optionOneId].setAttribute('src', './images/TUDtile.png')
    cards[optionTwoId].setAttribute('src', './images/TUDtile.png')
    //alert('Sorry, try again')
    cards[optionOneId].addEventListener('click', flipcard, true)
    cards[optionTwoId].addEventListener('click', flipcard, true)
  }
  cardsChosen = []
  cardsChosenId = []
  resultDisplay1.textContent = cardsWon.length + "/ " + maxTries;
  CheckForWin();
}

function CheckForWin(){
  if(cardsWon.length >= maxTries){
    finishGame();
    waitingMessage.textContent = 'You won!'
    waitingMessage.style.display = "block";
    setTimeout(ws.close(), 500);
  }
  else{
    makeMove();
  }
}

// flips the card
function flipcard(){
  if(!canMove || cardsChosen.length >= 2) return;
  var cardId = this.getAttribute('data-id')
  cardsChosen.push(cardArray[cardId].name)
  cardsChosenId.push(cardId)
  this.setAttribute('src', cardArray[cardId].img)
  this.removeEventListener('click', flipcard, true)
  moves++;
  if(cardsChosen.length === 2){
    setTimeout(checkForMatch, 500)
  }  
}


// timer
function timer(duration, display) {
  var timer = duration, minutes, seconds;
  setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      display.textContent = minutes + ":" + seconds;
      
      if (gameOn) {
        ++timer;
      }
  }, 1000);
}


function startTimer(){
  display = document.querySelector('#time');
  timer(0, display);
}

function gameOver(){
  gameOn = false;
  canMove = false;
  endMessage.textContent = 'GAME OVER';
  endMessage.style.display = "block";
  resetButton.style.display = "block";
  console.log('GAME OVER');
}


// Socket messages
const makeMove = (score) => {
  canMove = false;
  turnText.textContent = "Opponent's turn";
  ws.send(JSON.stringify({
      message: 'next_turn',
      score: cardsWon.length
  }))
}

const finishGame = () => {
  gameOver();
  ws.send(JSON.stringify({
      message: 'game_over'
  }))
}