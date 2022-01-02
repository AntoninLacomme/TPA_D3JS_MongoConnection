import "../js/templates/ProgressBar.js";
import "../js/templates/Legend.js";
import "../js/templates/ControllerFqcars.js";

const widthMin = window.innerWidth, heightMin = window.innerHeight, radius = Math.pow(window.innerHeight * 0.45, 2);
const url = "http://127.0.0.1:7500";

window.onload = () => {
    function getAllData (table) {
        let xhttpSrcRequest = new XMLHttpRequest ();
    
        xhttpSrcRequest.open ("GET", `${url}/api/count/${table}`, true);
        xhttpSrcRequest.send ();
        xhttpSrcRequest.onloadend = (data) => {
            //let count = JSON.parse(data.target.response)["count"];
            let count = 200;
            let limit = 200;
            progressBarClient.setMaxCount (count);

            let accSkip = 0;
            workerJSON.postMessage ({table: table, limit: limit, skip: limit * accSkip});
            workerJSON.onmessage = e => {
                accSkip++;
                graph.addData (e.data);
                
                if (accSkip * limit < count) {
                    workerJSON.postMessage ({table: table, limit: limit, skip: limit * accSkip});
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
                        .attr ("height", heightMin * 0.8)
                        .attr ("id", "svg")
                        .append("g")
                            .attr("transform", "translate(" + 50 + "," + 10 + ")");

    var workerJSON = new Worker('../assets/js/workerLoadData.js');
    let progressBarClient = document.querySelector ("#progress-bar-client");
    
    progressBarClient.setPosition (window.innerWidth * 0.1, 10);
    progressBarClient.setWidth (window.innerWidth * 0.8);
    
    let graph = new VoitureClient (svg);
    let listChamps = document.querySelector ("#champs");
    listChamps.addEventListener ("change", e => {
        graph.rebuild (listChamps.value);
    })

    getAllData ("client");
}

class VoitureClient {

    constructor (svg) {
        this.svg = svg;
        this.data = [];
        this.column = "marque";
        this.parsedData = [];

        
        this.x = d3.scaleBand().range ([0, widthMin - 100]);

        this.y = d3.scaleLinear()
            .range([heightMin * 0.7, 0]);
           
        this.divTitle = d3.select("body").append("div")
            .attr("class", "tooltip")         
            .style("opacity", 0);
    }

    getValueIndex (v) {
        for (let i=0; i<this.parsedData.length; i++) {
            if (this.parsedData[i]["column"] === v) {
                return i;
            }
        }
        return -1;
    }

    addData (newData) {
        // on se fiche des informations des clients, on souhaite juste récupérer les voitures appartenant aux clients,
        // donc seul l'immatriculation nous intéresse
        let tmpLength = this.data.length;
        newData.forEach (elem => {
            this.data.push ({immatriculation: elem["immatriculation"]})
        })
        this.data.slice(tmpLength).forEach ((client, i) => {
            let xhttpSrcRequest = new XMLHttpRequest ();
            xhttpSrcRequest.open ("GET", `${url}/api/immatriculation/elem?immatriculation=${client["immatriculation"].replaceAll(" ", "-")}`, true);
            xhttpSrcRequest.send ();
            xhttpSrcRequest.onloadend = (data) => {
                client["vehicule"] = JSON.parse(data.target.response);
                let index = this.getValueIndex (client["vehicule"][this.column]);
                if (index === -1) {
                    this.parsedData.push ({
                        column: client["vehicule"][this.column],
                        count: 1
                    })
                } else {
                    this.parsedData[index]["count"]++;
                }
                if ((i+1) %5 === 0) {
                    this.drawGraph (JSON.parse(JSON.stringify (this.parsedData)));
                }
                document.querySelector ("#progress-bar-client").incrementProgress (1);
            }
            
        })
    }

    rebuild (column) {
        this.column = column;
        this.parsedData = [];
        this.data.forEach (client => {
            try {
                let index = this.getValueIndex (client["vehicule"][this.column]);
                //console.log (index, client, this.column)
                if (index === -1) {
                    this.parsedData.push ({
                        column: client["vehicule"][this.column],
                        count: 1
                    })
                } else {
                    this.parsedData[index]["count"]++;
                }
            } catch (err) { console.log (err); }
        })
        
        this.drawGraph (JSON.parse(JSON.stringify (this.parsedData)));
    }

    drawGraph (data) {
        document.querySelectorAll ("g.axis").forEach (elem => elem.remove ())
        this.x.domain (data.map (d => d.column));
        this.y.domain ([0, d3.max (data, d => d.count)])

        document.querySelectorAll ("text.class-type").forEach (elem => elem.remove ())
        this.svg.append("g")
            .attr("transform", "translate(0," + heightMin*0.7 + ")")
            .call(d3.axisBottom(this.x).tickSize(0))
            .selectAll("text")	
                // .style("text-anchor", "end")
                // .attr("dx", "-.8em")
                .attr("dy", "1em")
                //.attr("transform", "rotate(-65)")
                .attr("class", "class-type");

        this.svg.append("g")
                .call(d3.axisLeft(this.y).ticks(8))
                .attr ("class", "axis")

        document.querySelectorAll (".bar").forEach (elem => elem.remove ())
        this.svg.selectAll (".bar")
            .data (data)
            .enter ()
            .append ("rect")
            .attr ("class", "bar")
            .attr ("x", d => this.x(d.column))
            .attr ("y", d => this.y(d.count))
            .attr ("width", this.x.bandwidth()*0.9)
            .attr ("height", d => heightMin * 0.7 - this.y(d.count))		
            .attr ("fill", "skyblue")			
            .on ("mouseover", (event, d) => {
                this.divTitle.transition()        
                    .duration (200)      
                    .style ("opacity", .9);
                    this.divTitle.html ("Nombre de véhicules : " + d.count)
                    .style ("left", (event.pageX + 10) + "px")     
                    .style ("top", (event.pageY - 50) + "px")
                    .style ("color", "red")
            })
            .on ("mouseout", (event, d) => {
                this.divTitle.transition ()
                    .duration (500)
                    .style ("opacity", 0);
            });
    }
}