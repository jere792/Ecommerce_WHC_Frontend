import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import type { HeroSlide } from "../../lib/supabaseTypes";
import { CarouselSkeleton } from "./Skeleton";

export function Carousel() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    supabase
      .from('hero_slide')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setSlides(data as HeroSlide[]);
        setLoading(false);
      });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const handleNext = () => {
    nextSlide();
    setResetKey((k) => k + 1);
  };

  const handlePrev = () => {
    prevSlide();
    setResetKey((k) => k + 1);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, [nextSlide, resetKey]);

  if (loading) return <CarouselSkeleton />;

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-[280px] sm:h-[420px] md:h-[550px] lg:h-[650px] overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id_hero_slide} className="w-full flex-shrink-0 relative h-full">
            <img
              src={slide.image_url}
              alt={`Slide ${index}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/100 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/100 to-transparent"></div>
            {slide.texto && (
              <div className="absolute bottom-4 sm:bottom-7 md:bottom-10 left-4 sm:left-7 md:left-10 bg-white/10 backdrop-blur-md text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 shadow-xl text-sm sm:text-lg md:text-xl font-semibold border border-white/20 max-w-[85%]">
                {slide.texto}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 ${
              index === current ? "bg-blue-600" : "bg-gray-600"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-2 bg-[#000000]" />
    </div>
  );
}
