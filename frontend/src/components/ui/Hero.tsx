import { useState, useEffect } from "react";
import { HeroSkeleton } from "./Skeleton";

const images = [
  { src: "/assets/Ruleta4.webp", alt: "comunidad y elegancia" },
];

export function Hero() {
  const [currentImage, setCurrentImage] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const randomImage = Math.floor(Math.random() * images.length);
    setCurrentImage(randomImage);
    setImgLoaded(false);
    setImgError(false);
  }, []);

  if (imgError) {
    return (
      <div className="relative w-full max-full mx-auto overflow-hidden shadow-xl bg-blue-900 md:h-[140px] h-[100px] flex items-center justify-center">
        <span className="text-white/50 text-sm">Imagen no disponible</span>
        <div className="absolute bottom-0 left-0 w-full h-4 bg-primary" />
      </div>
    );
  }

  return (
    <div className="relative w-full max-full mx-auto overflow-hidden shadow-xl">
      {!imgLoaded ? (
        <HeroSkeleton />
      ) : (
        <>
          <img
            src={images[currentImage].src}
            alt={images[currentImage].alt}
            className="w-full md:h-[140px] object-cover transition-all duration-500"
          />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-4 bg-primary" />
        </>
      )}
    </div>
  );
}
