import { Cell, createElement } from "./cell";


/**
 * Create an old-fashioned jagged array, using old-fashioned code;
 * Internal arrays are columns so elements are read like `array[x][y]`.
 * 
 * @param cols Number of columns. 
 * @param rows Number of rows.
 * @param init Function used to specify the content.
 */
export function array2d<T>(cols: number, rows: number, init: (x: number, y: number) => T): T[][]{
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
    constructor(public svgRoot: SVGSVGElement,
                public cellCount: number, public cellDimension: number) {

        // Create the array with alternative and properly connected cells:
        this.cells = array2d(cellCount, cellCount, function(x, y) {
            const direction = ((x + y) % 2 == 0) ? 'down' : 'up';
            return new Cell(
                cellDimension * x, cellDimension * y, 
                svgRoot, cellDimension, direction
            );
        });

        // Wire event handling:
        this.cells.forEach(
            line => line.forEach(
                cell => cell.subscribeToClick(this.onCellClick)
            )
        );
    }

    /**
     * Event handler for clicks on a cell.
     */
    onCellClick(cell: Cell){
        console.log(';yeah');
        cell.connected = !cell.connected;
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
};
