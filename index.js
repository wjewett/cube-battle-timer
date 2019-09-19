/* eslint-disable prefer-template */
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const timerFn = require('./timer');

const port = process.env.PORT || 3000;

const timer = timerFn('myTimer');
let playersRemaining = 0;
let timeouts = [];

io.on('connection', (socket) => {
    socket.on('timer_reset', () => {
        timer.clear();
    });

    socket.on('message', (data) => { console.log(data); });

    socket.on('timer_start', () => {
        timer.start();
    });

    socket.on('simulate', (simReq) => {
        const { players, maxLength } = simReq;
        simEvent(players, maxLength);
    });
});

app.use(express.static('public'));

http.listen(port, () => {});

function simEvent(players, maxLength) {
    playersRemaining = 0;
    if (!players.length) {
        return;
    }
    playersRemaining = players.length;
    if (timer.isRunning) {
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
    io.emit('begin');
    players.forEach((player) => {
        const timerId = setTimeout(() => { playerFinished(player); }, getRandomInt((maxLength * 500), maxLength * 1000));
        timeouts.push(timerId);
    });

    function playerFinished(player) {
        const finishedPlayer = { ...player };
        finishedPlayer.time = timer.currTime();
        finishedPlayer.finished = true;
        playersRemaining--;
        io.emit('player_finished', finishedPlayer);
        const idx = players.findIndex((x) => x.id === finishedPlayer.id);
        // eslint-disable-next-line no-param-reassign
        players[idx] = finishedPlayer;
        if (!playersRemaining) {
            timer.stop();
            allDone(players);
        }
    }
}

function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}

function allDone(players) {
    io.emit('finished', players);
}
