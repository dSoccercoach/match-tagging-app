let selectedPlayer = null;
let selectedEvent = null;

let period = 1;
let seconds = 0;
let timerInterval;

let matchName = "";

let events = [];
let substitutions = [];

let playerPositions = {};
let tacticalPositions = {};
let playerStatus = {};

let subMode = false;
let subOut = null;
let lastSub = null;

const positions = [
"GK",
"RB",
"RCB",
"LCB",
"LB",
"CM",
"AM",
"RW",
"ST",
"LW",
"SUB"
];

const jersey = [
6,
5,
8,
4,
1,
11,
12,
2,
10,
14,
19,
9,
78,
17,
16,
7,
13,
18
];

function init() {

    loadData();

    registerServiceWorker();

    createPlayers();
    createTagPlayers();
    loadPlayerPositions();

}
document.addEventListener("DOMContentLoaded", init);


function setOpponent() {

let opponent = prompt("Opponent name:");

let date = new Date()
.toISOString()
.split("T")[0];

matchName = date + " vs " + opponent;

document.getElementById("matchName")
.innerText = matchName;
saveData();
}

function createPlayers() {

let fieldLayer =
document.getElementById(
"popupLineupLayer"
);

let bench =
document.getElementById(
"bench"
);

if (!fieldLayer || !bench) {

console.log("Field or bench not found");

return;

}

/* CLEAR */

fieldLayer.innerHTML = "";
bench.innerHTML = "";

/* CREATE 18 PLAYERS */

for (let i = 0; i < 18; i++) {

let player =
document.createElement("div");

player.className = "player";
console.log("Player created :", jersey[i] );

player.innerText = jersey[i];

player.dataset.player = jersey[i];

/* CLICK */

player.onclick = () => {

if (subMode) {
handleSubstitution(parseInt(player.dataset.player) );
return;

}

selectPlayer(i);

};

/* STARTERS */

if (i < 11) {

player.style.position =
"absolute";

player.style.left =
"20px";

player.style.top =
(20 + i * 30) + "px";

fieldLayer.appendChild(player);

}

/* BENCH */

else {

player.style.position =
"static";

player.style.left = "";
player.style.top = "";

bench.appendChild(player);

}

/* DRAG */

makeDraggable(player);

}

/* ensure bench visible */

bench.style.display = "flex";
bench.style.visibility = "visible";
}

function makeDraggable(player) {

    let offsetX = 0;
    let offsetY = 0;

    let startX = 0;
    let startY = 0;

    let isDragging = false;

    const TAP_THRESHOLD = 8; // pixels

    player.addEventListener("mousedown", startDrag);
    player.addEventListener("touchstart", startDrag);

    function startDrag(e) {
        if (subMode) return;
        e.preventDefault();

        let event =
            e.touches ? e.touches[0] : e;

        let rect =
            player.getBoundingClientRect();

        offsetX =
            event.clientX - rect.left;

        offsetY =
            event.clientY - rect.top;

        startX = event.clientX;
        startY = event.clientY;

        isDragging = false;

        document.addEventListener(
            "mousemove",
            drag
        );

        document.addEventListener(
            "touchmove",
            drag,
            { passive: false }
        );

        document.addEventListener(
            "mouseup",
            stopDrag
        );

        document.addEventListener(
            "touchend",
            stopDrag
        );

    }

    function drag(e) {

        let event =
            e.touches ? e.touches[0] : e;

        let dx =
            Math.abs(
                event.clientX - startX
            );

        let dy =
            Math.abs(
                event.clientY - startY
            );

        if (
            dx > TAP_THRESHOLD ||
            dy > TAP_THRESHOLD
        ) {

            isDragging = true;

        }

        if (!isDragging) return;

        e.preventDefault();

        let container =
            document.getElementById(
                "popupLineupContainer"
            );

        let rect =
            container.getBoundingClientRect();

        let x =
            event.clientX -
            rect.left -
            offsetX;

        let y =
            event.clientY -
            rect.top -
            offsetY;

        player.style.left =
            x + "px";

        player.style.top =
            y + "px";

    }

    function stopDrag(e) {

        document.removeEventListener(
            "mousemove",
            drag
        );

        document.removeEventListener(
            "touchmove",
            drag
        );

        document.removeEventListener(
            "mouseup",
            stopDrag
        );

        document.removeEventListener(
            "touchend",
            stopDrag
        );

        if (!isDragging) {

            let id =
                player.dataset.player;

            if (subMode) {

                handleSubstitution(
                    parseInt(id)
                );

            }

            else {

                selectPlayer(
                    parseInt(id)
                );

            }

        }

        else {

            savePlayerPositions();

        }

    }

}

