const template = document.createElement("template");
template.innerHTML = `
<style>
</style>

<div id="main">
</div>
`
class ControllerFqcars extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.columns = [
            {marque : true},
            {nom : true},
            {puissance: false},
            {longueur: false},
            {nbPlaces : false},
            {nbPortes: false},
            {couleur : true},
            {occasion : true},
            {prix : false}
        ]
    }

    disableAllColumns () {
        this.columns.forEach (d => {
            d[Object.keys (d)[0]] = false;
        })
    }

    enableColumn (column) {
        this.columns.forEach (d => {
            if (Object.keys (d)[0] == column) {
                d[Object.keys (d)[0]] = true;
            }
        })
    }

    setOrderColumns (listColumns) {
        this.disableAllColumns ();
        for (let i=0; i<listColumns.length; i++) {
            this.setColumnToPosition (listColumns[i], i)
        }
    }

    setColumnToPosition (column, position) {
        for (let i=0; i<this.columns.length; i++) {
            
        }
    }

    getColumn (column) {
        let c = undefined;
        this.columns.forEach (d => {
            if (Object.keys (d)[0] == column) {
                c = d;
            }
        })
        return c;
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}
customElements.define("controller-fqcars", ControllerFqcars);