// eslint-disable-next-line no-undef
const socket = io();
let timerFunc;
socket.on('begin', () => {
	startTimer();
});

socket.on('player_finished', (player) => {
	playerFinished(player);
});

socket.on('finished', (players) => {
	gameOver(players);
});
let timerHTML = '';
let beginTime = 0;
let players = [];
let sortedPlayers = [];
let timerArray = [];
let resultsHTML = '';
let numPlayers = 1;
let playersRemaining = players.length;
const timers = document.getElementById('timers-display');

createPlayers(numPlayers);

document.getElementById('name-modal-save').addEventListener('click', () => {
	saveNames();
	nameModal.style.display = 'none';
});
document.getElementById('penalty-modal-save').addEventListener('click', () => {
	penaltyModal.style.display = 'none';
	assessPenalty();
});

document.getElementById('num-players').addEventListener('click', () => {
	numPlayers = document.getElementById('num-players').value;
	newGame();
});

document.getElementById('btnSimulate').addEventListener('click', () => {
	document.getElementById('num-players').disabled = true;
	newGame();
	sortedPlayers = [];
	players.forEach((player) => {
		player.time = '0:00.00';
		player.finished = false;
		drawTime(player);
	});
	socket.emit('simulate', { players, maxLength: 5 });
});

function newGame() {
	document.getElementById('btnPenalties').style.display = 'none';
	createPlayers(numPlayers);
	document.getElementById('results-display').innerHTML = resultsHTML = '';
}

function createPlayers(num) {
	if (num <= players.length) {
		players = players.slice(0, num);
	} else {
		for (let index = players.length; index < num; index++) {
			let player = {
				name: 'Player ' + (index + 1),
				id: `player_${index + 1}`,
				time: '0:00.000',
				finished: false
			};
			players.push(player);
		}
	}
	playersRemaining = players.length;
	createTimers();
}

function createTimers() {
	timerHTML = '';
	let modalInputs = '';
	let modalPenalty = '';
	timerArray = [];
	players.forEach((player) => {
		index = players.indexOf(player) + 1;

		const indivTimer = `<h2 class="player-h2"><label class="player-label" id="label-${index}" for="player_${index}">&nbsp;${player.name}&nbsp;</label><div class="time" id="${player.id}">0:00.00</div></h2>`;

		timerHTML += indivTimer;

		timerArray.push(indivTimer);

		modalInputs += `<div class="modal-players"><label class="modal-label" for="edit-${index}">Player ${index}:</label><br><input type="text" name="edit-${index}" class="modal-textbox" id="edit-${index}" value="${player.name}"></div><br>`;

		modalPenalty += `<p class="modal-label"><span id="penalty-label-${index}">Player ${index}:&nbsp;</span><input type="number" min='0' max='5' class="penalty" id="penalty-${index}" value='0'></p>`;
	});
	timers.innerHTML = timerHTML;
	document.getElementById('name-modal-boxes').innerHTML = modalInputs;
	document.getElementById('penalty-modal-boxes').innerHTML = modalPenalty;
}

function removeTimer(index) {
	timerArray[index] = '';
	var newTimers = '';
	timerArray.forEach((timer) => {
		newTimers += timer;
	});
	timers.innerHTML = newTimers;
}

function saveNames() {
	let index = 0;
	players.forEach((player) => {
		const name = document.getElementById(`edit-${index + 1}`).value;
		if (name !== '') {
			player.name = name;
			document.getElementById(`label-${index + 1}`).innerHTML = `&nbsp;${name}&nbsp;`;
			document.getElementById(`penalty-label-${index + 1}`).innerHTML = `${name}:&nbsp;`;
		}
		index++;
	});
}

function startTimer() {
	beginTime = new Date(Date.now()).getTime();
	timerFunc = setInterval(() => {
		const elapsed = new Date(Date.now()).getTime() - beginTime;
		const formattedTime = formatTime(elapsed);
		updateTimes(formattedTime);
	}, 10);
}

