import "../js/templates/ProgressBar.js";
import "../js/templates/Legend.js";
import "../js/templates/ControllerFqcars.js";

const widthMin = window.innerHeight, heightMin = window.innerHeight, radius = Math.pow(window.innerHeight * 0.45, 2);
const partition = d3.partition ().size ([2 * Math.PI, radius]);
const url = "http://127.0.0.1:7500";
const colorFrToEng = {
    "blanc": "ivory",
    "noir": "black",
    "noire": "black",
    "bleu": "blue",
    "vert": "green",
    "rouge": "red",
    "gris": "gray"
}

window.onload = () => {
    const svg = d3.select  ("#chart")
                    .append("svg")
                        .attr ("width", widthMin)
                        .attr ("height", heightMin)
                        .attr ("id", "svg")
                        .append("g")
                            .attr("transform", "translate(" + widthMin / 2 + "," + heightMin / 2 + ")");

    var workerJSON = new Worker('../assets/js/workerLoadData.js');
    let progressBar = document.querySelector ("#progress-bar");
    progressBar.setPosition (window.innerWidth * 0.1, 10);
    progressBar.setWidth (window.innerWidth * 0.8);

    function getAllData () {
        let xhttpSrcRequest = new XMLHttpRequest ();
    
        xhttpSrcRequest.open ("GET", `${url}/api/count/immatriculation`, true);
        xhttpSrcRequest.send ();
        xhttpSrcRequest.onloadend = (data) => {
            let count = JSON.parse(data.target.response)["count"];
            // let count = 1000;
            progressBar.setMaxCount (count);
            let accSkip = 0;
            let limit = 10000;
            workerJSON.postMessage ({table: "immatriculation", limit: limit, skip: limit * accSkip});
            workerJSON.onmessage = e => {
                frqCars.addData(e.data);
                //allData = allData.concat (e.data);
                accSkip++;
                progressBar.setProgress (accSkip * limit);
                if (accSkip * limit < count) {
                    workerJSON.postMessage ({table: "immatriculation", limit: limit, skip: limit * accSkip});
                }
                else {
                    workerJSON.terminate ();
                }
            }
       }
    }

    let frqCars = new FrequenceCars (svg, []);
    getAllData ();
}

class FrequenceCars {

    constructor (svg, data) {
        this.svg = svg;
        this.patronHierarchie = ["marque", "nom", "couleur", "occasion"];
        this.legende = {};
        this.hierarchie = {};
        this.legend = document.querySelector ("#legend");
        this.castDataToHierarchy (data);
        this.drawGraphic (this.svg, this.hierarchie);
        
        let groupeTxt = this.svg.append ("g");
        groupeTxt.append ("text")
            .attr ("id", "text-sunburst-marque")
            .attr ("y", -100)
            .attr ("fill", "ivory")
            .attr("text-anchor", "middle")
        groupeTxt.append ("text")
            .attr ("id", "text-sunburst-modele")
            .attr ("y", -80)
            .attr ("fill", "ivory")
            .attr("text-anchor", "middle")
        groupeTxt.append ("text")
            .attr ("id", "text-sunburst-color")
            .attr ("y", -60)
            .attr ("fill", "ivory")
            .attr("text-anchor", "middle")
        groupeTxt.append ("text")
            .attr ("id", "text-sunburst-occasion")
            .attr ("y", -40)
            .attr ("fill", "ivory")
            .attr("text-anchor", "middle")
        groupeTxt.append ("text")
            .attr ("id", "text-sunburst-qte")
            .attr ("y", -20)
            .attr ("fill", "ivory")
            .attr("text-anchor", "middle")
    }

    drawGraphic (svg, hierarchie) {
        svg.selectAll("path").remove ()
        let arc = d3.arc()
            .startAngle(d => { return d.x0; })
            .endAngle(d => { return d.x1; })
            .innerRadius(d => { return Math.sqrt(d.y0); })
            .outerRadius(d => { return Math.sqrt(d.y1); });

        let data = d3.hierarchy(hierarchie)
            .sum(d => { return d.amount; });
            
        svg.selectAll("path")
            .data (partition (data).descendants ())
            .enter ()
                .append ("path")
                    .attr ("display",  d => { return d.depth ? null : "none"; })
                    .attr ("d", arc)
                    .style ("fill", d => { return d.data.color })
                    .on ("mouseenter", (e, d) => this.mouseenter (e, d))
                    .on ("mouseleave", () => {
                        d3.selectAll("path")
                            .style("opacity", 1)
                    })
    }

