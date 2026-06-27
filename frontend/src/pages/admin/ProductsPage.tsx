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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Productos</h1>
        <Link
          to="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Nuevo producto
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Imagen</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Precio venta</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Precio compra</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Ganancia</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Categoria</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((p) => (
              <tr key={p.id_producto} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3">
                  {p.imagen_producto ? (
                    <img src={p.imagen_producto} alt="" className="h-10 w-10 object-cover rounded border dark:border-gray-600" />
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600 text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{p.nombre_producto}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">S/{Number(p.precio_producto).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.precio_compra ? `S/${Number(p.precio_compra).toFixed(2)}` : '-'}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                  {p.precio_compra ? `S/${(p.precio_producto - p.precio_compra).toFixed(2)}` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.stock_producto}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.categoria?.nombre_categoria_producto}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{p.estado?.nombre_estado_producto}</td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/productos/editar/${p.slug}`)}
                    className="text-blue-600 hover:text-blue-800"
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
