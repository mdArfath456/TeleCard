const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isConfigured: cloudinaryConfigured } = require('../config/cloudinary');

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpe?g|png|webp|gif)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for payment screenshots'));
  }
};

let storage;

if (cloudinaryConfigured) {
  // Cloudinary is configured — stream uploads straight to it. We build the
  // storage engine by hand (rather than depending on multer-storage-cloudinary)
  // so req.file.path always ends up as the final secure_url.
  storage = multer.memoryStorage();
} else {
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'payments');
  fs.mkdirSync(uploadDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// When Cloudinary is active, this middleware runs after multer.memoryStorage()
// has buffered the file, uploads the buffer, then reshapes req.file to look
// like the disk-storage result (adds .path = secure_url, .filename = public_id)
// so downstream controller code doesn't need to know which backend is active.
function finalizeUpload(req, res, next) {
  if (!cloudinaryConfigured || !req.file) return next();

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'telecard/payments', resource_type: 'image' },
    (err, result) => {
      if (err) return next(err);
      req.file.path = result.secure_url;
      req.file.filename = result.public_id;
      req.file.cloudinary = true;
      next();
    }
  );
  stream.end(req.file.buffer);
}

module.exports = upload;
module.exports.finalizeUpload = finalizeUpload;
module.exports.cloudinaryConfigured = cloudinaryConfigured;
