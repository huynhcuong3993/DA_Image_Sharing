"use client";

import { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareAlt } from "@fortawesome/free-solid-svg-icons";

interface ShareButtonProps {
  imageUrl: string;
}

export default function ShareButton({ imageUrl }: ShareButtonProps) {
  const shareOnFacebook = useCallback(() => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  }, [imageUrl]);

  return (
    <button
      onClick={shareOnFacebook}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
    >
      <FontAwesomeIcon icon={faShareAlt} className="mr-2" />
      Chia sẻ Facebook
    </button>
  );
}
