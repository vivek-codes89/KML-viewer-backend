const multer = require('multer');

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

module.exports = upload;