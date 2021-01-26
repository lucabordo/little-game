import { sayHello } from "./greet";


const backgroundColor = 'white';
const neutralColor = 'grey';
//const player1Color = neutralColor;
//const player2Color = 'red';

//#region Utilities

function debugInfo(message: string) {
    const elt = document.getElementById("text_display");
    elt.innerText = message;
}


function setAttributes(element: SVGElement, values: {[key:string]: any}){
    for (var key in values){
        let v = values[key].toString();
        element.setAttributeNS(null, key, v);
    }
}


/**
 * Create an SVG Element under the specified node.
 */
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

//#endregion


/**
 * Cell of the board.
 */
class Cell {

    //#region State and construction

    // Graphical element that displays a neutral border around the cell:
    border: SVGPathElement;
    // Graphical element that displays the left corner (whether top or bottom):
    leftCorner: SVGPathElement;
    // Graphical element that displays the right corner (whether top or bottom):
    rightCorner: SVGPathElement;

    private _leftColor: string;
    private _rightColor: string;
    private _connected: boolean;

    /**
     * @param svgRoot Root element under which the cells are inserted.
     * @param dimension Height and width of the cell.
     * @param direction Whether the component represents a connection up or down.
     * @param connected Whether the component is initially set to connect its two corners.
     */
    constructor(public x: number, public y: number,
                public svgRoot: SVGSVGElement, public dimension: number,
                public direction: 'down'|'up'){

        // Initialize private fields:
        this._leftColor = neutralColor;
        this._rightColor = neutralColor;
        this._connected = false;

        console.log(`INIT ${this._leftColor} ${this._rightColor}`);

        // Border, whose fill color can also be switched:
        const dimborder = dimension - 4;
        this.border = createElement(svgRoot, 'path', {
            'd': this._createSquarePath(),
            'stroke': 'grey',
            'stroke-width': 2
        });

        // Corners, which can be moved top or left:
        this.leftCorner = createElement(svgRoot, 'path', {});
        this.rightCorner = createElement(svgRoot, 'path', {});

        // Position the connection:
        this._updateConnection();

        // Wire a click listener to the whole cell surface:
        let closure =  (e: MouseEvent) =>  this.onClick();
        this.border.addEventListener('click',closure);
        this.leftCorner.addEventListener('click',closure);
        this.rightCorner.addEventListener('click',closure);
    }

    _checkClassInvariant(){
        if (this.connected && this._leftColor != this._rightColor) {
            throw 'Connection between circles of different groups!';
        }
    }

    //#endregion

    ////#region Interaction with the Cell

    /**
     * Get the color of the left corner (in the graph sense, not display) of this cell. 
     */
    get leftColor(): string{
        return this._leftColor;
    }

    /**
     * Get the color of the right corner (in the graph sense, not display) of this cell. 
     */
    get rightColor(): string{
        return this._rightColor;
    }

    /**
     * Get whether the two corners (in the graph sense, not display) are connected.
     */
    get connected(): boolean{
        return this._connected;
    }
    
    /**
     * Set whether the two corners (in the graph sense, not display) are connected.
     */
    set connected(v : boolean) {
        if (this._connected != v){
            this._connected = v;
            this._updateConnection();
        }
    }

    /**
     * Set the colors of the corners (in the graph sense, not display) of this cell. 
     */
    setColors(leftColor: string, rightColor: string){
        if (this._leftColor != leftColor || this._rightColor != this._rightColor){
            this._leftColor = leftColor;
            this._rightColor = rightColor;
            this._updateConnection();
        }
    }

    // TODO: This should notify the board?
    onClick(){
        this.connected = !this.connected;
    }

    /**
     * Connect or disconnect the corners of this Cell.
     * @param connected Are the two corners of this cell connected.
     */
    _updateConnection(){
        this._checkClassInvariant();

        if (this.direction == 'down'){
            if (this.connected){
                this._makeBottomLeft(this._leftColor, backgroundColor, backgroundColor);
            }
            else{
                this._makeTopLeft(backgroundColor, this._leftColor, this._rightColor);
            }
        }
        else {
            if (this.connected){
                this._makeTopLeft(this._leftColor, backgroundColor, backgroundColor);
            }
            else{
                this._makeBottomLeft(backgroundColor, this._leftColor, this._rightColor);
            }
        }
    }

