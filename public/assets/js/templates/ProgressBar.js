const template = document.createElement ("template");
template.innerHTML = `
<style>
    #font-progress, #progressing {
        position: relative;
        width: 200px;
        height: 10px;
    }

    #font-progress {
        background-color: grey;
    }

    #progressing {
        background-color: darkblue;
    }
</style>

<div id="font-progress"></div>
<div id="progressing"></div>
`


class ProgressBar extends HTMLElement {

    constructor () {
        super ();

        this.attachShadow ({mode: "open"});

        this.max = 1;
        this.current = 0;
        this.width = 200;
    }

    connectedCallback () {
        this.shadowRoot.appendChild(template.content.cloneNode (true));
    }

    setWidth (width) {
        this.width = width;
        this.shadowRoot.querySelector ("#font-progress").style.width = this.width + "px";
        this.shadowRoot.querySelector ("#progressing").style.width = this.current != 0 ? (this.width * (this.current / this.max)) + "px" : "0px";
    }

    setMaxCount (max) {
        this.max = max;
    }

    setProgress (v) {
        this.current = v;
        if (this.current > this.max) this.current = this.max;
        this.shadowRoot.querySelector ("#progressing").style.width = this.current != 0 ? (this.width * (this.current / this.max)) + "px" : "0px";
    }

    incrementProgress (i) {
        this.current += i;
        if (this.current > this.max) this.current = this.max;
        this.shadowRoot.querySelector ("#progressing").style.width = this.current != 0 ? (this.width * (this.current / this.max)) + "px" : "0px";
    }

    setPosition (x, y) {
        this.shadowRoot.querySelectorAll ("#font-progress").forEach (div => {
            div.style.top = y + "px";
            div.style.left = x + "px";
        })
        this.shadowRoot.querySelectorAll ("#progressing").forEach (div => {
            div.style.top = (y - 10) + "px";
            div.style.left = x + "px";
        })
    }
}

customElements.define("progress-bar", ProgressBar);
