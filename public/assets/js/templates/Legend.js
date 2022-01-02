const template = document.createElement ("template");
const htmlTemplate = `
<style>
    #main {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: flex-start;
        font-size: 12px;
    }

    .line-legend-container {
        display: flex;
    }

    span {
        float: right;
        width: 50px;
        height: 20px;
        border: solid thin black;
    }

    .line-legend-container {
        display: flex;
        justify-content: space-between;
        flex-direction: row;
    }

    h2 {
        text-align: center;
    }
</style>

<div id="main">
</div>
`;

template.innerHTML = htmlTemplate;

class Legend extends HTMLElement {

    constructor () {
        super ();
        this.attachShadow ({mode: "open"});

        this.legend = {};
    }

    connectedCallback () {
        this.shadowRoot.appendChild(template.content.cloneNode (true));
    }

    addPart (part) {
        part = part.replaceAll (" ", "");
        part = part.replace (/^[0-9]/, "");
        if (!Object.keys (this.legend).includes (part)) {
            this.legend[part] = {};
            let newPart = document.createElement ("div");
            newPart.id = part;
            newPart.classList.add ("legend-container");
            newPart.innerHTML = "<h2>" + part + "</h2>";
            this.shadowRoot.querySelector("#main").appendChild (newPart);
        }
    }

    addValueToPart (part, value, description) {
        value = "" + value;
        part = "" + part;
        part = part.replaceAll (" ", "");
        part = part.replace (/^[0-9]/, "");
        if (!Object.keys (this.legend[part]).includes (value)) {
            this.legend[part][value] = description;

            let newValue = document.createElement ("div");
            newValue.classList.add ("line-legend-container");

            let leftValue =  document.createElement ("div");
            leftValue.innerHTML = value;
            let rightValue =  document.createElement ("div");
            rightValue.innerHTML = description;

            newValue.appendChild (leftValue);
            newValue.appendChild (rightValue);

            this.shadowRoot.querySelector ("#" + part).appendChild (newValue);
        }
    }

    getPart (part) {
        return this.legend[part];
    }

    clear () {
        this.legend = {};
        this.shadowRoot.querySelectorAll (".legend-container").forEach (elem => {
            elem.remove ();
        })
        //this.shadowRoot.innerHTML = template.content.cloneNode (true);
    }
}

customElements.define("self-legend", Legend);