function showPositionMenu(player) {

let position =
prompt(
"Select position:\n" +
positions.join(", ")
);

if (!position) return;

tacticalPositions[player] = position;

}

function selectEvent(event) {

selectedEvent = event;

/* highlight button */

let buttons =
document.querySelectorAll(
".event-btn"
);

buttons.forEach(btn => {

if (btn.innerText === event)

btn.classList.add("active");

else

btn.classList.remove("active");

});

}

function startMatch() {

clearInterval(timerInterval);

timerInterval =
setInterval(() => {

seconds++;

updateTimer();

}, 1000);

}

function stopMatch() {

clearInterval(timerInterval);

}

function nextHalf() {

period++;

seconds = 0;

updateTimer();

}

function updateTimer() {

let min =
Math.floor(seconds / 60);

let sec =
seconds % 60;

let timeText =
String(min).padStart(2, "0")
+
":"
+
String(sec).padStart(2, "0");

/* ADD PERIOD DISPLAY */

document.getElementById("timer")
.innerText =
timeText + " | P" + period;

}


function startSubstitution() {

subMode = true;

subOut = null;

document.getElementById(
"subStatus"
).innerText =
"Select OUT player";

}

function handleSubstitution(player) {
console.log("CLICK detected on player:", player);
if (!subMode) return;

let fieldLayer =
document.getElementById(
"popupLineupLayer"
);

let bench =
document.getElementById(
"bench"
);

/* FIRST CLICK — SELECT OUT */

if (subOut === null) {
console.log("FIRST CLICK — OUT player selected:", player);

subOut = player;
document.querySelectorAll(".player")
.forEach(p => {
let id =
parseInt(
p.dataset.player
);

p.classList.toggle(
"sub-out",
id === subOut
);

});

document.getElementById(
"subStatus"
).innerText =
"Select IN player";

return;

}

/* SECOND CLICK */

let subIn = player;
/* GET PLAYER ELEMENTS */
console.log("FIRST CLICK — IN player selected:", player);

/* GET PLAYERS — SAFE LOOKUP */

let outPlayer = null;
let inPlayer = null;

document.querySelectorAll(".player").forEach(p => {

    let id = parseInt(p.dataset.player);

    if (id === subOut) outPlayer = p;

    if (id === subIn) inPlayer = p;

});

/* SAFETY CHECK */

if (!outPlayer || !inPlayer) {

    console.log(
        "Player lookup failed",
        "outPlayer:",
        outPlayer,
        "inPlayer:",
        inPlayer
    );

    return;

}

/* DEBUG */

console.log(
"OUT location:",
outPlayer.parentElement?.id,
"IN location:",
inPlayer.parentElement?.id
);

/* VALIDATE LOCATIONS */

let outLocation =
outPlayer.parentElement.id;

let inLocation =
inPlayer.parentElement.id;

if (outLocation === inLocation) {

    alert(
        "Select a player from the other group"
    );

    return;

}

/* SAVE POSITION */

let outX =
outPlayer.style.left || "20px";

let outY =
outPlayer.style.top || "20px";

lastSub = {

out: subOut,
in: subIn,
outX: outX,
outY: outY

};

/* MOVE OUT PLAYER TO BENCH */

outPlayer.classList.remove(
"sub-out"
);

outPlayer.style.position =
"static";

outPlayer.style.left = "";

outPlayer.style.top = "";

bench.appendChild(
outPlayer
);

/* MOVE IN PLAYER TO FIELD */

inPlayer.style.position =
"absolute";

inPlayer.style.left =
outX;

inPlayer.style.top =
outY;

fieldLayer.appendChild(
inPlayer
);

/* LOG SUB */

playerStatus[subOut] =
"OFF";

playerStatus[subIn] =
"ON";

substitutions.push({

match: matchName,

out: subOut,

in: subIn,

time:
document.getElementById(
"timer"
).innerText,

period: period

});

/* RESET */

document.querySelectorAll(
".player"
).forEach(p =>
p.classList.remove(
"sub-out"
)
);

console.log(
"Sub completed:",
subOut,
"->",
subIn
);

subMode = false;
subOut = null;
document.getElementById(
    "subStatus"
).innerText = "";

savePlayerPositions();

saveData();

}

