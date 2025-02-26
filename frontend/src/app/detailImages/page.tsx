// components/DetailImage.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faExpand, faSyncAlt, faHeart, faSmile, faImage } from "@fortawesome/free-solid-svg-icons";

const DetailImage: React.FC<{ imageSrc: string; title: string; author: string; avatar: string }> = ({
  imageSrc,
  title,
  author,
  avatar,
}) => {

  return (
    <div className="bg-white max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-4">
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <img alt={title} className="w-full h-64 object-cover" src={imageSrc} />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">Được tạo bằng AI</div>
          <div className="absolute top-4 right-4 flex space-x-2">
            <button className="text-white bg-black bg-opacity-50 p-2 rounded-full">
              <FontAwesomeIcon icon={faExpand} />
            </button>
            <button className="text-white bg-black bg-opacity-50 p-2 rounded-full">
              <FontAwesomeIcon icon={faSyncAlt} />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <a className="text-sm text-gray-500" href="#">redbubble.com</a>
            <button className="text-red-600 text-lg">
              <FontAwesomeIcon icon={faHeart} /> 2
            </button>
          </div>
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <div className="flex items-center mb-4">
            <img alt="User avatar" className="w-10 h-10 rounded-full mr-2" src={avatar} />
            <span className="text-gray-700">{author}</span>
          </div>
          <button className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg mb-4">Truy cập trang</button>
          <p className="text-gray-500 mb-4">Thêm mô tả ảnh ở đây...</p>
        </div>
      </div>
    </div>
  );
};

export default DetailImage;
