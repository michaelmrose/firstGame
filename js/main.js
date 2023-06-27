/*----- constants -----*/

/*----- state variables -----*/
let board; // 0 = white 1 = players[0].color, 2 = players[1].color
let winner;
let turn; //1 = player1 2= player2
let players;
let numberOfRows;
let numberOfColumns;
/*----- cached elements  -----*/

/*----- event listeners -----*/
document.getElementById("markers").addEventListener("click", handleMarkerClick);
document.getElementById("reset_button").addEventListener("click", init);

/*----- functions -----*/
function handleMarkerClick(evt) {
    if (evt.target.tagName !== "DIV") return;
    if (insert(evt.target.id, turn)) evaluateRound();
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
    if (turn === 1) turn = 2;
    else if (turn === 2) turn = 1;

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
    turn = 1;
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
    let color = players[turn - 1].color.toUpperCase();
    el.innerText = `${color}'s TURN`;
    el.style.color = color;
}
function renderControls() {}

init();