function undoSubstitution() {

if (!lastSub) {
alert("Nothing to undo");
return;
}

let fieldLayer = document.getElementById("popupLineupLayer");
let bench = document.getElementById("bench");

let players = document.querySelectorAll(".player");

/* restore OUT player to field */
players.forEach(p => {

if (parseInt(p.dataset.player) === lastSub.out) {

p.style.position = "absolute";
p.style.left = lastSub.outX;
p.style.top = lastSub.outY;

fieldLayer.appendChild(p);

}

/* restore IN player to bench */
if (parseInt(p.dataset.player) === lastSub.in) {

p.style.position = "static";
p.style.left = "";
p.style.top = "";

bench.appendChild(p);

}

});

/* remove last sub from history */
substitutions.pop();

lastSub = null;

savePlayerPositions();

saveData();

document.getElementById(
    "subStatus"
).innerText =
    "SUB UNDONE";

}

function getZone(x, y, width, height) {

let cols = 7;
let rows = 8;

let colSize = width / cols;
let rowSize = height / rows;

let col = Math.floor(x / colSize);
let row = Math.floor(y / rowSize);

/* convert to letters */
let rowLetter = ["A", "B", "C","D", "E", "F","G", "H"][row];
let colNumber = col + 1;

return rowLetter + colNumber;

}


function recordZone(e) {


if (!selectedPlayer || !selectedEvent) {
alert("Select player and event");
return;
}

let rect =
document.getElementById(
"popupLineupContainer"
).getBoundingClientRect();

let event =
    e.touches ? e.touches[0] : e;

let x =
    event.clientX - rect.left;

let y =
    event.clientY - rect.top;

/* NEW: zone calculation */
let zone = getZone(x, y, rect.width, rect.height);

events.push({

match: matchName,
player: selectedPlayer,
event: selectedEvent,
zone: zone,
x: Math.round(x),
y: Math.round(y),
time: document.getElementById("timer").innerText,
period: period,
position: getPlayerPosition(selectedPlayer)

});

saveData();

console.log("Event recorded in zone:", zone);

}

function saveData() {

localStorage.setItem(
"events",
JSON.stringify(events)
);

localStorage.setItem(
"subs",
JSON.stringify(substitutions)
);

localStorage.setItem(
"positions",
JSON.stringify(tacticalPositions)
);
localStorage.setItem(
    "matchName",
    matchName
);

}

function loadData() {

let e =
localStorage.getItem("events");

if (e)
events = JSON.parse(e);

let s =
localStorage.getItem("subs");

if (s)
substitutions = JSON.parse(s);

let p =
localStorage.getItem("positions");

if (p)
tacticalPositions = JSON.parse(p);

let m =
    localStorage.getItem(
        "matchName"
    );

if (m) {

    matchName = m;

    document.getElementById(
        "matchName"
    ).innerText =
        matchName;

}

}

function exportCSV() {

let csv =
"match,time,period,type,player,position,zone,x,y\n"

events.forEach(e => {

csv += `${e.match},${e.time},${e.period},${e.event},${e.player},${e.position},${e.zone},${e.x},${e.y}\n`;
});

substitutions.forEach(s => {

csv +=
`${s.match},${s.time},${s.period},SUB_OUT,${s.out},,,\n`;

csv +=
`${s.match},${s.time},${s.period},SUB_IN,${s.in},,,\n`;

});

let blob =
new Blob(
[csv],
{ type: "text/csv" }
);

let url =
URL.createObjectURL(blob);

let a =
document.createElement("a");

a.href = url;

a.download =
matchName + ".csv";

a.click();

}

function registerServiceWorker() {

if ("serviceWorker" in navigator) {

navigator.serviceWorker
.register(
"service-worker.js"
);

}

}


