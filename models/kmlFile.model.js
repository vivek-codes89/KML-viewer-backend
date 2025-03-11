const mongoose = require('mongoose');

const kmlFileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    summary: {
        type: Map,
        of: Number
    },
    elements: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KmlElement'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('KmlFile', kmlFileSchema);