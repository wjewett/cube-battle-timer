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
let bannerValues = [
	{
		color: 'linear-gradient(to right, rgb(167, 29, 49), rgb(63, 13, 18), rgb(63, 13, 18), rgb(167, 29, 49))',
		text: 'select players and enter names'
	},
	{
		color: 'linear-gradient(to right, rgb(236,159,5), rgb(255,78,0), rgb(255,78,0), rgb(236,159,5))',
		text: 'players, get ready!'
	},
	{
		color: 'linear-gradient(to right, rgb(99,212,113), rgb(35,51,41), rgb(35,51,41), rgb(99,212,113))',
		text: 'solve!!!'
	},
	{
		color: 'linear-gradient(to right, rgb(0,159,253), rgb(42,42,114), rgb(42,42,114), rgb(0,159,253))',
		text: 'awaiting final results from judges'
	},
	{
		color: 'linear-gradient(to right, rgb(164,80,139), rgb(95,10,135), rgb(95,10,135), rgb(164,80,139))',
		text: 'the winner is '
	}
];
let banner = [ document.getElementById('banner'), document.getElementById('banner-text') ];

createPlayers(numPlayers);
banner[0].style.backgroundImage = bannerValues[0].color;
banner[1].innerHTML = bannerValues[0].text;

document.getElementById('name-modal-save').addEventListener('click', () => {
	saveNames();
	nameModal.style.display = 'none';
});
document.getElementById('penalty-modal-save').addEventListener('click', () => {
	assessPenalty();
});

document.getElementById('num-players').addEventListener('click', () => {
	numPlayers = document.getElementById('num-players').value;
	banner[0].style.backgroundImage = bannerValues[0].color;
	banner[1].innerHTML = bannerValues[0].text;
	newGame();
});

document.getElementById('btnStage').addEventListener('click', () => {
	if (nameModal.style.display === 'block') {
		saveNames();
		nameModal.style.display = 'none';
	}
	banner[0].style.backgroundImage = bannerValues[1].color;
	banner[1].innerHTML = bannerValues[1].text;
	document.getElementById('num-players').disabled = true;
	penaltyModal.style.display = 'none';
	newGame();
	sortedPlayers = [];
	players.forEach((player) => {
		player.time = '0:00.00';
		player.finished = false;
		drawTime(player);
	});
	setTimeout(() => {
		socket.emit('simulate', { players, maxLength: 5 });
		banner[0].style.backgroundImage = bannerValues[2].color;
		banner[1].innerHTML = bannerValues[2].text;
	}, 2000);
});

function newGame() {
	penaltyModal.style.display = 'none';
	createPlayers(numPlayers);
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
	playersRemaining--;
	if (!playersRemaining) {
		clearInterval(timerFunc);
	}
}

function gameOver(donePlayers) {
	donePlayers.forEach((player) => {
		drawTime(player);
	});
	setTimeout(showRankings, 750);
	document.getElementById('num-players').disabled = false;
	penaltyModal.style.display = 'block';
	banner[0].style.backgroundImage = bannerValues[3].color;
	banner[1].innerHTML = bannerValues[3].text;
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
		document.getElementById('timers-display').innerHTML = resultsHTML;
	});
	showRankings();
	banner[0].style.backgroundImage = bannerValues[4].color;
	banner[1].innerHTML = bannerValues[4].text + sortedPlayers[0].name + '!';
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
const span = document.getElementsByClassName('close')[0];
btnNames.onclick = function showModal() {
	nameModal.style.display = 'block';
};
