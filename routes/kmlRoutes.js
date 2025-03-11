const express = require('express');
const router = express.Router();
const multer = require('multer');
const KmlController = require('../controllers/kmlController');

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.google-earth.kml+xml' || 
            file.originalname.endsWith('.kml')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only KML files are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Routes
router.post('/upload', upload.single('kmlFile'), KmlController.uploadKml);
router.get('/files', KmlController.getKmlFiles);
router.get('/files/:id', KmlController.getKmlFileDetails);
router.delete('/files/:id', KmlController.deleteKmlFile);

module.exports = router;