function savePlayerPositions() {

   let players =
document.querySelectorAll(
    "#popupLineupLayer .player, #bench .player"
);

    let positions = {};

    players.forEach(p => {

        let parent =
            p.parentElement.id;

        positions[
            p.dataset.player
        ] = {

            x: p.style.left,
            y: p.style.top,

            location: parent
            // popupLineupLayer OR bench

        };

    });
    playerPositions = positions;

    localStorage.setItem(
    "fieldPositions",
    JSON.stringify(positions)
    );

}
function createTagPlayers() {

let panel =
document.getElementById(
"tagPlayerPanel"
);

if (!panel) return;

panel.innerHTML = "";

/* CREATE 18 PLAYERS */

for (let i = 0; i < 18; i++) {

let player =
document.createElement("div");

player.className = "player";

player.innerText = jersey[i];

player.dataset.player = jersey[i];

/* IMPORTANT */
player.style.position = "static";

/* CLICK */

player.onclick = () => {

selectedPlayer = jersey[i];

highlightTagPlayer(jersey[i]);

};

panel.appendChild(player);

}

}

function highlightTagPlayer(number) {

let players =
document.querySelectorAll(
"#tagPlayerPanel .player"
);

players.forEach(p => {

if (p.innerText == number) {

p.style.background = "blue";

p.style.transform = "scale(1.2)";

}

else {

p.style.background = "red";

p.style.transform = "scale(1)";

}

});

}

function loadPlayerPositions() {

    let saved =
        localStorage.getItem(
            "fieldPositions"
        );

    if (!saved) return;

    let positions =
        JSON.parse(saved);

    let fieldLayer =
        document.getElementById(
            "popupLineupLayer"
        );

    let bench =
        document.getElementById(
            "bench"
        );

   let players =
document.querySelectorAll(
    "#popupLineupLayer .player, #bench .player"
);

    players.forEach(p => {

        let id =
            p.dataset.player;

        if (!positions[id])
            return;

        let pos =
            positions[id];

        /* MOVE PLAYER TO SAVED LOCATION */

        if (
            pos.location === "bench"
        ) {

            p.style.position =
                "static";

            bench.appendChild(p);

        }

        else {

            p.style.position =
                "absolute";

            fieldLayer.appendChild(p);

        }

        /* RESTORE POSITION */

        if (pos.x)
            p.style.left = pos.x;

        if (pos.y)
            p.style.top = pos.y;

    });

}

function selectPlayer(number) {

selectedPlayer = number;

highlightSelectedPlayer(number);

}
function getPlayerPosition(player) {

return tacticalPositions[player] || "";

}

function clearMatchData() {

let confirmClear =
confirm(
"Clear all recorded events and substitutions?"
);

if (!confirmClear)
return;

/* CLEAR EVENTS */

events = [];

localStorage.removeItem(
"events"
);

/* CLEAR SUBSTITUTIONS */

substitutions = [];

localStorage.removeItem(
"subs"
);

/* RESET UNDO */

lastSub = null;

/* OPTIONAL: reset player status */

playerStatus = {};

/* SAVE CLEAN STATE */

saveData();

alert(
"Events and substitutions cleared"
);

}

function clearLastEvents() {

if (events.length === 0) return;

let confirmClear =
confirm(
"Clear last event?"
);

if (!confirmClear)
return;

events.pop();

saveData();

alert("Last event removed");

}

function highlightSelectedPlayer(number) {

let players =
document.querySelectorAll(
"#popupLineupLayer .player, #bench .player"
)

players.forEach(p => {

if (p.innerText == number) {

p.style.background = "blue";

p.style.transform = "scale(1.2)";

}

else {

p.style.background = "red";

p.style.transform = "scale(1)";

}

});

}




function toggleLineup() {

let frame =
document.getElementById("lineupFrame");

if (!frame) {

alert("lineupFrame not found");

return;

}

if (
frame.style.display === "none" ||
frame.style.display === ""
) {

frame.style.display = "block";

loadPlayerPositions();

console.log("Line-up shown");

}

else {

frame.style.display = "none";

console.log("Line-up hidden");

}

}

function openLineup() {

document.getElementById(
"lineupModal"
).style.display = "block";

/* ALWAYS rebuild players */
document.body.style.overflow = "hidden";
if (
    document.querySelectorAll(
        "#popupLineupLayer .player, #bench .player"
    ).length === 0
) {
    createPlayers();
}

loadPlayerPositions();

}

function closeLineup() {

    document.body.style.overflow =
        "auto";

    savePlayerPositions();

    document.getElementById(
        "lineupModal"
    ).style.display = "none";

}