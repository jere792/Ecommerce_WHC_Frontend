import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [nearBottom, setNearBottom] = useState(false);

  const handleScroll = () => {
    const scrolled = document.documentElement.scrollTop;
    const scrollBottom = window.innerHeight + scrolled;
    const docHeight = document.documentElement.scrollHeight;
    setIsVisible(scrolled > 300);
    setNearBottom(scrollBottom >= docHeight - 100);
  };

  // Función para hacer scroll hacia arriba
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {isVisible && !nearBottom && (
        <div
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 bg-white text-dark rounded-full shadow-lg z-50 cursor-pointer
                     w-12 h-12 flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
          aria-label="Volver al inicio"
        >
          <ArrowUp className="h-8 w-8" />
        </div>
      )}
    </>
  );
};

export default ScrollToTopButton;
