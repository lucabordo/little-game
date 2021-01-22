import { sayHello } from "./greet";

document.addEventListener('DOMContentLoaded', (_event) => {
    const elt = document.getElementById("text_display");
    var toto = document.getElementById("svg-main");
    elt.innerText = toto.nodeName;
});
