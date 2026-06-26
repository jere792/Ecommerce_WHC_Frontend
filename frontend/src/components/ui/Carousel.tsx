import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import type { HeroSlide } from "../../lib/supabaseTypes";
import { CarouselSkeleton } from "./Skeleton";

export function Carousel() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  if (loading) return <CarouselSkeleton />;

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
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
              <div className="absolute bottom-10 left-10 bg-white/10 backdrop-blur-md text-white px-8 py-3 rounded-lg shadow-xl text-xl font-semibold border border-white/20">
                {slide.texto}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 hover:bg-black text-gray-200 shadow"
      >
        <ChevronLeft className="w-8 h-10" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 hover:bg-black text-gray-200 shadow"
      >
        <ChevronRight className="w-8 h-10" />
      </button>

      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 rounded-full ${
              index === current ? "bg-blue-600" : "bg-gray-600"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-2 bg-[#000000]" />
    </div>
  );
}
