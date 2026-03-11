import path from 'path';
import express, { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const checkFileType = (file: Express.Multer.File, cb: FileFilterCallback) => {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'));
  }
};

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post('/', upload.single('image'), (req: Request, res: Response) => {
  if (req.file) {
    const fixedPath = req.file.path.replace(/\\/g, '/');
    res.json({ imageUrl: `/${fixedPath}` });
  } else {
    res.status(400).send({ message: 'No image uploaded' });
  }
});

export default router;
