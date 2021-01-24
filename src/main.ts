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


/**
 * 
 */
class Point{
    constructor(public x: number, public y: number){}
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

    // Graphical element that displays a neutral border around the cell:
    border: SVGPathElement;
    // Graphical element that displays the left corner (whether top or bottom):
    leftCorner: SVGPathElement;
    // Graphical element that displays the right corner (whether top or bottom):
    rightCorner: SVGPathElement;

    /**
     * @param svgRoot Root element under which the cells are inserted.
     * @param dimension Height and width of the cell.
     * @param direction Whether the component represents a connection up or down.
     * @param connected Whether the component is initially set to connect its two corners.
     */
    constructor(public x: number, public y: number,
                public svgRoot: SVGSVGElement, public dimension: number,
                public direction: 'down'|'up', public connected: boolean){

        // Border, whose fill color can also be switched:
        const dimborder = dimension - 4;
        this.border = createElement(svgRoot, 'path', {
            'd': this._createBorderPath(),
            'stroke': 'grey',
            'stroke-width': 2
        });

        // Corners, which can be moved top or left:
        this.leftCorner = createElement(svgRoot, 'path', {});
        this.rightCorner = createElement(svgRoot, 'path', {});

        this.makeConnection();
    }

    /**
     * Connect or disconnect the corners of this Cell.
     * @param connected Are the two corners of this cell connected.
     */
    makeConnection(){
        if (this.direction == 'down'){
            if (this.connected){
                this.makeBottomLeft('green', 'white');
            }
            else{
                this.makeTopLeft('white', 'green');
            }
        }
        else {
            if (this.connected){
                this.makeTopLeft('green', 'white');
            }
            else{
                this.makeBottomLeft('white', 'green');
            }
        }
    }

    flip(){
        this.connected = !this.connected;
        this.makeConnection();
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

    _createBorderPath(): string{
        const dim = this.dimension - 4;
        const minx = this.x + 4, maxx = this.x + dim, miny = this.y + 4, maxy = this.y + dim;
        var result = `M ${minx} ${miny} L ${minx} ${maxy} L ${maxx} ${maxy} ` + `
                      L ${maxx} ${miny} L ${minx} ${miny}`;
        report(result);
        return result;
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
        const x = this.x, y = this.y;
        const radius = this.dimension / 2;
        return `M${cornerx + x} ${cornery + y} L${nextx + x} ${nexty + y} ` + 
              ` A${radius} ${radius} 1 0 1 ${endx + x} ${endy + y}`;
    }
}


/**
 * The main Grid of elements capturing the state of the game.
 */
export class Board {

    cells: Cell[][];

    /**
     * 
     * @param svgRoot Root element that this view is bound to.
     * @param cellCount Number of squares in each row and column of the board.
     * @param cellDimension Height/width of each square of the board.
     */
    constructor(public svgRoot: SVGSVGElement, public cellCount: number, public cellDimension: number) {
        this.cells = new Array<Cell[]>(cellCount);
        for (var i = 0; i < cellCount; ++i){
            this.cells[i] = new Array<Cell>(cellCount);
            for (var j = 0; j < cellCount; ++j){
                const direction = ((i + j) % 2 == 0) ? 'down' : 'up';
                var cell = new Cell(
                    cellDimension * i, cellDimension * j, 
                    svgRoot, cellDimension, direction, false
                );
                this.cells[i][j] = cell;
            }
        }

        this.cells[1][0].flip()
        this.cells[5][5].flip()
        this.cells[4][5].flip()
        this.cells[2][3].flip()
        this.cells[7][3].flip()
        this.cells[8][6].flip()
    }
}


window.onload = () => {
    var mainDiv = document.getElementById("main-div");
//    mainDiv.style.border = "thick solid #0000FF"; 

    const cellCount = 10;
    const cellDimension = Math.round(mainDiv.clientWidth / cellCount);
    const boardDimension = cellCount * cellDimension;

    var svgRoot = createElement(mainDiv, 'svg', {
        'width': boardDimension, 
        'height': boardDimension,
    });
    report(cellDimension.toString());
    var board = new Board(svgRoot, cellCount, cellDimension);
};
