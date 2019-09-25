/* eslint-disable prefer-template */
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const timerFn = require('./timer');
const Gpio = require('onoff').Gpio;

const port = process.env.PORT || 3000;

const LEDMaster = new Gpio(19, 'out');

const BUTTON1 = new Gpio(18, 'in', 'rising', {debounceTimeout: 10}); //use GPIO pin 18 as input, and 'both' button presses, and releases should be handled
const BUTTON2 = new Gpio(23, 'in', 'rising', {debounceTimeout: 10}); //use GPIO pin 23 as input, and 'both' button presses, and releases should be handled
const BUTTON3 = new Gpio(24, 'in', 'rising', {debounceTimeout: 10}); //use GPIO pin 24 as input, and 'both' button presses, and releases should be handled
const BUTTON4 = new Gpio(25, 'in', 'rising', {debounceTimeout: 10}); //use GPIO pin 25 as input, and 'both' button presses, and releases should be handled
const BUTTONMaster = new Gpio(12, 'in', 'rising', {debounceTimeout: 10}); //use GPIO pin 12 as input, and 'both' button presses, and releases should be handled

const timer = timerFn('myTimer');
let playersRemaining = 0;
let timeouts = [];
let arrayPlayers = [];
let staged = false;

io.on('connection', (socket) => {
    socket.on('timer_reset', () => {
        timer.clear();
    });

    socket.on('message', (data) => { console.log(data); });

    socket.on('stage', (simReq) => {
        const players = simReq;
        socket.broadcast.emit('stage', players);
        arrayPlayers = players;
        console.log(arrayPlayers, players)
        stageEvent();
    });

    socket.on('finalize', (data) => {
        socket.broadcast.emit('finalize', data);
    });
});

app.use(express.static('public'));

http.listen(port, () => {});

BUTTON1.watch((err, value) => {
    const PLAYER = 1;
    console.log('button 1');
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
      return;
    }
    if (playerActive(PLAYER) && timer.isRunning()) {
        playerFinished(arrayPlayers[PLAYER - 1]);
    }
});

BUTTON2.watch((err, value) => {
    console.log('button 2');
    const PLAYER = 2;
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
      return;
    }
    if (playerActive(PLAYER) && timer.isRunning()) {
        playerFinished(arrayPlayers[PLAYER - 1]);
    }
});

BUTTON3.watch((err, value) => {
    console.log('button 3');
    const PLAYER = 3;
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
      return;
    }
    if (playerActive(PLAYER) && timer.isRunning()) {
        playerFinished(arrayPlayers[PLAYER - 1]);
    }
});

BUTTON4.watch((err, value) => {
    console.log('button 4');
    const PLAYER = 4;
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
      return;
    }
    if (playerActive(PLAYER) && timer.isRunning()) {
        playerFinished(arrayPlayers[PLAYER - 1]);
    }
});

BUTTONMaster.watch((err, value) => {
    console.log('button master', timer.isRunning(), staged);
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
      return;
    }

    if (!timer.isRunning() && staged) {
        startEvent();
    }
});

function simEvent(maxLength) {
    playersRemaining = 0;
    if (!arrayPlayers.length) {
        return;
    }
    playersRemaining = arrayPlayers.length;
    if (timer.isRunning()) {
        timer.stop();
    }

    if (timeouts.length > 0) {
        timeouts.forEach((myTimer) => {
            clearTimeout(myTimer);
        });
        timeouts = [];
    }
    timer.clear();
    timer.start();
    io.emit('begin', arrayPlayers);
    arrayPlayers.forEach((player) => {
        const timerId = setTimeout(() => { playerFinished(player); }, getRandomInt((maxLength * 500), maxLength * 1000));
        timeouts.push(timerId);
    });
}

function startEvent() {
    timer.start();
    io.emit('begin');
    staged = false;
}

function stageEvent() {
    playersRemaining = 0;
    if (!arrayPlayers.length) {
        return;
    }
    playersRemaining = arrayPlayers.length;
    if (timer.isRunning()) {
        timer.stop();
    }

    timer.clear();
    staged = true; 
}

function playerFinished(player) {
    const finishedPlayer = { ...player };
    finishedPlayer.time = timer.currTime();
    finishedPlayer.finished = true;
    console.log('player_finished', JSON.stringify(finishedPlayer));
    playersRemaining--;
    io.emit('player_finished', finishedPlayer);
    const idx = arrayPlayers.findIndex((x) => x.id === finishedPlayer.id);
    // eslint-disable-next-line no-param-reassign
    arrayPlayers[idx] = finishedPlayer;
    if (!playersRemaining) {
        timer.stop();
        allDone();
    }
}
function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}

function allDone() {
    io.emit('finished', arrayPlayers);
}
function playerActive(number) {
    return arrayPlayers.length && arrayPlayers.length >= number && !arrayPlayers[number-1].finished;
}
