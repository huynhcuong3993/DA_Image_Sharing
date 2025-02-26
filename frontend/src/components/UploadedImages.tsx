interface UploadedImagesProps {
  uploadedFiles: string[];
}

export default function UploadedImages({ uploadedFiles }: UploadedImagesProps) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-bold">Uploaded Images:</h3>
        <div className="grid grid-cols-3 gap-4">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex justify-center">
              <img
                src={`/uploads/${file}`} // Đảm bảo đường dẫn file chính xác
                alt="Uploaded image"
                className="max-w-full h-auto rounded"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  