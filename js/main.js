/*----- constants -----*/
const west = { x: -1, y: 0 };
const east = { x: 1, y: 0 };
const north = { x: 0, y: 1 };
const south = { x: 0, y: -1 };
const northWest = { x: -1, y: 1 };
const northEast = { x: 1, y: 1 };
const southWest = { x: -1, y: -1 };
const southEast = { x: 1, y: -1 };
/*----- state variables -----*/
let board;
let winner;
let currentPlayer;
let players;
let latestInsertion;
/*----- cached elements  -----*/

/*----- event listeners -----*/
document.getElementById("markers").addEventListener("click", handleMarkerClick);
document.getElementById("reset_button").addEventListener("click", init);

function handleMarkerClick(evt) {
    // evaluateRound only if clicking on a div and insertion succeeds
    // meaning column wasn't full
    if (evt.target.tagName !== "DIV") return;
    if (insert(evt.target.id, currentPlayer.boardValue)) evaluateRound();
}

/*----- functions -----*/
function insert(col, n) {
    let top = board[col].indexOf(0);
    if (top !== -1) {
        board[col][top] = n;
        {
            latestInsertion = { x: parseInt(col), y: top };
            return true;
        }
    } else return false;
}

function check(pos, direction, desired = board[pos.x][pos.y], matches = 1) {
    let dest = addCords(direction, pos);
    if (!positionInBounds(dest)) return matches;
    let value = board[dest.x][dest.y];
    if (desired !== value) {
        return matches;
    } else matches++;
    if (matches === 4) return 4;
    else return check(dest, direction, desired, matches);
}
function winnerp(pos) {
    const horizontal = check(pos, west) + check(pos, east);
    const vertial = check(pos, north) + check(pos, south);
    const diagUp = check(pos, northEast) + check(pos, southWest);
    const diagDown = check(pos, southEast) + check(pos, northWest);
    return [horizontal, vertial, diagDown, diagUp].some((x) => x > 3);
}

function valueToColor(n) {
    if (n === 0) return "white";
    else return players.filter((x) => x.boardValue == n)[0].color;
}

function positionInBounds(pos) {
    return (
        pos.y >= 0 &&
        pos.y < board[0].length &&
        pos.x >= 0 &&
        pos.x < board.length
    );
}

function addCords(obA, obB) {
    return { x: obA.x + obB.x, y: obA.y + obB.y };
}

function switchPlayer() {
    if (currentPlayer === players[0]) currentPlayer = players[1];
    else currentPlayer = players[0];
}
function evaluateRound() {
    switchPlayer();
    render();
}
function init() {
    players = [
        { name: "player-one", color: "purple", boardValue: 1 },
        { name: "player-two", color: "gold", boardValue: 2 },
    ];
    numberOfColumns = 6;
    numberOfRows = 7;
    board = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];
    currentPlayer = players[0];
    winner = null;
    render();
}
function render() {
    renderBoard();
    renderMessages();
    renderControls();
}

function renderBoard() {
    board.forEach((colArr, colIdx) => {
        colArr.forEach((el, idx) => {
            document.getElementById(`c${colIdx}r${idx}`).style.backgroundColor =
                valueToColor(el);
        });
    });
}

function renderMessages() {
    let el = document.getElementById("message");
    let color = currentPlayer.color.toUpperCase();
    el.innerText = `${color}'s TURN`;
    el.style.color = color;
}
function renderControls() {}

init();
