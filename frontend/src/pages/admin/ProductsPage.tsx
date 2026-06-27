import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Producto } from '../../lib/supabaseTypes';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('producto')
      .select('*, categoria:pk_categoria_producto(*), marca:pk_marca_producto(*), estado:pk_estado_producto(*)')
      .order('id_producto', { ascending: false });
    if (data) setProducts(data as unknown as Producto[]);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este producto?')) return;
    await supabase.from('producto').delete().eq('id_producto', id);
    loadProducts();
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Productos</h1>
        <Link
          to="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" /> Nuevo producto
        </Link>
      </div>
      <div className="bg-background rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Imagen</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Precio venta</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Precio compra</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Ganancia</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Categoria</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id_producto} className="hover:bg-muted">
                <td className="px-4 py-3 text-sm text-foreground">{p.id_producto}</td>
                <td className="px-4 py-3">
                  {p.imagen_producto ? (
                    <img src={p.imagen_producto} alt="" className="h-10 w-10 object-cover rounded border border-border" />
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{p.nombre_producto}</td>
                <td className="px-4 py-3 text-sm text-foreground">S/{Number(p.precio_producto).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-foreground">{p.precio_compra ? `S/${Number(p.precio_compra).toFixed(2)}` : '-'}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                  {p.precio_compra ? `S/${(p.precio_producto - p.precio_compra).toFixed(2)}` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{p.stock_producto}</td>
                <td className="px-4 py-3 text-sm text-foreground">{p.categoria?.nombre_categoria_producto}</td>
                <td className="px-4 py-3 text-sm text-foreground">{p.estado?.nombre_estado_producto}</td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/productos/editar/${p.slug}`)}
                    className="text-primary hover:text-primary-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id_producto)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
