//-------------------------------------------------------------//
// ELEMENTS
//-------------------------------------------------------------//
let messageElement = document.getElementById("message");
let markersElement = document.getElementById("markers");
let boardEl = document.getElementById("board");
let titleElement = document.getElementById("title");

//-------------------------------------------------------------//
// CLASSES
//-------------------------------------------------------------//
class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(pos) {
        return new Position(pos.x + this.x, pos.y + this.y);
    }
    set(pos) {
        this.x = pos.x;
        this.y = pos.y;
    }
    move(pos) {
        this.x = pos.x + this.x;
        this.y = pos.y + this.y;
    }
    copy() {
        return new Position(this.x, this.y);
    }
    within(area) {
        return (
            this.x >= 0 &&
            this.y >= 0 &&
            this.x < area.width &&
            this.y < area.height
        );
    }
}

const west = new Position(-1, 0);
const east = new Position(1, 0);
const north = new Position(0, 1);
const south = new Position(0, -1);
const northWest = new Position(-1, 1);
const northEast = new Position(1, 1);
const southWest = new Position(-1, -1);
const southEast = new Position(1, -1);

class Area {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

class Game {
    constructor(
        boardElement,
        markersElement,
        messageElement,
        titleElement,
        title,
        width,
        height,
        matchesToWin,
        colors,
        sounds
    ) {
        this.boardElement = boardElement;
        this.markersElement = markersElement;
        this.messageElement = messageElement;
        this.titleElement = titleElement;
        this.title = title;
        this.message = "TEST MSG";
        this.colors = colors;
        this.players = [
            { name: "player-one", color: this.colors[0], boardValue: 1 },
            { name: "player-two", color: this.colors[1], boardValue: 2 },
        ];
        this.sounds = sounds;

        this.width = width;
        this.height = height;
        this.area = new Area(width, height);
        this.matchesToWin = matchesToWin;
        this.board = [];
        let column = repeat(0, this.height);
        for (let i = 0; i < this.width; i++) {
            this.board.push(column.slice(0));
        }
        this.buildBoard(this.height, this.width, this.boardElement);
        this.buildMarkers(this.width, this.markersElement);
        this.setBoardColumnsStyle(
            this.width,
            this.boardElement,
            this.markersElement
        );
        this.currentPlayer = this.players[0];
        this.winner = null;
        this.message = `${this.currentPlayer.color.toUpperCase()}'s TURN `;
        this.render();
        // this is bound to window inside of event handlers thus using arrows
        this.markersElement.addEventListener("click", (evt) => {
            this.handleMarkerClick(evt);
        });
        this.boardElement.addEventListener("click", (evt) => {
            this.handleMarkerClick(evt);
        });
    }

    render() {
        this.renderBoard();
        this.renderMessages();
        this.renderTitle();
    }

    renderBoard() {
        this.board.forEach((colArr, colIdx) => {
            colArr.forEach((el, idx) => {
                document.getElementById(
                    `c${colIdx}r${idx}`
                ).style.backgroundColor = this.valueToColor(el);
            });
        });
    }

    renderMessages() {
        this.messageElement.innerText = this.message;
        this.messageElement.style.color = this.currentPlayer.color;
    }

    renderTitle() {
        titleElement.innerText = this.title;
    }

    buildMarkers(width, markerEl) {
        for (let i = 0; i < width; i++) {
            let el = document.createElement("div");
            el.id = i;
            el.column = i;
            markerEl.appendChild(el);
        }
    }

    buildBoard(width, height, boardEl) {
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

    //TODO this shouldn't hardcode the 9 here and markers should be a child of game
    setBoardColumnsStyle(width, boardEl, markerEl) {
        this.boardElement.style.gridTemplateColumns = `repeat(${width},9vmin)`;
        this.markersElement.style.gridTemplateColumns = `repeat(${width},9vmin)`;
    }

    clearBoardandMarkers() {
        this.boardElement.innerHTML = "";
        this.markersElement.innerHTML = "";
    }
    reset() {
        this.clearBoardandMarkers();
        this.play(this.sounds.resetSound);
    }

    //------------------------------------------------------------//
    // The core logic is contained herein.  Attempt to insert.
    // If insertion succeeds test board along possible axis for 3 addition matching
    // positions and either end the game or switch the active player.
    //------------------------------------------------------------//

    handleMarkerClick(evt) {
        //-------------------------------------------------------------//
        // Only if clicking on a div and insertion succeeds meaing a
        //column wasn't full nor a winner already declared insert a value
        //-------------------------------------------------------------//
        if (evt.target.tagName !== "DIV") return; //click better
        let latestInsertion = this.insert(
            evt.target.column,
            this.currentPlayer.boardValue
        );
        if (latestInsertion) {
            if (this.isWinningPosition(latestInsertion)) this.endGame();
            else this.switchPlayer();
            this.render();
        }
    }

    //-------------------------------------------------------------//
    // Inserts number representing player into first unoccupied position
    // in col, represented by current value being zero, and then returns
    // the pos of most recent insertion both to see if insertion AND
    // to test the value to see if player won
    //-------------------------------------------------------------//
    insert(col, n) {
        let top = this.board[col].indexOf(0); //first zero is the first empty slot

        //if not already full
        if (top !== -1 && this.winner == null) {
            this.board[col][top] = n;
            {
                let latestInsertion = new Position(parseInt(col), top);
                this.play(this.sounds.playSound);
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
    check(pos, direction, desired = this.board[pos.x][pos.y], matches = 0) {
        let dest = pos.add(direction);
        if (!dest.within(this.area)) return matches;
        let value = this.board[dest.x][dest.y];
        if (desired !== value) {
            return matches;
        }
        return this.check(dest, direction, desired, ++matches);
    }
    //-------------------------------------------------------------//
    // If the number of matches found along combination of vectors eg
    // east and west is 3 or more the position is a winning position and
    // currentPlayer is the winner.
    //-------------------------------------------------------------//
    isWinningPosition(pos) {
        const horizontal = this.check(pos, west) + this.check(pos, east) + 1;
        const vertical = this.check(pos, north) + this.check(pos, south) + 1;
        const diagUp =
            this.check(pos, northEast) + this.check(pos, southWest) + 1;
        const diagDown =
            this.check(pos, southEast) + this.check(pos, northWest) + 1;
        return [horizontal, vertical, diagDown, diagUp].some(
            (x) => x >= this.matchesToWin
        );
    }

    switchPlayer() {
        if (this.currentPlayer === this.players[0])
            this.currentPlayer = this.players[1];
        else this.currentPlayer = this.players[0];
        this.message = `${this.currentPlayer.color.toUpperCase()}'s TURN `;
    }

    endGame() {
        this.winner = this.currentPlayer;
        this.message = `${this.currentPlayer.color.toUpperCase()} WINS`;
        this.play(this.sounds.winSound);
    }
    valueToColor(n) {
        if (n === 0) return "white";
        else return this.players.filter((x) => x.boardValue == n)[0].color;
    }
    play(file) {
        let audio = new Audio(file);
        audio.play();
    }
}

function repeat(x, times) {
    let res = [];
    for (let i = 0; i < times; i++) res.push(x);
    return res;
}

function init() {
    game = new Game(
        boardEl,
        markersElement,
        messageElement,
        titleElement,
        "CONNECT 19",
        7,
        6,
        4,
        ["purple", "red"],
        {
            winSound: "win.mp3",
            playSound: "woosh.mp3",
            resetSound: "button.mp3",
        }
    );
}

function reset() {
    game.reset();
    init();
}

init();
document.getElementById("reset_button").addEventListener("click", reset);
