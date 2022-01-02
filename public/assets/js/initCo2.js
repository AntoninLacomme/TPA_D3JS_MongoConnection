// import "../js/templates/Legend.js";

const url = "http://127.0.0.1:7500";

window.onload = () => {
    const svg = d3.select  ("#chart")
                    .append("svg")
                        .attr ("width", window.innerWidth * 0.8)
                        .attr ("height", window.innerHeight)
                        .attr ("id", "svg")

    d3.json(url + "/api/co2").then (json => {
        let co2Comparator = new Co2Comparator (svg, json, "Rejets CO2 g/km", "Cout enerie",{
            fillColor: (value) => { return `hsl(${255 * ((value["Bonus / Malus"] + 6000) / (6000 + 8753))+105}, 100%, 50%)` },
            radius: (value) => { return 5; }
        });
    })

}

class Co2Comparator {    
    // le json attendu correspondant au schema suivant :
    // "Marque / Modele": String,
    // "Bonus / Malus": String,
    // "Rejets CO2 g/km" : Number,
    // "Cout enerie": String

    // columnX correspond à l'attribut que l'on souhaite placer en axe des abscisses
    // columnY correspond à l'attribut que l'on souhaite placer en axe des ordonnées
    constructor (svg, json, columnX, columnY, options = {}) {
        this.svg = svg;
        // this.legend = document.querySelector ("#legend");
        this.columns = {
            // "Marque / Modele": {
            //     min: undefined,
            //     max: undefined
            // },
            "Bonus / Malus": {
                min: undefined,
                max: undefined
            },
            "Rejets CO2 g/km": {
                min: undefined,
                max: undefined
            },
            "Cout enerie": {
                min: undefined,
                max: undefined
            }
        }
        json.forEach (line => {
            // attention les espaces dans les chaines de charactères ne sont pas les même
            // console.log (" ".charCodeAt (0))
            // console.log (" ".charCodeAt (0))
            // ces deux console.log affichent les deux différents espaces
            try {
                line["Bonus / Malus"] = parseInt (line["Bonus / Malus"].replace (/€/g, "").replace (/ /g, "").replace(/ /g, ""))
            } catch (err) { /*console.error (err);*/ }
            try {
                line["Cout enerie"] = parseInt (line["Cout enerie"].replace (/€/g, "").replace (/ /g, "").replace(/ /g, ""))
            } catch (err) { /*console.error (err);*/ }
            
            Object.keys(this.columns).forEach (c => this.setColumn (c, line));
        });
        console.log (this.columns);

        // définition des constantes de dessin
        this.widthGraph = window.innerWidth*0.6;
        this.heightGraph = window.innerHeight*0.8;
        this.wmargeGraph = window.innerWidth*0.1; 
        this.hmargeGraph = window.innerHeight*0.1;
        this.drawPoints (json, columnX, columnY, options);
    }

    setColumn (column, line) {
        if (this.columns[column].min === undefined || this.columns[column].min > line[column]) 
            this.columns[column].min = line[column];
        if (this.columns[column].max === undefined || this.columns[column].max < line[column]) 
            this.columns[column].max = line[column];
    }

    setXAxis (columnX) {
        this.abscisses = d3.scaleLinear()
            .domain([this.columns[columnX].min, this.columns[columnX].max])
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
            .domain([this.columns[columnY].min, this.columns[columnY].max])
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

        json.forEach ((value, index) => {
            // this.legend.addValueToPart ("Points", index, "<span style=\"background-color: " + (options.fillColor == undefined ? "red" : options.fillColor (value)) + ";\"></span>")
            this.svg.append ("circle")
                .attr("transform", `translate(${this.wmargeGraph},${this.hmargeGraph + this.heightGraph})`)
                .attr ("cx", value[columnX] * (this.widthGraph / this.columns[columnX].max))
                .attr ("cy", -value[columnY] * (this.heightGraph / this.columns[columnY].max))
                .attr ("r", options.radius == undefined ? 5 : options.radius (value))
                .attr ("stroke", options.strokeColor == undefined ? "black" : options.strokeColor (value))
                .attr ("fill", options.fillColor == undefined ? "red" : options.fillColor (value))
                .on ("click", ev => {
                    this.showInformations (value)
                })
                .on ("mouseenter", ev => {
                    xLinePosition
                        .attr ("x1", value[columnX] * (this.widthGraph / this.columns[columnX].max))
                        .attr ("y1", -value[columnY] * (this.heightGraph / this.columns[columnY].max))
                        .attr ("x2", 0)
                        .attr ("y2", -value[columnY] * (this.heightGraph / this.columns[columnY].max));
                    yLinePosition
                        .attr ("x1", value[columnX] * (this.widthGraph / this.columns[columnX].max))
                        .attr ("y1", -value[columnY] * (this.heightGraph / this.columns[columnY].max))
                        .attr ("x2", value[columnX] * (this.widthGraph / this.columns[columnX].max))
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
        document.querySelector ("#marque-modele").innerHTML = value["Marque / Modele"];
        document.querySelector ("#bonus-malus").innerHTML = value["Bonus / Malus"] + " €";
        document.querySelector ("#rejet-co2").innerHTML = value["Rejets CO2 g/km"];
        document.querySelector ("#cout-energie").innerHTML = value["Cout enerie"];
    }
}