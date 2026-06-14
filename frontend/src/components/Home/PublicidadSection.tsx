import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { BannerPublicidad } from '../../lib/supabaseTypes';

export const ImagenPrincipalConSecundarias: React.FC = () => {
  const [banner, setBanner] = useState<BannerPublicidad | null>(null);
  const blueLineColor = '#0d3c6b';

  useEffect(() => {
    supabase
      .from('banner_publicidad')
      .select('*')
      .eq('activo', true)
      .order('id_banner', { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setBanner(data[0] as BannerPublicidad);
      });
  }, []);

  if (!banner) return null;

  const principalWords = banner.titulo.split(' ');
  const underlinedText = principalWords.slice(-2).join(' ');
  const beforeUnderline = principalWords.slice(0, -2).join(' ');

  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto px-2 text-center">
        <h2 className="text-xl md:text-3xl font-bold text-gray-800 uppercase">
          {beforeUnderline}{' '}
          <span
            className="underline"
            style={{ textDecorationColor: blueLineColor }}
          >
            {underlinedText}
          </span>
        </h2>
        <div className="h-0.5 w-36 mx-auto mt-1 mb-7"></div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-stretch">
          <a
            href={banner.enlace_principal || undefined}
            target={banner.enlace_principal ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="md:w-1/2 group transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl rounded-md shadow-lg overflow-hidden bg-white cursor-pointer block"
          >
            <img
              src={banner.imagen_principal}
              alt={banner.titulo}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ aspectRatio: '782 / 759' }}
            />
          </a>

          <div className="md:w-1/2 flex flex-col gap-6 md:gap-10">
            <a
              href={banner.enlace_secundario_top || undefined}
              target={banner.enlace_secundario_top ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="rounded-md shadow-lg overflow-hidden bg-white group cursor-pointer transition-transform duration-300 hover:translate-x-2 hover:-translate-y-1 hover:shadow-2xl block"
            >
              <img
                src={banner.imagen_secundaria_top}
                alt={`${banner.titulo} - secundario top`}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ aspectRatio: '821 / 372' }}
              />
            </a>
            <a
              href={banner.enlace_secundario_bottom || undefined}
              target={banner.enlace_secundario_bottom ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="rounded-md shadow-lg overflow-hidden bg-white group cursor-pointer transition-transform duration-300 hover:-translate-x-2 hover:translate-y-1 hover:shadow-2xl block"
            >
              <img
                src={banner.imagen_secundaria_bottom}
                alt={`${banner.titulo} - secundario bottom`}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ aspectRatio: '821 / 372' }}
              />
            </a>
          </div>
        </div>

        <div className="h-0.5 w-48 mx-auto mt-8" style={{ backgroundColor: blueLineColor }}></div>
      </div>
    </section>
  );
};
