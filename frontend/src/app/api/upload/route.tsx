import multer from 'multer';
import { NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

// Cấu hình multer để lưu trữ ảnh
const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

// Middleware để xử lý upload
const uploadMiddleware = upload.array('images');

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Tạo một Promise để xử lý upload
    await new Promise<void>((resolve, reject) => {
      uploadMiddleware(req as any, {} as any, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return NextResponse.json({ message: 'Upload successful' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
