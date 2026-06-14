import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { PageHero } from '../../lib/supabaseTypes';

interface Props {
  pagina: string;
}

export default function PageHeroBanner({ pagina }: Props) {
  const [hero, setHero] = useState<PageHero | null>(null);

  useEffect(() => {
    supabase
      .from('page_hero')
      .select('*')
      .eq('pagina', pagina)
      .single()
      .then(({ data }) => {
        if (data) setHero(data as PageHero);
      });
  }, [pagina]);

  if (!hero) return null;

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
      {hero.imagen_url && (
        <img
          src={hero.imagen_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      )}
      <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">{hero.titulo}</h1>
        {hero.subtitulo && (
          <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto">{hero.subtitulo}</p>
        )}
      </div>
    </section>
  );
}