    //#endregion

    //#region Appearance

    /**
     * Make the Cell appear with top-left and bottom-right corners.
     * NOTE display colors may display from the this._leftColor / this._rightColor
     * as the quatter-circles used for display may be flipped when connected.
     */
    _makeTopLeft(backGroundColor: string, leftColor: string, rightColor: string) {
        const start = 5;
        const half = this.dimension / 2;
        const end = this.dimension - start;
    
        // Update the background color:
        setAttributes(this.border, {'fill': backGroundColor});

        // Make the left corner appear at the top:
        setAttributes(this.leftCorner, {
            'fill': leftColor,
            'd': this._createCornerPath(start, start, half, start, start, half)
        });
        
        // Make the right corner appear at the bottom:
        setAttributes(this.rightCorner, {
            'fill': rightColor,
            'd': this._createCornerPath(end, end, half, end, end, half)
        });
    }

    /**
     * Make the Cell appear with bottom-left and top-right corners.
     * NOTE display colors may display from the this._leftColor / this._rightColor
     * as the quatter-circles used for display may be flipped when connected.
     */
    _makeBottomLeft(backGroundColor: string, leftColor: string, rightColor: string) {
        const start = 5;
        const half = this.dimension / 2;
        const end = this.dimension - start;
    
        // Update the background color:
        setAttributes(this.border, {'fill': backGroundColor});

        // Make the left corner appear at the bottom:
        setAttributes(this.leftCorner, {
            'fill': leftColor,
            'd': this._createCornerPath(start, end, start, half, half, end)
        });
        
        // Make the right corner appear at the top:
        setAttributes(this.rightCorner, {
            'fill': rightColor,
            'd': this._createCornerPath(end, start, end, half, half, start)
        });
    }

    _createBorderPath(): string{
        const dim = this.dimension - 4;
        const minx = this.x + 4, maxx = this.x + dim, miny = this.y + 4, maxy = this.y + dim;
        var result = `M ${minx} ${miny} L ${minx} ${maxy} L ${maxx} ${maxy} ` + `
                      L ${maxx} ${miny} L ${minx} ${miny}`;
        return result;
    }

    /**
     * Path that encodes the full square surface of this cell. 
     */
    _createSquarePath(): string{
        const dim = this.dimension - 4;
        const minx = this.x + 4, maxx = this.x + dim, miny = this.y + 4, maxy = this.y + dim;
        var result = `M ${minx} ${miny} L ${minx} ${maxy} L ${maxx} ${maxy} ` + `
                      L ${maxx} ${miny} L ${minx} ${miny}`;
        return result;
    }

    /**
     * Path that encodes a quarter-circle at one corner.
     * The quarter circles we use all have the same pattern: 
     * - start from the corner; 
     * - line to next point clockwise; 
     * - complete circle to the last point.
     */
    _createCornerPath(cornerx: number, cornery: number, nextx: number, nexty: number, 
                      endx: number, endy: number): string{
        const x = this.x, y = this.y;
        const radius = this.dimension / 2;
        return `M${cornerx + x} ${cornery + y} L${nextx + x} ${nexty + y} ` + 
              ` A${radius} ${radius} 1 0 1 ${endx + x} ${endy + y}`;
    }

    //#endregion
}


/**
 * Main Grid of elements capturing the state of the game.
 */
export class Board {

    // 
    cells: Cell[][];

    /**
     * @param svgRoot Root element that this view is bound to.
     * @param cellCount Number of squares in each row and column of the board.
     * @param cellDimension Height/width of each square of the board.
     */
    constructor(public svgRoot: SVGSVGElement,
                public cellCount: number, public cellDimension: number) {

        // Create the array with alternative and properly connected cells:
        this.cells = new Array<Cell[]>(cellCount);
        for (var i = 0; i < cellCount; ++i){
            this.cells[i] = new Array<Cell>(cellCount);
            for (var j = 0; j < cellCount; ++j){
                const direction = ((i + j) % 2 == 0) ? 'down' : 'up';
                this.cells[i][j] = new Cell(
                    cellDimension * i, cellDimension * j, 
                    svgRoot, cellDimension, direction
                );
            }
        }

//        this.cells[4][5].connected = true;
  //      this.cells[4][5].setColors('black', 'black');
    //    this.cells[1][1].setColors('pink', 'blue')
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
