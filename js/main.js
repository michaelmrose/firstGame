/*----- constants -----*/

/*----- state variables -----*/
let board;
let winner;
let currentPlayer;
let players;
/*----- cached elements  -----*/

/*----- event listeners -----*/
document.getElementById("markers").addEventListener("click", handleMarkerClick);
document.getElementById("reset_button").addEventListener("click", init);

/*----- functions -----*/
function handleMarkerClick(evt) {
    // evaluateRound only if clicking on a div and insertion succeeds
    // meaning column wasn't full
    if (evt.target.tagName !== "DIV") return;
    if (insert(evt.target.id, currentPlayer.boardValue)) evaluateRound();
}
function insert(col, n) {
    let top = board[col].indexOf(0);
    if (top !== -1) {
        board[col][top] = n;
        return true;
    } else return false;
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

function check(pos, direction, desired, matches) {
    if (typeof matches === "undefined") matches = 1;
    if (typeof desired === "undefined") desired = board[pos.x][pos.y];

    let dest = addCords(direction, pos);
    if (!positionInBounds(dest)) {
        return false;
    }
    let value = board[dest.x][dest.y];
    if (desired === value) matches++;
    else {
        return false;
    }
    if (matches === 4) return true;
    else return check(dest, direction, desired, matches);
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
