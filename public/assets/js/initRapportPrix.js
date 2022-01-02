// import "../js/templates/Legend.js";

const url = "http://127.0.0.1:7500";
const widthMin = window.innerHeight, heightMin = window.innerHeight;

window.onload = () => {
    function containsParsedDataElement (data, elem) {
        for (let i=0; i<data.length; i++) {
            if (data[i].marque === elem.marque) {
                if (data[i].nom === elem.nom) {
                    //if (data[i].couleur === elem.couleur) {
                        return data[i];
                    //}
                }
            }
        }
        return false;
    }

    const svg = d3.select  ("#chart")
                    .append("svg")
                        .attr ("width", window.innerWidth * 0.8)
                        .attr ("height", window.innerHeight)
                        .attr ("id", "svg")

    let parsedData = [];
    d3.json(url + "/api/catalogue").then (json => {

        json.forEach(element => {
            let value = containsParsedDataElement (parsedData, element);
            if (!value) {
                let data = {
                    marque: element.marque,
                    nom: element.nom,
                    puissance: element.puissance,
                    longueur: element.longueur,
                    nbPlaces: element.nbPlaces,
                    nbPortes: element.nbPortes,
                    couleur: element.couleur
                }
                if (element.occasion.toString () === "false") {
                    data["prixNeuf"] = element.prix
                } else {
                    data["prixOccasion"] = element.prix
                }
                parsedData.push (data)
            } else {
                if (element.occasion.toString () === "false") {
                    value["prixNeuf"] = element.prix
                } else {
                    value["prixOccasion"] = element.prix
                }
            }
        });
        
        new RapportPrix (svg, parsedData)
    })
}

class RapportPrix {
    constructor (svg, json, options = {}) {
        this.svg = svg;
        this.fillSelect (json);

        // définition des constantes de dessin
        this.widthGraph = window.innerWidth*0.6;
        this.heightGraph = window.innerHeight*0.8;
        this.wmargeGraph = window.innerWidth*0.1; 
        this.hmargeGraph = window.innerHeight*0.1;
        this.drawPoints (json, "prixNeuf", "prixOccasion", options);
    }

    fillSelect (data) {
        let fillSelectData = {};
        data.forEach (elem => {
            if (!Object.keys(fillSelectData).includes (elem.marque)) {
                fillSelectData[elem.marque] = [elem];
            } else {
                fillSelectData[elem.marque].push(elem);
            }
        });
        
        let listMarque = document.querySelector ("#marque");
        let option = document.createElement ("option");
        option.innerHTML = " ";
        listMarque.appendChild (option);
        Object.keys(fillSelectData).forEach (key => {
            let option = document.createElement ("option");
            option.innerHTML = key;
            listMarque.appendChild (option);
        });

        this.fillSelectName (fillSelectData[listMarque.value])
        listMarque.addEventListener ("change", ev => {
            this.fillSelectName (fillSelectData[listMarque.value])
        })

        // définition de l'event lié à boutton de filtre
        document.querySelector ("#filterButton").addEventListener ("click", () => {
            function activateElem (elem, bool) {
                if (bool) {
                    let p = 10;
                    Object.values(fillSelectData).forEach (value => {
                        value.forEach (obj => {
                            if (elem.classList.contains(obj.marque) && elem.classList.contains (obj.nom.replaceAll (" ", "-"))) {
                                p = obj.puissance / 10;
                            }
                        })
                    })
                    elem.setAttribute ("fill", "green");
                    elem.setAttribute ("r", p);
                } else {
                    elem.setAttribute ("fill", "red");
                    elem.setAttribute ("r", 5);
                }
            }
            let marque = document.querySelector ("#marque").value != "" ? document.querySelector ("#marque").value : undefined;
            let nom = document.querySelector ("#nom").value != "" ? document.querySelector ("#nom").value.replaceAll (" ", "-") : undefined;

            document.querySelectorAll ("circle").forEach (elem => {
                if (marque === undefined && nom === undefined) {
                    activateElem (elem, false)
                    return;
                }

                if (marque === undefined) {
                    activateElem (elem, true)
                } else {
                    if (elem.classList.contains (marque)) {
                        activateElem (elem, true)
                    } else {
                        activateElem (elem, false)
                        return;
                    }
                }

                if (nom === undefined) {
                    activateElem (elem, true)
                } else {
                    if (elem.classList.contains (nom)) {
                        activateElem (elem, true)
                    } else {
                        activateElem (elem, false)
                    }
                }
            })
        })
    }

    fillSelectName (data) {
        document.querySelectorAll ("#nom > option").forEach (elem => elem.remove ());

        let option = document.createElement ("option");
        option.innerHTML = " ";
        document.querySelector ("#nom").appendChild (option);
        try {
            data.forEach (elem => {
                let option = document.createElement ("option");
                option.innerHTML = elem.nom;
                document.querySelector ("#nom").appendChild (option);
            })
        } catch (err) {}
    }

