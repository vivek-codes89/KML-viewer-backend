    const mongoose = require('mongoose');

    const kmlElementSchema = new mongoose.Schema({
        type: {
            type: String,
            required: true,
            enum: ['Point', 'LineString', 'Polygon', 'MultiLineString']
        },
        coordinates: {
            type: Array,
            required: true
        },
        properties: {
            name: String,
            description: String
        },
        length: {
            type: Number,
            default: 0
        },
        kmlFile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'KmlFile'
        }
    }, {
        timestamps: true
    });

    module.exports = mongoose.model('KmlElement', kmlElementSchema);