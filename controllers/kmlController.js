const KmlFile = require('../models/kmlFile.model');
const KmlElement = require('../models/kmlElement.model');
const KmlParser = require('../utils/kmlParser');

class KmlController {
    static async uploadKml(req, res) {
        console.log(">>>>>>>",req.file)
        try {

            if (!req.file) {

                return res.status(400).json({ error: 'No file uploaded' });
            }
            console.log('Uploaded file:', req.file);

            const parsedData = await KmlParser.parseKMLFile(req.file.buffer);
            
            const kmlFile = new KmlFile({
                filename: req.file.originalname,
                summary: parsedData.summary
            });

        
            const elementPromises = parsedData.elements.map(async element => {
                const kmlElement = new KmlElement({
                    type: element.type,
                    coordinates: element.coordinates,
                    properties: element.properties,
                    length: element.length,
                    kmlFile: kmlFile._id
                });
                await kmlElement.save();
                return kmlElement._id;
            });

            kmlFile.elements = await Promise.all(elementPromises);
            await kmlFile.save();

            res.status(201).json({
                message: 'KML file uploaded successfully',
                data: parsedData
            });
        } catch (error) {
            console.log(">>>>>>>error",error)
            res.status(500).json({ error: error.message });
        }
    }

    static async getKmlFiles(req, res) {
        try {
            const files = await KmlFile.find()
                .select('filename uploadDate summary')
                .sort('-uploadDate');
            res.json(files);
        } catch (error) {
            console.log(">>>>>>>>error1",error)
            res.status(500).json({ error: error.message });
        }
    }

    static async getKmlFileDetails(req, res) {
        try {
            const fileId = req.params.id;
            const file = await KmlFile.findById(fileId)
                .populate('elements');
            
            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }

            res.json(file);
        } catch (error) {
            
            console.log(">>>>>>>>error2",error)

            res.status(500).json({ error: error.message });
        }
    }

    static async deleteKmlFile(req, res) {
        try {
            const fileId = req.params.id;
            
           
            await KmlElement.deleteMany({ kmlFile: fileId });
            
     
            const result = await KmlFile.findByIdAndDelete(fileId);
            
            if (!result) {
                return res.status(404).json({ error: 'File not found' });
            }

            res.json({ message: 'File deleted successfully' });
        } catch (error) {
            console.log(">>>>>>>>>>>error3",error)
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = KmlController;