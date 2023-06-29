/*----- constants -----*/
//------------------------------------------------------------//
// We use positions in the form of {x: number, y: number} both to
// represent absolute positions and relative positions. EG -1 /1
// represents a movement along that axis.
//------------------------------------------------------------//
const west = { x: -1, y: 0 };
const east = { x: 1, y: 0 };
const north = { x: 0, y: 1 };
const south = { x: 0, y: -1 };
const northWest = { x: -1, y: 1 };
const northEast = { x: 1, y: 1 };
const southWest = { x: -1, y: -1 };
const southEast = { x: 1, y: -1 };
//-------------------------------------------------------------//
// STATE VARIABLES
//-------------------------------------------------------------//

let board;
let winner;
let currentPlayer;
let players;
let latestInsertion;
let message;
let numberOfColumns;
let numberOfRows;
let matchesToWin;

//-------------------------------------------------------------//
// ELEMENTS
//-------------------------------------------------------------//
let messageElement = document.getElementById("message");
let markersElement = document.getElementById("markers");
let boardEl = document.getElementById("board");

document.getElementById("reset_button").addEventListener("click", init);

//-------------------------------------------------------------//
// FUNCTIONS
//-------------------------------------------------------------//

//------------------------------------------------------------//
// The core logic is contained herein.  Attempt to insert.
// If insertion succeeds test board along possible axis for 3 addition matching
// positions and either end the game or switch the active player.
//------------------------------------------------------------//

function handleMarkerClick(evt) {
    //-------------------------------------------------------------//
    // Only if clicking on a div and insertion succeeds
    // meaning column wasn't full insert a value
    //-------------------------------------------------------------//
    if (evt.target.tagName !== "DIV") return; //click better
    let latestInsertion = insert(evt.target.column, currentPlayer.boardValue);
    if (latestInsertion) {
        if (isWinningPosition(latestInsertion)) endGame();
        else switchPlayer();
        render();
    }
}

boardEl.addEventListener("click", (evt) => {
    if (evt.target.tagName !== "DIV") return;
    console.log(evt.target.column);
});

//-------------------------------------------------------------//
// Inserts number representing player into first unoccupied position
// in col, represented by current value being zero, and then returns
// the pos of most recent insertion both to see if insertion AND
// to test the value to see if player won
//-------------------------------------------------------------//
function insert(col, n) {
    let top = board[col].indexOf(0); //first zero is the first empty slot

    //if not already full
    if (top !== -1) {
        board[col][top] = n;
        {
            let latestInsertion = { x: parseInt(col), y: top };
            return latestInsertion;
        }
    } else return false;
}

//-------------------------------------------------------------//
// Takes position {x: n y: n} and direction {x: n y: n} and uses to them
// to recursively find the number of positions matching the value
// found at pos. It returns the current number of matches when we
// either run off the board, find a non-matching value, or get to 3
// indicating we have a total of 4 matching values in a line.
//-------------------------------------------------------------//
function check(pos, direction, desired = board[pos.x][pos.y], matches = 0) {
    let dest = addCords(direction, pos);
    if (!positionInBounds(dest)) return matches;
    let value = board[dest.x][dest.y];
    if (desired !== value) {
        return matches;
    }
    return check(dest, direction, desired, ++matches);
}
//-------------------------------------------------------------//
// If the number of matches found along combination of vectors eg
// east and west is 3 or more the position is a winning position and
// currentPlayer is the winner.
//-------------------------------------------------------------//
function isWinningPosition(pos) {
    const horizontal = check(pos, west) + check(pos, east) + 1;
    const vertical = check(pos, north) + check(pos, south) + 1;
    const diagUp = check(pos, northEast) + check(pos, southWest) + 1;
    const diagDown = check(pos, southEast) + check(pos, northWest) + 1;
    return [horizontal, vertical, diagDown, diagUp].some(
        (x) => x >= matchesToWin
    );
}

function switchPlayer() {
    if (currentPlayer === players[0]) currentPlayer = players[1];
    else currentPlayer = players[0];
    message = `${currentPlayer.color.toUpperCase()}'s TURN `;
}

function endGame() {
    message = `${currentPlayer.color.toUpperCase()} WINS`;
    markersElement.removeEventListener("click", handleMarkerClick);
    boardEl.removeEventListener("click", handleMarkerClick);
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
function repeat(x, times) {
    let res = [];
    for (let i = 0; i < times; i++) res.push(x);
    return res;
}

function buildBoard(width, height, boardEl) {
    for (let rowNumber = width - 1; rowNumber >= 0; rowNumber--) {
        for (let columnNumber = 0; columnNumber < height; columnNumber++) {
            let el = document.createElement("div");
            el.id = `c${columnNumber}r${rowNumber}`;
            el.row = rowNumber;
            el.column = columnNumber;
            boardEl.appendChild(el);
        }
    }
}
function buildMarkers(width, markerEl) {
    for (let i = 0; i < width; i++) {
        let el = document.createElement("div");
        el.id = i;
        el.column = i;
        markerEl.appendChild(el);
    }
}

function clearBoardandMarkers() {
    boardEl.innerHTML = "";
    markersElement.innerHTML = "";
}

//TODO this shouldn't hardcode the 9 here and markers should be a child of game
function setBoardColumnsStyle(width, boardEl, markerEl) {
    boardEl.style.gridTemplateColumns = `repeat(${width},9vmin)`;
    markerEl.style.gridTemplateColumns = `repeat(${width},9vmin)`;
}

function init() {
    clearBoardandMarkers();
    players = [
        { name: "player-one", color: "purple", boardValue: 1 },
        { name: "player-two", color: "gold", boardValue: 2 },
    ];

    numberOfColumns = 9;
    numberOfRows = 6;
    matchesToWin = 5;
    board = [];
    let column = repeat(0, numberOfRows);
    for (let i = 0; i < numberOfColumns; i++) {
        board.push(column.slice(0));
    }
    buildBoard(numberOfRows, numberOfColumns, boardEl);
    buildMarkers(numberOfColumns, markersElement);
    setBoardColumnsStyle(numberOfColumns, boardEl, markersElement);

    currentPlayer = players[0];
    winner = null;
    message = `${currentPlayer.color.toUpperCase()}'s TURN `;
    render();
    markersElement.addEventListener("click", handleMarkerClick);
    boardEl.addEventListener("click", handleMarkerClick);
}
function render() {
    renderBoard();
    renderMessages();
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
    messageElement.innerText = message;
    messageElement.style.color = currentPlayer.color;
}

init();
