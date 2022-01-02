const mongoose = require ("mongoose");

module.exports = mongoose.model('Catalogue', 
    mongoose.Schema ({
        marque: String,
        nom: String,
        puissance: Number,
        longueur: String,
        nbPlaces: Number,
        nbPortes: Number,
        couleur: String,
        occasion: String,
        prix: Number
    }), "catalogue");