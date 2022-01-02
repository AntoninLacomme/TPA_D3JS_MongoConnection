const mongoose = require ("mongoose");

module.exports = mongoose.model('Marketing', 
    mongoose.Schema ({
        sexe: String,
        taux: Number,
        situationFamiliale: String,
        nbEnfantsAcharge: Number,
        "2eme voiture": Boolean,
        immatriculation: String
    }), "marketing");
