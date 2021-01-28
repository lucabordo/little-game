/**
 * Module that defines how cells are displayed and their state. 
 */

export const backgroundColor = 'white';
export const neutralColor = 'grey';
//const player1Color = neutralColor;
//const player2Color = 'red';

//#region Utilities

function setAttributes(element: SVGElement, values: {[key:string]: any}){
    for (var key in values){
        let v = values[key].toString();
        element.setAttributeNS(null, key, v);
    }
}


/**
 * Create an SVG Element under the specified node.
 */
export function createElement<K extends keyof SVGElementTagNameMap>(
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
 * Type of Event listeners that react to Clicks on various SVG parts. 
 */
interface CellClickListener {
    (cell: Cell): void;
}


/**
 * Cell of the board.
 */
export class Cell {

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
     * @param x The x cooordinate in the grid - from 0 to cellCount
     * @param y The y cooordinate in the grid - from 0 to cellCount
     * @param svgRoot Root element under which the cells are inserted.
     * @param dimension Height and width of the cell.
     * @param direction Whether the component represents a connection up or down.
     */
    constructor(public x: number, public y: number,
                readonly svgRoot: SVGSVGElement, public dimension: number,
                readonly direction: 'down'|'up'){

        // Initialize private fields:
        this._leftColor = neutralColor;
        this._rightColor = neutralColor;
        this._connected = false;

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
        this._refresh();
    }

    _checkClassInvariant(){
        if (this.connected && this._leftColor != this._rightColor) {
            throw 'Connection between circles of different groups!';
        }
    }

    //#endregion

    //#region Interaction with the Cell

    subscribeToCellClick(listener: CellClickListener){
        [this.border, this.leftCorner, this.rightCorner].forEach(element => {
            element.addEventListener('click', _e => listener(this));
        });
    }

    /**
     * Get the color of the left corner (in the graph sense, not display) of this cell. 
     */
    get leftColor(): string{
        return this._leftColor;
    }

    set leftColor(newColor: string){
        if (this._leftColor != newColor){
            this._leftColor = newColor;
            this._refresh();
        }
    }

    /**
     * Get the color of the right corner (in the graph sense, not display) of this cell. 
     */
    get rightColor(): string{
        return this._rightColor;
    }

    set rightColor(newColor: string){
        if (this._rightColor != newColor){
            this._rightColor = newColor;
            this._refresh();
        }
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
            this._refresh();
        }
    }

    /**
     * Connect or disconnect the corners of this Cell.
     * @param connected Are the two corners of this cell connected.
     */
    _refresh(){
        // TODO: revise this
        //this._checkClassInvariant();

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
     * X coordinate in the SVG element.
     */
    get svgx(): number{
        return this.x * this.dimension;
    }

    /**
     * Y coordinate in the SVG element.
     */
    get svgy(): number{
        return this.y * this.dimension;
    }

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
        const minx = this.svgx + 4, maxx = this.svgx + dim, miny = this.svgy + 4, maxy = this.svgy + dim;
        var result = `M ${minx} ${miny} L ${minx} ${maxy} L ${maxx} ${maxy} ` + `
                      L ${maxx} ${miny} L ${minx} ${miny}`;
        return result;
    }

    /**
     * Path that encodes the full square surface of this cell. 
     */
    _createSquarePath(): string{
        const dim = this.dimension - 4;
        const minx = this.svgx + 4, maxx = this.svgx + dim, miny = this.svgy + 4, maxy = this.svgy + dim;
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
        const x = this.svgx, y = this.svgy;
        const radius = this.dimension / 2;
        return `M${cornerx + x} ${cornery + y} L${nextx + x} ${nexty + y} ` + 
              ` A${radius} ${radius} 1 0 1 ${endx + x} ${endy + y}`;
    }

    //#endregion
}
