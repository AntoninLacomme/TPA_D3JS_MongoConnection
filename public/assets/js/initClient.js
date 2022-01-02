import "../js/templates/Legend.js";
import "../js/templates/ProgressBar.js";

const widthMin = window.innerHeight, heightMin = window.innerHeight;
const partition = d3.partition ().size ([2 * Math.PI, Math.pow(window.innerHeight * 0.45, 2)]);
const colors = ["blue", "red", "green", "yellow", "skyblue", "purple", "pink"]
const url = "http://127.0.0.1:7500";

window.onload = () => {
    function getAllData () {
        let xhttpSrcRequest = new XMLHttpRequest ();
    
        xhttpSrcRequest.open ("GET", `${url}/api/count/client`, true);
        xhttpSrcRequest.send ();
        xhttpSrcRequest.onloadend = (data) => {
            let count = JSON.parse(data.target.response)["count"];
            // let count = 1000;
            progressBar.setMaxCount (count);
            let accSkip = 0;
            let limit = 10000;
            workerJSON.postMessage ({table: "client", limit: limit, skip: limit * accSkip});
            workerJSON.onmessage = e => {
                graph.addData(e.data);
                accSkip++;
                progressBar.setProgress (accSkip * limit);
                if (accSkip * limit < count) {
                    workerJSON.postMessage ({table: "client", limit: limit, skip: limit * accSkip});
                }
                else {
                    workerJSON.terminate ();
                }
            }
       }
    }

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

    
    let graph = new GraphClient (svg);
    var listChamps = document.querySelector ("#champs");
    listChamps.addEventListener ("change", e => {
        graph.rebuild (listChamps.value);
    })
    getAllData ();
}



class GraphClient {

    constructor (svg) {
        this.svg = svg;
        this.dataOrg = [];
        this.patronHierarchie = ["sexe"];
        this.legende = {};
        this.hierarchie = {};
        this.legend = document.querySelector ("#legend");
    }

    drawGraphic (svg, hierarchie) {
        function separatorNumber (number) {
            if (number.length <= 3) return number;
            return separatorNumber (number.slice (0, number.length-3)) + "." + number.slice (number.length-3)
        }
        svg.selectAll ("path").remove ();
        svg.selectAll ("text").remove ();
        let arc = d3.arc()
            .startAngle(d => { return d.x0; })
            .endAngle(d => { return d.x1; })
            .innerRadius(d => { return Math.sqrt(d.y0); })
            .outerRadius(d => { return Math.sqrt(d.y1); });

        let data = d3.hierarchy(hierarchie)
            .sum(d => { return d.amount; });
            
        svg.selectAll("path")
            .data (partition (data))
            .enter ()
                .append ("path")
                    .attr ("display",  d => { return d.depth ? null : "none"; })
                    .attr ("d", arc)
                    .style ("fill", d => { return d.data.color })
                    .on ("mouseenter", (e, d) => this.mouseenter (e, d))
                    .on ("mouseleave", () => {
                        
                        d3.selectAll ("text")
                            .style ("fill", "black");
                    })

        hierarchie.children.forEach ((elem, index) => {
            let className = ("class" + elem.name.toString()).replaceAll (" ", "").replaceAll ("(", "").replaceAll (")", "");
            svg.append ("text")
                .text (elem.name)
                .attr ("fill", "ivory")
                .attr ("y", index * 30)
                .attr ("x", -100)
                .attr ("font-size", 30)
                .attr ("class", className)
            svg.append ("text")
            .attr ("fill", "ivory")
                .text (separatorNumber ("" + elem.amount))
                .attr ("y", index * 30)
                .attr ("x", 100)
                .attr ("font-size", 30)
                .attr ("class", className)
        })
    }

    getRuleColor (column, value) {
        if (this.legende[column] === undefined) {
            this.legende[column] = {};
        }
        let c = colors[Object.keys(this.legende[column]).length]
                    
        this.legend.addPart (column);
        switch (column) {
            default:
                this.legend.addValueToPart (column, value, "<span style=\"background-color: " + c + ";\"></span>");
            }
        if (this.legende[column][value] === undefined) {
            this.legende[column][value] = c; 
        }
        return c;
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
            if (box === null) {
                return;
            }
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

    mouseenter (e, d) {
        let sequenceArray = d.ancestors ().reverse ();
        sequenceArray.shift ();

        let className = ("class" + d.data.name.toString()).replaceAll (" ", "").replaceAll ("(", "").replaceAll (")", "");
        d3.selectAll ("text")
            .style ("fill", "ivory");
        this.svg.selectAll ("text." + className)
            .style ("fill", "red");
    }

    addData (data) {
        this.dataOrg = this.dataOrg.concat (data);
        this.castDataToHierarchy (this.dataOrg)

        this.drawGraphic (this.svg, this.hierarchie);
    }

    rebuild (column) {
        this.legend.clear ();
        this.patronHierarchie = [column];
        this.hierarchie = {};
        this.legende = {};
        this.castDataToHierarchy (this.dataOrg);

        this.drawGraphic (this.svg, this.hierarchie);
    }
}