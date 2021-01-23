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
function createElement(root: Node, name: string, attributes: {[key:string]: any}): SVGElement {
    let result = document.createElementNS("http://www.w3.org/2000/svg", name);
    root.appendChild(result);
    setAttributes(result, attributes);
    return result;
}


/**
 * The main Grid of elements capturing the state of the game.
 */
export class Board {

    // The root element that this view is bound to:
    root: HTMLElement;

    constructor(root: HTMLElement) {
        this.root = root;

        var cell = createElement(this.root, 'svg', {'width': 230, 'height': 230});
        var border = createElement(cell, 'path', {
            'd': "M 4 4 L 4 226 L 226 226 L 226 4 L 4 4",
            'fill': 'white',
            'stroke': 'grey',
            'stroke-width': 2
        });
        var topLeft = createElement(cell, 'path', {
            'fill': "green",
            'd': "M5,5 L115,5 A110, 110 1, 0,1 5,115 z"
        });
    }

    // Create an SVG Element under the SVG root element:
    createElement(name: string): SVGElement{
        let element = document.createElementNS("http://www.w3.org/2000/svg", name);
        this.root.appendChild(element);
        return element;
    }
}


window.onload = () => {
    var svg = document.getElementById("main-div") as any;

//    if (svg == null || !(svg instanceof SVGSVGElement)){
  ////      alert("Can't get SVG root");
    //}

    var board = new Board(svg);
};
