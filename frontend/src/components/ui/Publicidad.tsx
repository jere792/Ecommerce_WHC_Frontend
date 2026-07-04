import React from 'react';
import { ShoppingCart, Truck, Shield, Sparkles } from 'lucide-react';

interface PublicidadProps {
  textoPromocional: string;
  subtitulo?: string;
  tipo?: 'default' | 'welcome' | 'delivery';
}

const iconos = {
  default: ShoppingCart,
  welcome: Sparkles,
  delivery: Truck,
};

export const Publicidad: React.FC<PublicidadProps> = ({
  textoPromocional,
  subtitulo,
  tipo = 'default',
}) => {
  const Icon = iconos[tipo];

  return (
    <div className="w-full bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
            radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-[-20deg] translate-x-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-full bg-white/5 skew-x-[-20deg] -translate-x-24 pointer-events-none" />

      <div className="container mx-auto px-4 py-5 sm:py-6 relative flex items-center justify-center gap-3 sm:gap-5">
        <div className="hidden sm:flex items-center justify-center w-14 h-14 bg-white/15 backdrop-blur-sm flex-shrink-0 border border-white/10">
          <Icon className="w-7 h-7" />
        </div>

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          {subtitulo && (
            <span className="text-xs sm:text-sm font-medium text-white/70 tracking-widest uppercase mb-0.5">
              {subtitulo}
            </span>
          )}
          <p className="font-bold text-sm sm:text-xl md:text-2xl tracking-tight">
            {textoPromocional}
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5">
            <Shield className="w-3.5 h-3.5 text-white/80" />
            <span className="text-xs font-medium text-white/80">Compra Segura</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5">
            <Truck className="w-3.5 h-3.5 text-white/80" />
            <span className="text-xs font-medium text-white/80">Envíos Rápidos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
