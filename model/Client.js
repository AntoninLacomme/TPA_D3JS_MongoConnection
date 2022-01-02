const mongoose = require ("mongoose");

module.exports = mongoose.model('Client', 
    mongoose.Schema ({
        sexe: String,
        taux: Number,
        situationFamiliale: String,
        nbEnfantsAcharge: Number,
        "2eme voiture": Boolean,
        immatriculation: String
    }), "clients");
