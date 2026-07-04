import { useParams } from "react-router-dom";
import Marcas from '../../components/ui/Marcas';
import ProductDetail from '../../components/ui/ProductDetail';

export function DetalleProducto() {
  const { slug } = useParams();
  return (
    <div>
      <div className="container mx-auto py-10 px-4">
        {slug && <ProductDetail slug={slug} />}
      </div>
      <Marcas />
    </div>
  );
}