function updateTimes(newTime) {
	players.forEach((player) => {
		if (!player.finished) {
			player.time = newTime;
		}
		drawTime(player);
	});
}

function drawTime(player) {
	document.getElementById(player.id).innerHTML = player.time;
}

function formatTime(milli) {
	const minutes = Math.floor(milli / 1000 / 60).toString();
	const seconds = (Math.floor(milli / 1000) % 60).toString().padStart(2, '0');
	const ms = (milli % 1000).toString().padStart(3, '0');
	const time = `${minutes}:${seconds}.${ms}`;
	return time.slice(0, -1);
}

function playerFinished(player) {
	const idx = players.findIndex((x) => x.id === player.id);
	players[idx] = player;
	player.ogTime = player.time;
	sortedPlayers.push(player);
	showResults(player, sortedPlayers.length);
	playersRemaining--;
	if (!playersRemaining) {
		clearInterval(timerFunc);
	}
	removeTimer(idx);
}

function gameOver(donePlayers) {
	donePlayers.forEach((player) => {
		drawTime(player);
	});
	setTimeout(showRankings, 750);
	document.getElementById('num-players').disabled = false;
	document.getElementById('btnPenalties').style.display = 'block';
}

function showResults(player, rank) {
	const placing = [ '1st', '2nd', '3rd', '4th', '5th' ];
	resultsHTML += `<div class="rankings-container">
						<div class="rankings rankings-${rank}">
							<p>${placing[rank - 1]}</p>
						</div>
						<div class="rankings-players">
							<h2 class="player-results"><label class="player-label" id="label-${rank}" for="player_${rank}">&nbsp;${player.name}&nbsp;</label><div class="time" id="${player.id}">${player.time}</div>
							</h2>
						</div>
					</div>`;

	document.getElementById('results-display').innerHTML = resultsHTML;
}

function showRankings() {
	let rankingsContainer = document.querySelectorAll('.rankings-container');
	let rankings = document.querySelectorAll('.rankings');
	for (let index = 0; index < rankings.length; index++) {
		rankings[index].style.display = 'block';
		rankingsContainer[index].style.paddingLeft = '0';
	}
}

function assessPenalty() {
	sortedPlayers.forEach((player) => {
		var penalty = document.getElementById(`penalty-${players.indexOf(player) + 1}`).value;
		var adjTime = addPenalties(player.ogTime, penalty);
		player.time = adjTime;
	});
	sortTimes(sortedPlayers);
	resultsHTML = '';
	sortedPlayers.forEach((player) => {
		showResults(player, sortedPlayers.indexOf(player) + 1);
	});
	showRankings();
}

function sortTimes(players) {
	players.sort((a, b) => {
		let timeA = a.time;
		let timeB = b.time;

		if (timeA.length < timeB.length) {
			return -1;
		} else if (timeA.length > timeB.length) {
			return 1;
		} else {
			return timeA < timeB ? -1 : timeA > timeB ? 1 : 0;
		}
	});
}

function addPenalties(time, penalties) {
	let x = time.split(':');
	let y = x[1].split('.');
	let min = parseInt(x[0]);
	let sec = parseInt(y[0]);
	let milli = parseInt(y[1]);
	sec += penalties * 2;
	if (milli < 10) {
		milli = '0' + milli;
	}
	if (sec < 10) {
		sec = '0' + sec;
	} else if (sec > 60) {
		min++;
		sec = sec - 60;
		if (sec < 10) {
			sec = '0' + sec;
		}
	}

	var newTime = min + ':' + sec + '.' + milli;

	return newTime;
}

// Edit names Modal
const nameModal = document.getElementById('nameModal');
const penaltyModal = document.getElementById('penaltyModal');
const btnNames = document.getElementById('btnNames');
const btnPenalties = document.getElementById('btnPenalties');
const span = document.getElementsByClassName('close')[0];
btnNames.onclick = function showModal() {
	nameModal.style.display = 'block';
};
btnPenalties.onclick = function showModal() {
	penaltyModal.style.display = 'block';
};
