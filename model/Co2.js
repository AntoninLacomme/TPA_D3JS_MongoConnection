const mongoose = require ("mongoose");

const co2Schema = mongoose.Schema ({
    id: Number,
    "Marque / Modele": String,
    "Bonus / Malus": String,
    "Rejets CO2 g/km" : Number,
    "Cout enerie": String
});
module.exports = mongoose.model('Co2', co2Schema, "co2");
