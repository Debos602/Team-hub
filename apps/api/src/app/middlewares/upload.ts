import multer from 'multer';
import { Request } from 'express';

// memory storage so we can stream to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'));
    return;
  }
  cb(null, true);
};

export const upload = multer({ storage, fileFilter });

export default upload;