    getRuleColor (column, value) {
        let c = null;
        if (this.legende[column] === undefined) {
            this.legende[column] = {};
        }
                    
        this.legend.addPart (column);
        switch (column) {
            case "couleur":
                c = (colorFrToEng[value] != undefined) ? colorFrToEng[value] : "black";
                this.legend.addValueToPart (column, value, "<span style=\"background-color: " + c + ";\"></span>");
                break
            case "occasion":
                c = value ? "red" : "darkblue";
                this.legend.addValueToPart (column, value, "<span style=\"background-color: " + c + ";\"></span>");
                break;
            case "marque":
                c = (this.legende[column][value] === undefined) ?
                        "hsl(" + Object.keys(this.legende[column]).length * 18 + ", 100%, 50%)" :
                        this.legende[column][value];
                this.legend.addValueToPart (column, value, "<span style=\"background-color: " + c + ";\"></span>");
                break
            case "nom":
                c = (this.legende[column][value] === undefined) ?
                        "hsl(" + Object.keys(this.legende[column]).length * 12 + ", 100%, 50%)" :
                        this.legende[column][value];
                this.legend.addValueToPart (column, value, "<span style=\"background-color: " + c + ";\"></span>");
                break;
            default:
                c = "hsl(" + c + ", 100%, 50%)";
                this.legend.addValueToPart (column, value, "<span style=\"background-color: " + c + ";\"></span>");
            }
        if (this.legende[column][value] === undefined) {
            this.legende[column][value] = c; 
        }
        return c;
    }

    mouseenter (e, d) {
        function sum (d) {
            if (d.amount !== undefined) { return d.amount; }
            let somme = 0;
            d.children.forEach (child => {
                somme += sum (child)
            })
            return somme;
        }
        let sequenceArray = d.ancestors ().reverse ();
        sequenceArray.shift ();

        sequenceArray.forEach (d => {
            switch (d.depth) {
                case 1:
                    d3.select ("#text-sunburst-marque").text ("Marque : " + d.data.name)
                    d3.select ("#text-sunburst-modele").text ("")
                    d3.select ("#text-sunburst-color").text ("")
                    d3.select ("#text-sunburst-occasion").text ("")
                    d3.select ("#text-sunburst-qte").text("Total : " + sum(d.data))
                    break;
                case 2:
                    d3.select ("#text-sunburst-modele").text ("Modèle : " + d.data.name)
                    d3.select ("#text-sunburst-color").text ("")
                    d3.select ("#text-sunburst-occasion").text ("")
                    d3.select ("#text-sunburst-qte").text ("Total : " + sum(d.data))
                    break;
                case 3:
                    d3.select ("#text-sunburst-occasion").text ("")
                    d3.select ("#text-sunburst-color").text ("Couleur : " + d.data.name)
                    d3.select ("#text-sunburst-qte").text ("Total : " + sum(d.data))
                    break;
                case 4:
                    d3.select ("#text-sunburst-occasion").text ("Occasion : " + d.data.name)
                    d3.select ("#text-sunburst-qte").text ("Total : " + sum(d.data))
            }
        })

        d3.selectAll("path")            // On grise tous les segments
            .style("opacity", 0.2);

        this.svg.selectAll("path")      // Ensuite on met en valeur uniquement ceux qui sont ancêtres de la sélection
            .filter(node => {
                return (sequenceArray.indexOf(node) >= 0);
            })
        .style("opacity", 1);
    }

    castDataToHierarchy (data) {
        function listContains (list, value) {
            if (list === undefined || value === undefined) { return true; }
            let find = false;
            list.forEach (v => {
                if (v.name == value) {
                    find = true;
                }
            })
            return find;
        }
        function getValue (list, value) {
            let find = null;
            list.forEach (v => {
                if (v.name == value) {
                    find = v;
                }
            })
            return find;
        }
        let implementLine = (line, box, depth) => {
            if (box === null) { return; }
            if (!listContains (box["children"], line[this.patronHierarchie[depth]])) {      // si l'enfant n'existe pas
                let newChild = {                                                                // on le crée
                    name: line[this.patronHierarchie[depth]],
                    color: this.getRuleColor (this.patronHierarchie[depth], line[this.patronHierarchie[depth]])
                };
                if (depth < this.patronHierarchie.length -1) {                                  // si on n'a pas atteind la profondeur max
                    newChild["children"] = [];                                                      // le noeud aura des enfants
                    implementLine (line, newChild, depth+1)                                         // et on descend dans les couches
            } else {                                                                            // sinon on est profondeur max
                    newChild["amount"] = 1;                                                         // et dans ce cas on compte 1
                }
                box["children"].push (newChild)                                                 // rajoutons cet enfant à la box parente
            } 
            else {                                                                          // sinon c'est qu'il existe
                if (depth < this.patronHierarchie.length) {                                     // si l'on n'est pas profondeur max, on plonge
                    implementLine (line, getValue(box["children"], line[this.patronHierarchie[depth]]), depth+1)
                } else {                                                                        // sinon
                    box["amount"] += 1;                                                             // on incrémente le compteur de 1
                }
            }
        }
        
        if (this.hierarchie["children"] === undefined) {
            this.hierarchie["name"] = this.patronHierarchie[0];
            this.hierarchie["children"] = [];
        }

        data.forEach (line => {
            implementLine (line, this.hierarchie, 0);
        })
    }

    addData (data) {
        this.castDataToHierarchy (data)

        this.drawGraphic (this.svg, this.hierarchie);
    }
}
