import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinaryInstance) { }

  async uploadFile(file: Express.Multer.File, tags: string[]): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', tags },
        (error, result) => {
          if (error) {
            console.error('Lỗi upload Cloudinary:', error);
            reject(error);
          } else {
            // console.log('Cloudinary upload result:', result); // Kiểm tra kết quả
            resolve(result as UploadApiResponse); // Trả về toàn bộ result
          }
        }
      );

      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }




  async applyEffect(publicId: string, effect: string): Promise<string> {
    return cloudinary.url(publicId, { effect });
  }

  async removeBackground(publicId: string): Promise<string> {
    return cloudinary.url(publicId, {
      effect: "background_removal",
      fetch_format: "auto",
      quality: "auto",
      secure: true,
    });
  }
  async blurBackground(publicId: string): Promise<string | null> {
    try {
      if (!publicId) throw new Error("Thiếu publicId của ảnh");

      // Xóa nền, đảm bảo giữ PNG
      const removedBg = await cloudinary.uploader.upload(
        cloudinary.url(publicId, {
          transformation: [{ effect: "background_removal" }],
          format: "png", // Giữ nền trong suốt
          secure: true,
        }),
        { public_id: `${publicId}_no_bg`, format: "png" } // Đảm bảo lưu dưới PNG
      );
      console.log(removedBg.secure_url);

      // Overlay chủ thể đã xóa nền lên nền mờ
      const finalImageUrl = cloudinary.url(publicId, {
        transformation: [
          { effect: "blur:5000", width: 800, height: 600, crop: "fill" }, // Nền mờ
          { overlay: removedBg.public_id, width: 800, height: 600, crop: "fit", gravity: "center" }, // Overlay chủ thể
          { flags: "relative" },
          { format: "png" } // Giữ nền trong suốt
        ],
        secure: true,
      });

      console.log("  Ảnh đã xử lý:", finalImageUrl);
      return finalImageUrl;
    } catch (error) {
      console.error("  Lỗi:", error);
      return null;
    }

  }















  async adjustBrightness(publicId: string, level: number): Promise<string> {
    return cloudinary.url(publicId, {
      transformation: [{ effect: `brightness:${level}` }], // Dùng transformation array
      fetch_format: "auto",
      quality: "auto",
      secure: true,
    });
  }

  async artisticStyle(publicId: string, style: string): Promise<string> {
    return cloudinary.url(publicId, {
      transformation: [
        { effect: `${style}` },
        // { effect: "brightness:20" } // Thêm độ sáng vào ảnh nghệ thuật
      ],
      fetch_format: "auto",
      quality: "auto",
      secure: true,
    });
  }
  async adjustColor(publicId: string, level: number): Promise<string> {
    return cloudinary.url(publicId, {
      transformation: [{ effect: `saturation:${level}` }],
      fetch_format: "auto",
      quality: "auto",
      secure: true,
    });
  }
  async adjustContrast(publicId: string, level: number): Promise<string> {
    return cloudinary.url(publicId, {
      transformation: [{ effect: `contrast:${level}` }],
      fetch_format: "auto",
      quality: "auto",
      secure: true,
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

}
// gen_restore tăng cường hình ảnh
//cartoonify: tạo hình ảnh hoạt hình
// enhance tăng sángsáng