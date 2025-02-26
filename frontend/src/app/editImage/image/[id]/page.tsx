"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  applyEffect,
  artisticStyle,
  removeBackground,
  adjustBrightness,
  adjustColor,
  adjustContrast,
  blurBackground,
} from "@/app/api/editImage/edit";

interface Image {
  _id: string;
  title: string;
  url: string;
  link: string;
  likes: number;
  description: string;
  userId: { avatar: string; username: string };
}

const styleOptions = {
  "tranh-ve": "oil_paint",
  "hoat-hinh": "cartoonify",
  "vang-gogh": "vignette",
};

async function fetchImage(id: string, token: string): Promise<Image | null> {
  try {
    const res = await fetch(`http://localhost:3000/images/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error loading image:", error);
    return null;
  }
}

export default function Edit() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [image, setImage] = useState<Image | null>(null);
  const [loading, setLoading] = useState(false);
  const [editedImage, setEditedImage] = useState(null);
  const [effect, setEffect] = useState("");
  const [filter, setFilter] = useState("");
  const [brightness, setBrightness] = useState(30);
  const [colorLevel, setColorLevel] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [selectedStyle, setSelectedStyle] =
    useState<keyof typeof styleOptions>("tranh-ve");

  useEffect(() => {
    (async () => {
      if (!id) return;
      const token = await getToken();
      if (!token) return;
      setImage(await fetchImage(id, token));
    })();
  }, [id, getToken]);

  const handleEdit = useCallback(
    async (action: string, value: any = null) => {
      setLoading(true);
      const token = await getToken();
      if (!token || !id) return;
      let response;

      switch (action) {
        case "effect":
          response = await applyEffect(id, value || effect, token);
          break;
        case "removeBg":
          response = await removeBackground(id, token);
          break;
        case "blurBg":
          response = await blurBackground(id, token);
          break;
        case "artisticStyle":
          response = await artisticStyle(id, value || effect, token);
          break;
        case "brightness":
          response = await adjustBrightness(id, brightness, token);
          break;
        case "color":
          response = await adjustColor(id, colorLevel, token);
          break;
        case "contrast":
          response = await adjustContrast(id, contrast, token);
          break;
        default:
          break;
      }
      setEditedImage(response?.editedUrl || null);
      setLoading(false);
    },
    [id, getToken, effect, brightness, colorLevel, contrast]
  );
  const handleDownload = async () => {
    if (!editedImage) return;
    try {
      const response = await fetch(editedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "edited-image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Chỉnh sửa ảnh
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-center font-semibold mb-2">Ảnh gốc</h2>
          {image ? (
            <img
              src={image.url}
              alt={image.title}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <p className="text-center text-gray-600">Đang tải ảnh...</p>
          )}
        </div>
        <div>
          <h2 className="text-center font-semibold mb-4">Ảnh chỉnh sửa</h2>
          {editedImage ? (
            <div className="mt-4">
              <img
                src={editedImage}
                alt="Edited"
                className="w-full rounded-lg shadow-lg mb-4"
              />
              <Button
                onClick={handleDownload}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
              >
                📥 Tải ảnh xuống
              </Button>
            </div>
          ) : (
            <p className="text-center text-gray-600">Chưa có ảnh chỉnh sửa</p>
          )}
        </div>
      </div>

      {/* Các điều khiển chỉnh sửa */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Độ sáng: {brightness}
          </label>
          <Slider
            value={[brightness]}
            min={-100}
            max={100}
            step={1}
            onValueChange={(val) => setBrightness(val[0])}
            className="mb-2"
          />
          <Button
            onClick={() => handleEdit("brightness")}
            className="w-full bg-yellow-500 text-white hover:bg-yellow-600 transition duration-200"
          >
            Áp dụng ánh sáng
          </Button>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Màu sắc: {colorLevel}
          </label>
          <Slider
            value={[colorLevel]}
            min={-100}
            max={100}
            step={1}
            onValueChange={(val) => setColorLevel(val[0])}
            className="mb-2"
          />
          <Button
            onClick={() => handleEdit("color")}
            className="w-full bg-yellow-500 text-white hover:bg-yellow-600 transition duration-200"
          >
            Áp dụng màu sắc
          </Button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Tương phản: {contrast}
          </label>
          <Slider
            value={[contrast]}
            min={-100}
            max={100}
            step={1}
            onValueChange={(val) => setContrast(val[0])}
            className="mb-2"
          />
          <Button
            onClick={() => handleEdit("contrast")}
            className="w-full bg-yellow-500 text-white hover:bg-yellow-600 transition duration-200"
          >
            Áp dụng độ tương phản
          </Button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Xử lý nền:
          </label>
          <Select value={effect} onValueChange={setEffect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn chế độ nền" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="removeBg">Xóa phông nền</SelectItem>
              <SelectItem value="blurBg">Làm mờ nền</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => handleEdit(effect)}
            className="w-full bg-red-500 text-white hover:bg-red-600 transition duration-200 mt-2"
          >
            Áp dụng
          </Button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Chuyển đổi phong cách nghệ thuật:
          </label>
          <Select
            value={selectedStyle}
            onValueChange={(value) =>
              setSelectedStyle(value as keyof typeof styleOptions)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn phong cách" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tranh-ve">Tranh vẽ</SelectItem>
              <SelectItem value="hoat-hinh">Hoạt hình</SelectItem>
              <SelectItem value="vang-gogh">VangohVangoh</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() =>
              handleEdit("artisticStyle", styleOptions[selectedStyle])
            }
            className="w-full bg-green-500 text-white hover:bg-green-600 transition duration-200 mt-2"
          >
            Áp dụng phong cách
          </Button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Bộ lọc:
          </label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn bộ lọc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grayscale">Grayscale</SelectItem>
              <SelectItem value="sepia">Sepia</SelectItem>
              <SelectItem value="blur">Blur</SelectItem>
              <SelectItem value="pixelate">Pixelate</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => handleEdit("effect", filter)}
            className="w-full bg-purple-500 text-white hover:bg-purple-600 transition duration-200 mt-2"
          >
            Áp dụng bộ lọc
          </Button>
        </div>
      </div>
    </div>
  );
}
