import { useEffect, useState } from 'react';
import { Carousel } from "../../components/ui/Carousel";
import ProductCarousel from "../../components/Home/ProductCarousel";
import OfertaCarousel from "../../components/Home/OfertaCarousel";
import NewProductsCarousel from "../../components/Home/NewProductsCarousel";
import Marcas from '../../components/ui/Marcas';
import Text from "../../components/ui/text";
import { supabase } from '../../lib/supabaseClient';
import type { CategoriaProducto } from '../../lib/supabaseTypes';

function HomePage() {
  const [homeCategories, setHomeCategories] = useState<CategoriaProducto[]>([]);

  useEffect(() => {
    supabase
      .from('categoria_productos')
      .select('*')
      .eq('mostrar_en_home', true)
      .order('id_categoria_producto', { ascending: true })
      .then(({ data }) => {
        if (data) setHomeCategories(data as CategoriaProducto[]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Carousel />
      <Text
        title="OFERTAS PRINCIPALES DE LA SEMANA"
        subtitle="Aprovecha los descuentos y promociones especiales en nuestros productos destacados"
      />
      <OfertaCarousel />
      <NewProductsCarousel />
      {homeCategories.map((cat) => (
        <ProductCarousel
          key={cat.id_categoria_producto}
          pkCategoria={cat.id_categoria_producto}
          titulo={cat.nombre_categoria_producto.toUpperCase()}
          subtitulo={cat.subtitulo_home || undefined}
        />
      ))}
      <Marcas />
    </div>
  );
}

export default HomePage;