    setXAxis (columnX) {
        this.abscisses = d3.scaleLinear()
            .domain([0, 110000])
            .range([0, this.widthGraph]);
        this.barreAbscisses = this.svg.append("g")
            .attr("transform", `translate(${this.wmargeGraph},${this.hmargeGraph + this.heightGraph})`)
            .call(d3.axisBottom(this.abscisses).ticks(10));
        this.txtAbscisses = this.svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", this.widthGraph + this.wmargeGraph)
            .attr("y", this.heightGraph + this.hmargeGraph + 30)
            .text(columnX);
    }

    setYAxis (columnY) {
        this.ordonnees = d3.scaleLinear()
            .domain([0, 100000])
            .range([this.heightGraph, 0]);
        this.barreOrdonnees = this.svg.append("g")
            .attr("transform", `translate(${this.wmargeGraph},${this.hmargeGraph})`)
            .call(d3.axisLeft(this.ordonnees).ticks (10));
        this.txtOrdonnees = this.svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", this.wmargeGraph - 100)
            .attr("y", this.hmargeGraph - 20)
            .text(columnY)
            .attr("text-anchor", "start")
    }

    drawPoints (json, columnX, columnY, options = {}) {
        this.setXAxis (columnX);
        this.setYAxis (columnY);

        // this.legend.addPart ("Points");

        let xLinePosition = this.svg.append ("line")
            .attr("transform", `translate(${this.wmargeGraph},${this.hmargeGraph + this.heightGraph})`)
            .style ("stroke-dasharray", ("3, 3"))
            .style ("stroke", "black")
        let yLinePosition = this.svg.append ("line")
            .attr("transform", `translate(${this.wmargeGraph},${this.hmargeGraph + this.heightGraph})`)
            .style ("stroke-dasharray", ("3, 3"))
            .style ("stroke", "black")

        this.svg.append ("line")
            .attr("transform", `translate(${this.wmargeGraph},${this.hmargeGraph + this.heightGraph})`)
            .style ("stroke-dasharray", ("8, 3"))
            .style ("stroke", "black")
            .attr ("x1", 0)
            .attr ("y1", 0)
            .attr ("x2", 100000 * (this.widthGraph / 110000))
            .attr ("y2", -this.heightGraph);

        json.forEach ((value, index) => {
            // this.legend.addValueToPart ("Points", index, "<span style=\"background-color: " + (options.fillColor == undefined ? "red" : options.fillColor (value)) + ";\"></span>")
            this.svg.append ("circle")
                .attr("transform", `translate(${this.wmargeGraph},${this.hmargeGraph + this.heightGraph})`)
                .attr ("cx", value[columnX] * (this.widthGraph / 110000))
                .attr ("cy", -value[columnY] * (this.heightGraph / 100000))
                .attr ("r", options.radius == undefined ? 5 : options.radius (value))
                .attr ("stroke", options.strokeColor == undefined ? "black" : options.strokeColor (value))
                .attr ("fill", options.fillColor == undefined ? "red" : options.fillColor (value))
                .attr ("class", value["marque"] + " " + value["nom"].replaceAll (" ", "-"))
                .on ("click", ev => {
                    this.showInformations (value);
                })
                .on ("mouseenter", ev => {
                    xLinePosition
                        .attr ("x1", value[columnX] * (this.widthGraph / 110000))
                        .attr ("y1", -value[columnY] * (this.heightGraph / 100000))
                        .attr ("x2", 0)
                        .attr ("y2", -value[columnY] * (this.heightGraph / 100000));
                    yLinePosition
                        .attr ("x1", value[columnX] * (this.widthGraph / 110000))
                        .attr ("y1", -value[columnY] * (this.heightGraph / 100000))
                        .attr ("x2", value[columnX] * (this.widthGraph / 110000))
                        .attr ("y2", 0)
                })
                .on ("mouseleave", ev => {
                    xLinePosition
                        .attr ("x1", 0)
                        .attr ("y1", 0)
                        .attr ("x2", 0)
                        .attr ("y2", 0);
                    yLinePosition
                        .attr ("x1", 0)
                        .attr ("y1", 0)
                        .attr ("x2", 0)
                        .attr ("y2", 0)
                })
        })
    }
    
    showInformations (value) {
        document.querySelector ("#form-marque").innerHTML = value["marque"]
        document.querySelector ("#form-nom").innerHTML = value["nom"]
        document.querySelector ("#prix-neuve").innerHTML = value["prixNeuf"]
        document.querySelector ("#prix-occasion").innerHTML = value["prixOccasion"]
        document.querySelector ("#form-puissance").innerHTML = value["puissance"]
        document.querySelector ("#nb-place").innerHTML = value["nbPlaces"]
        document.querySelector ("#nb-porte").innerHTML = value["nbPortes"]
    }
}