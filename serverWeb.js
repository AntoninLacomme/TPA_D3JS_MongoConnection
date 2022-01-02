const PORT = 8000;

const express = require('express');
const app = express();
const http = require("http").Server (app);
http.listen (PORT, () => {
    console.log (`Server started on 127.0.0.1:${PORT}`)
});

const pathAbs = __dirname + "/public/";
app.use(express.static(pathAbs));

app.get ("/", (req, res) => { res.sendFile ("index.html"); });
app.get ("/co2", (req, res) => { res.sendFile ("co2.html", {root: pathAbs}); });
app.get ("/frequenceVoiture", (req, res) => { res.sendFile ("frequenceVoiture.html", {root: pathAbs}); });
app.get ("/client", (req, res) => { res.sendFile ("client.html", {root: pathAbs}); });
app.get ("/rapportPrix", (req, res) => { res.sendFile ("prixVoiture.html", {root: pathAbs}); });
app.get ("/voitureClient", (req, res) => { res.sendFile ("voitureClient.html", {root: pathAbs}); });