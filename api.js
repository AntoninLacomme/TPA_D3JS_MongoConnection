// dependances :
// express
// mongoose
const PORT = 7500;

const express = require('express');
const app = express();
const http = require("http").Server (app);
http.listen (PORT, () => {
    console.log ("Server started on 127.0.0.1:" + PORT)
});

const api = require ("./model/api.js");
const prefix = '/api';

const Client = require ("./model/Client.js");
const Catalogue = require ("./model/Catalogue.js");
const Co2 = require ("./model/Co2.js");
const Marketing = require ("./model/Marketing.js");
const Immatriculation = require ("./model/Immatriculation.js");

let arborescence = {}
arborescence["client"] = Client;
arborescence["catalogue"] = Catalogue;
arborescence["co2"] = Co2;
arborescence["marketing"] = Marketing;
arborescence["immatriculation"] = Immatriculation;


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

Object.keys (arborescence).forEach ((key) => {
    console.log (prefix + "/" + key)
    app.route (prefix + '/' + key)
        .get (api.getElems (arborescence[key]))
        .post (api.postElem (arborescence[key]))
        .put (api.updateElem (arborescence[key]));
    // app.route (prefix + '/' + key + '/:id')
    //     .get (api.getElem (arborescence[key]))
    //     .delete (api.deleteElem (arborescence[key]));
    app.route (prefix + "/count/" + key)
        .get (api.countElems (arborescence[key]));
});

app.get (prefix + '/immatriculation/elem/', (req, res) => {
    let plaque = (req.query["immatriculation"] !== undefined) ? req.query["immatriculation"] : "";
    plaque = plaque.replace(/-/g, " ");
    Immatriculation.findOne ({immatriculation: plaque}, (err, elem) => {
        if (err) { res.send(err) }
        res.json (elem);
    })
})

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TP3DBBigData')
    .then(() => {
        console.log("Successfully connect to MongoDB.");
    })
    .catch(err => {
        console.error("Connection error", err);
    });