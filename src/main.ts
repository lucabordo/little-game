import { sayHello } from "./greet";


function report(message: string) {
    const elt = document.getElementById("text_display");
    elt.innerText = message;
}


function setAttributes(element: SVGElement, values: {[key:string]: any}){
    for (var key in values){
        let v = values[key].toString();
        console.log(key, v);
        element.setAttributeNS(null, key, v);
    }
}


// Create an SVG Element under the specified node:
function createElement<K extends keyof SVGElementTagNameMap>(
        root: Node, 
        name: K,
        attributes: {[key:string]: any}
): SVGElementTagNameMap[K]{

    let result = document.createElementNS("http://www.w3.org/2000/svg", name);
    root.appendChild(result);
    setAttributes(result, attributes);
    return result;
}


interface Corner{

}


/**
 * 
 */
interface Edge{

}


/**
 * Cell of the board of the first type:
 * Connection can be made between the top-left and bottom--right corners.
 * 
 */
class Cell {

    // Graphical element that contains the whole cell:
    cell: SVGSVGElement;
    // Graphical element that displays a neutral border around the cell:
    border: SVGPathElement;
    // Graphical element that displays the left corner (whether top or bottom):
    leftCorner: SVGPathElement;
    // Graphical element that displays the right corner (whether top or bottom):
    rightCorner: SVGPathElement;

    /**
     * @param root Root element under which the cell is inserted.
     * @param dimension Height and width of the cell.
     * @param direction Whether the component represents a connection up or down.
     * @param connected Whether the component is initially set to connect its two corners.
     */
    constructor(public root: HTMLElement, public dimension: number,
                public direction: 'down'|'up', connected: boolean){

        // SVG container:
        this.cell = createElement(this.root, 'svg', {'width': dimension, 'height': dimension});

        // Border, whose fill can also 
        const dimborder = dimension - 4;
        this.border = createElement(this.cell, 'path', {
            'd': `M 4 4 L 4 ${dimborder} L ${dimborder} ${dimborder} L ${dimborder} 4 L 4 4`,
            'stroke': 'grey',
            'stroke-width': 2
        });

        // 
        this.leftCorner = createElement(this.cell, 'path', {});
        this.rightCorner = createElement(this.cell, 'path', {});

        this.makeConnection(connected);
    }

    /**
     * Connect or disconnect the corners of this Cell.
     * @param connected Are the two corners of this cell connected.
     */
    makeConnection(connected: boolean){
        if (this.direction == 'down'){
            if (connected){
                this.makeBottomLeft('green', 'white');
            }
            else{
                this.makeTopLeft('white', 'green');
            }
        }
        else {
            if (connected){
                this.makeTopLeft('green', 'white');
            }
            else{
                this.makeBottomLeft('white', 'green');
            }
        }
    }

    /**
     * Make the Cell appear with top-left and bottom-right corners.
     * @param backGroundColor Color of the background.
     * @param cornersColor Color of the corners.
     */
    makeTopLeft(backGroundColor: string, cornersColor: string) {
        const start = 5;
        const half = this.dimension / 2;
        const end = this.dimension - start;
    
        // Update the background color:
        setAttributes(this.border, {'fill': backGroundColor});

        // Make the left corner appear at the top:
        setAttributes(this.leftCorner, {
            'fill': cornersColor,
            'd': this._createCornerPath(start, start, half, start, start, half)
        });
        
        // Make the right corner appear at the bottom:
        setAttributes(this.rightCorner, {
            'fill': cornersColor,
            'd': this._createCornerPath(end, end, half, end, end, half)
        });
    }

    /**
     * Make the Cell appear with bottom-left and top-right corners.
     * @param backGroundColor Color of the background.
     * @param cornersColor Color of the corners.
     */
    makeBottomLeft(backGroundColor: string, cornersColor: string) {
        const start = 5;
        const half = this.dimension / 2;
        const end = this.dimension - start;
    
        // Update the background color:
        setAttributes(this.border, {'fill': backGroundColor});

        // Make the left corner appear at the bottom:
        setAttributes(this.leftCorner, {
            'fill': cornersColor,
            'd': this._createCornerPath(start, end, start, half, half, end)
        });
        
        // Make the right corner appear at the top:
        setAttributes(this.rightCorner, {
            'fill': cornersColor,
            'd': this._createCornerPath(end, start, end, half, half, start)
        });
    }

    /**
     * Create the path that encodes a quarter-circle at one corner.
     * The quarter circles we use all have the same pattern: 
     * - start from the corner; 
     * - line to next point clockwise; 
     * - complete circle to the last point.
     */
    _createCornerPath(cornerx: number, cornery: number, nextx: number, nexty: number, 
                      endx: number, endy: number): string{
        const radius = this.dimension / 2;
        return `M${cornerx} ${cornery} L${nextx} ${nexty} A${radius} ${radius} 1 0 1 ${endx} ${endy}`;
    }
}


/**
 * The main Grid of elements capturing the state of the game.
 */
export class Board {

    //cells: Cell[][];
    cell1: Cell;
    cell2: Cell;

    // TODO:
    // - Complete the patterns
    // - Extract methods
    // - Parameterize the figures
    // - Do a grid
    // - Make switchable
    // Look at
    // https://github.com/lucabordo/little-game/blob/e3e697b410df032f24a0ecf8f8576a680cda8f0d/src/index.html

    /**
     * 
     * @param root Root element that this view is bound to.
     * @param squareCount Number of squares in each row and column of the board.
     * @param squareDimension Height/width of each square of the board.
     */
    constructor(public root: HTMLElement, public squareCount: number, public squareDimension: number) {
        //this.cells = null;
        this.cell2 = new Cell(root, squareDimension, 'down', false);
        this.cell2 = new Cell(root, squareDimension, 'down', true);
        this.cell1 = new Cell(root, squareDimension, 'up', false);
        this.cell1 = new Cell(root, squareDimension, 'up', true);
    }
}


window.onload = () => {
    const cellCount = 10;

    var mainDiv = document.getElementById("main-div") as any;
    const cellSize = Math.min(80, Math.round(mainDiv.clientWidth / cellCount));
    report(cellSize.toString());
    var board = new Board(mainDiv, 10, cellSize);
};
