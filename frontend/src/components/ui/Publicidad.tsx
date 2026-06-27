import React from 'react';
import { ShoppingCart } from 'lucide-react'; // Asegúrate de tener instalada la librería lucide-react

interface PublicidadProps {
  textoPromocional: string;
}

export const Publicidad: React.FC<PublicidadProps> = ({ textoPromocional }) => {
  return (
    <div className="w-full py-4 flex items-center justify-center bg-primary text-white">
      <ShoppingCart className="w-14 h-19 mr-5 mx-8" />
      <div className="h-12 border border-white mx-1"></div>
      <p className="font-semibold text-lg mx-2">{textoPromocional}</p>
    </div>
  );
};