const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Create categories directories
const categories = ['fire', 'sunset', 'sunrise', 'airplane'];
categories.forEach(category => {
    const categoryDir = path.join(uploadDir, category);
    if (!fs.existsSync(categoryDir)){
        fs.mkdirSync(categoryDir, { recursive: true });
    }
});

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const category = req.body.category || 'uncategorized';
        const categoryPath = path.join(uploadDir, category);
        
        // Create category directory if it doesn't exist
        if (!fs.existsSync(categoryPath)){
            fs.mkdirSync(categoryPath, { recursive: true });
        }
        
        cb(null, categoryPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Initialize multer upload
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'photography-portfolio.html'));
});

// Handle photo uploads
app.post('/upload', upload.single('photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get metadata from request body
        const { title, category, description } = req.body;
        
        // Save metadata along with file info
        const photoData = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path.replace(__dirname, ''),
            size: req.file.size,
            category: category || 'uncategorized',
            title: title || 'Untitled',
            description: description || '',
            uploadDate: new Date().toISOString()
        };

        // In a real application, you'd store this data in a database
        // For now, let's just return it
        res.status(200).json({
            message: 'File uploaded successfully',
            photo: photoData
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error uploading file',
            details: error.message
        });
    }
});

// Get photos API endpoint
app.get('/api/photos', (req, res) => {
    const category = req.query.category;
    let photos = [];
    
    try {
        // If category is specified, get photos from that category
        if (category && categories.includes(category)) {
            const categoryPath = path.join(uploadDir, category);
            if (fs.existsSync(categoryPath)) {
                const files = fs.readdirSync(categoryPath);
                photos = files.map(file => {
                    return {
                        filename: file,
                        path: `/uploads/${category}/${file}`,
                        category: category
                    };
                });
            }
        } else {
            // Get all photos from all categories
            categories.forEach(cat => {
                const categoryPath = path.join(uploadDir, cat);
                if (fs.existsSync(categoryPath)) {
                    const files = fs.readdirSync(categoryPath);
                    const categoryPhotos = files.map(file => {
                        return {
                            filename: file,
                            path: `/uploads/${cat}/${file}`,
                            category: cat
                        };
                    });
                    photos = [...photos, ...categoryPhotos];
                }
            });
        }
        
        res.status(200).json(photos);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error retrieving photos',
            details: error.message
        });
    }
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
