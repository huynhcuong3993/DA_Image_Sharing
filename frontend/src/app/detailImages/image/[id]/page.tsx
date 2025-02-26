import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import ReportButton from "@/components/ReportButton"; // Import nút báo cáo
import ShareButton from "@/components/ShareButton";
import FollowButton from "@/components/FollowButton";
// Import Client Component

interface Image {
  _id: string;
  title: string;
  url: string;
  link: string;
  likes: number;
  description: string;
  userId: {
    avatar: string;
    username: string;
    _id: string;
    clerkID: string;
  };
}

async function fetchImage(id: string, token: string): Promise<Image | null> {
  try {
    const res = await fetch(`http://localhost:3000/images/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Lỗi tải ảnh:", error);
    return null;
  }
}

export default async function DetailImagePage({ params }: { params: { id: string } }) {
  const { userId , getToken } = await auth();
  const token = await getToken();
  if (!token) {
    return <p>Vui lòng đăng nhập để xem chi tiết ảnh.</p>;
  }
  const image = await fetchImage(params.id, token);

  if (!image) return notFound();
  if (!userId) return <p>Chưa đăng nhập</p>;

  return (
    <div className="bg-white max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-4">
        <Link href="/">
          <button className="text-2xl">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <img alt={image.title} className="w-full max-h-[80vh] object-contain" src={image.url} />
        </div>
        <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <LikeButton imageId={image._id} /> {/* Nút Like bên trái */}
          <a className="text-sm text-gray-500" href={image.link}>
            {image.link}
          </a>
          <ReportButton imageTitle={image.title} imageId={image.url} reportedUserId={image.userId._id} reporterUserId={userId} /> {/* Nút Report bên phải */}
        </div>
          <h1 className="text-2xl font-bold mb-2">{image.title}</h1>
           {/* Thông tin user + Nút Theo dõi */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img alt="User avatar" className="w-10 h-10 rounded-full mr-2" src={image.userId.avatar} />
              <span className="text-gray-700">{image.userId.username}</span>
            </div>
            <FollowButton userId={image.userId._id} />
          </div>
          <p className="text-gray-500 mb-4">{image.description}</p>

          {/* Nút chia sẻ (Client Component) */}
          <ShareButton imageUrl={image.url} />

          {/* Bình luận */}
          <CommentSection imageId={image._id} />
        </div>
      </div>
    </div>
  );
}
