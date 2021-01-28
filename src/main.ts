import { Cell, createElement } from "./cell";

const defaultMessage = "This place may be used for some debug display.";


/**
 * Create an old-fashioned jagged array, using old-fashioned code;
 * Internal arrays are columns so elements are read like `array[x][y]`.
 * 
 * @param cols Number of columns. 
 * @param rows Number of rows.
 * @param init Function used to specify the content.
 */
function array2d<T>(cols: number, rows: number, init: (x: number, y: number) => T): T[][]{
    var result = new Array<T[]>(cols);

    for (var x = 0; x < cols; ++x){
        result[x] = new Array<T>(rows);
        for (var y = 0; y < rows; ++y){
            result[x][y] = init(x, y);
        }
    }

    return result;
}


/**
 * Report a message, visible to the user.
 */
function report(message: string){
    var elt = document.getElementById('text_display');
    elt.innerText = message;
}


function opposite(color: 'red'|'green'){
    return (color == 'red') ? 'green' : 'red';
}


/**
 * Main Grid of elements capturing the state of the game.
 */
export class Board {

    // Grid of cells, that act both as visual elements
    // and possible edges (connected or not) for the underlying graph between circles.
    cells: Cell[][];

    /**
     * @param svgRoot Root element that this view is bound to.
     * @param cellCount Number of squares in each row and column of the board.
     * @param cellDimension Height/width of each square of the board.
     */
    constructor(readonly svgRoot: SVGSVGElement,
                public cellCount: number, public cellDimension: number) {

        // Create the array with alternative and properly connected cells:
        this.cells = array2d(cellCount, cellCount, function(x, y) {
            const direction = ((x + y) % 2 == 0) ? 'down' : 'up';
            return new Cell(x, y, svgRoot, cellDimension, direction);
        });
    }
}


class Game{
    // Current player:
    turn: 'red'|'green';

    constructor(readonly board: Board){
        this.turn = 'red';
        
        // Wire event handling:
        let that = this; // TODO find a better fix for that ugliness
        board.cells.forEach(
            line => line.forEach(
                cell => cell.subscribeToCellClick(cell => that.onCellClick(cell))
            )
        );
    }

    /**
     * Event handler for clicks on a cell.
     */
    onCellClick(cell: Cell){
        // TODO: The color propagated is NOT this.turn in general

        report(defaultMessage);
        const opponent = opposite(this.turn);

        if (opponent == cell.leftColor || opponent == cell.rightColor){
            report(`Player ${this.turn} isn't allowed to play this cell.`);
            return;
        }

        cell.connected = !cell.connected;
        cell.leftColor = this.turn;
        cell.rightColor = this.turn;
        this._changeNeighbors(cell, this.turn, 'left');
        this._changeNeighbors(cell, this.turn, 'right');
        this.turn = opponent;
    }

    _changeCornerColor(x: number, y: number, color: 'red'|'green', corner: 'left'|'right'){
        console.log(`Corner ${x} ${y} ${corner}`);
        if (0 <= x && x < this.board.cellCount && 0 <= y && y < this.board.cellCount){
            var cell = this.board.cells[x][y];

            if (corner === 'left'){
                if (cell.leftColor !== color){
                    cell.leftColor = color;
                    this._changeNeighbors(cell, color, corner);
                    if (cell.connected){
                        this._changeCornerColor(x, y, color, 'right');
                    }
                }
            }
            else {
                if (cell.rightColor !== color){
                    cell.rightColor = color;
                    this._changeNeighbors(cell, color, corner);
                    if (cell.connected){
                        this._changeCornerColor(x, y, color, 'left');
                    }
                }
            }
        }
    }

    _changeNeighbors(cell: Cell, color: 'red'|'green', corner: 'left'|'right'){
        console.log(`neigh ${cell.x} ${cell.y} ${corner}`);
        if (cell.direction === 'down'){
            if (corner === 'left'){
                this._changeCornerColor(cell.x - 1, cell.y - 1, color, 'right');
                this._changeCornerColor(cell.x - 1, cell.y - 0, color, 'right');
                this._changeCornerColor(cell.x - 0, cell.y - 1, color, 'left');
            }
            else{
                this._changeCornerColor(cell.x + 1, cell.y + 1, color, 'left');
                this._changeCornerColor(cell.x + 1, cell.y + 0, color, 'left');
                this._changeCornerColor(cell.x + 0, cell.y + 1, color, 'right');
            }
        }
        else{
            if (corner === 'left'){
                this._changeCornerColor(cell.x - 1, cell.y + 1, color, 'right');
                this._changeCornerColor(cell.x - 1, cell.y + 0, color, 'right');
                this._changeCornerColor(cell.x + 0, cell.y + 1, color, 'left');
            }
            else{
                this._changeCornerColor(cell.x + 1, cell.y - 1, color, 'left');
                this._changeCornerColor(cell.x + 1, cell.y + 0, color, 'left');
                this._changeCornerColor(cell.x + 0, cell.y - 1, color, 'right');
            }
        }
    }
}


window.onload = () => {
    var mainDiv = document.getElementById("main-div");
//    mainDiv.style.border = "thick solid #0000FF"; 

    const cellCount = 20;
    const cellDimension = Math.round((mainDiv.clientWidth - 15) / cellCount);
    const boardDimension = cellCount * cellDimension;

    var svgRoot = createElement(mainDiv, 'svg', {
        'width': boardDimension, 
        'height': boardDimension,
    });
    // report(cellDimension.toString());
    var board = new Board(svgRoot, cellCount, cellDimension);
    var game = new Game(board);
    report(defaultMessage);
};
