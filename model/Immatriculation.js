const mongoose = require ("mongoose");

module.exports = mongoose.model('Immatriculation', 
    mongoose.Schema ({
        _id: String,
        immatriculation:String,
        marque:String,
        nom:String,
        puissance:Number,
        longueur:String,
        nbPlaces:Number,
        nbPortes:Number,
        couleur:String,
        occasion:Boolean,
        prix:Number
    }), "immatriculation");
