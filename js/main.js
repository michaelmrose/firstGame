/*----- constants -----*/

/*----- state variables -----*/
let board;
let winner;
let currentPlayer;
let players;
let numberOfRows;
let numberOfColumns;
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
    else return players[n - 1].color;
}

function evaluateRound() {
    if (currentPlayer === players[0]) currentPlayer = players[1];
    else currentPlayer = players[0];
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
        // [1, 0, 0, 0, 0, 0],
        // [1, 1, 0, 0, 0, 0],
        // [2, 2, 0, 0, 0, 0],
        // [2, 1, 2, 0, 0, 0],
        // [1, 1, 2, 0, 0, 0],
        // [1, 1, 2, 1, 1, 1],
        // [1, 1, 2, 2, 2, 2],
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
