




const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use temp-uploads directory for temporary storage
const uploadDir = path.join(__dirname, '../temp-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 100 * 10240 * 10240,
    files: 10,
  },
}).array('images');

const multerDebug = (req, res, next) => {
  console.log('Multer processing request...');
  upload(req, res, (err) => {
    console.log('Multer received fields:', Object.keys(req.body));
    console.log('Multer received files:', req.files || 'No files received');
    if (req.files && req.files.length > 0) {
      console.log('File details:', req.files.map(file => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      })));
    }
    if (err) return handleMulterErrors(err, req, res, next);
    next();
  });
};

const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: `Unexpected field name. Expected 'images' but received '${err.field}'`,
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  next();
};

const cleanupOnError = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (req.files && body && !body.success) {
      req.files.forEach((file) => {
        // Check if the file exists before attempting to delete
        fs.access(file.path, fs.constants.F_OK, (err) => {
          if (err) {
            console.log(`File ${file.path} already deleted or not found, skipping cleanup`);
            return;
          }
          fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) {
              console.error(`Failed to delete temp file ${file.path}:`, unlinkErr);
            } else {
              console.log(`Cleanup: Deleted temp file ${file.path}`);
            }
          });
        });
      });
    }
    return originalJson.call(this, body);
  };
  next();
};

module.exports = { upload: multerDebug, handleMulterErrors, cleanupOnError };
