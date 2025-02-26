"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShareAlt,
  faEllipsisH,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useRouter } from "next/navigation";
import {
  getCollectionImages,
  removeImageFromCollection,
  updateImageOrder,
} from "@/app/api/collections/collectionService";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
} from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import Link from "next/link";

const Gallery: React.FC = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { id: collectionId } = useParams() as { id: string };
  const router = useRouter();
  const [images, setImages] = useState<
    { _id: string; url: string; title?: string }[]
  >([]);
  const [collectionName, setCollectionName] = useState("Bộ sưu tập");

  const fetchImages = async () => {
    if (!collectionId) return;
    try {
      const token = await getToken();
      if (token) {
        const data = await getCollectionImages(token, collectionId);
        setImages([...data]);
        setCollectionName(data.title || "Bộ sưu tập");
      }
    } catch (error) {
      console.error("Lỗi khi tải ảnh:", error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [collectionId]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const newImages = [...images];
    const [movedImage] = newImages.splice(result.source.index, 1);
    newImages.splice(result.destination.index, 0, movedImage);
    setImages(newImages);
    try {
      const token = await getToken();
      if (token) {
        await updateImageOrder(
          token,
          collectionId,
          newImages.map((img) => img._id)
        );
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thứ tự ảnh:", error);
    }
  };

  const handleRemoveImageFromCollection = async (imageId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Bạn chưa đăng nhập!");
        return;
      }

      await removeImageFromCollection(token, collectionId, imageId); // collectionId đã có sẵn

      setImages((prevImages) =>
        prevImages.filter((image) => image._id !== imageId)
      );
      toast.success("Ảnh đã được xóa khỏi bộ sưu tập!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại!"
      );
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white text-gray-900">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">{collectionName}</h1>
        <div className="flex space-x-4">
          <FontAwesomeIcon icon={faShareAlt} className="text-xl" />
          <FontAwesomeIcon icon={faEllipsisH} className="text-xl" />
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="gallery" direction="horizontal">
          {(provided: DroppableProvided) => (
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {images.map((image, index) => (
                <Draggable
                  key={image._id}
                  draggableId={image._id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="relative group"
                    >
                      <Link
                        href={`/detailImages/image/${image._id}`}
                        className="cursor-pointer"
                      >
                        <img
                          src={image.url}
                          alt={image.title || "Ảnh"}
                          className="rounded-lg w-full transition-transform duration-200 hover:scale-105"
                        />
                      </Link>

                      <button
                        onClick={() =>
                          router.push(`/editImage/image/${image._id}`)
                        }
                        className="absolute top-2 right-12 bg-black bg-opacity-50 text-white p-2 rounded-lg hidden group-hover:block"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() =>
                          handleRemoveImageFromCollection(image._id)
                        }
                        className="absolute top-2 right-2 bg-red-600 bg-opacity-80 text-white p-2 rounded-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Gallery;
