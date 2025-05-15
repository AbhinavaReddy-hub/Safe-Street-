
const multer = require('multer');
const path  = require('path');
const fs    = require('fs');

// ensure temp-uploads dir exists
const uploadDir = path.join(__dirname, '../temp-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    cb(null, `image-${ unique }${ path.extname(file.originalname) }`);
  },
});

const baseMulter = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    files:     10,           // max 10 images
    fileSize:  5 * 1024**2,  // 5 MB each
  },
});

// multerDebug wraps .array('images')
const upload = (req, res, next) => {
  console.log('Multer processing request…');
  baseMulter.array('images')(req, res, err => {
    console.log('Multer received fields:', req.body);
    console.log('Multer received files:', req.files?.length ?? 0);
    if (req.files && req.files.length) {
      console.log(
        ' -> files:',
        req.files.map(f => ({
          originalname: f.originalname,
          size:         f.size,
          fieldname:    f.fieldname
        }))
      );
    }
    if (err) return handleMulterErrors(err, req, res, next);
    next();
  });
};

const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // unexpected field name, wrong field, etc.
    return res.status(400).json({ success: false, error: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
};

// on any error response, clean up temp files
const cleanupOnError = (req, res, next) => {
  const origJson = res.json;
  res.json = function (body) {
    if (req.files && body && !body.success) {
      req.files.forEach(f => {
        fs.unlink(f.path, e => {
          if (e) console.warn(`cleanup err for ${f.path}:`, e.message);
          else console.log(`Deleted temp file ${f.path}`);
        });
      });
    }
    return origJson.call(this, body);
  };
  next();
};

module.exports = { upload, handleMulterErrors, cleanupOnError };
