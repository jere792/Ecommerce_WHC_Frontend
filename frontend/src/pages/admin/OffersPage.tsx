import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Oferta, Producto } from '../../lib/supabaseTypes';
import { useAlert } from '../../components/ui/AlertModal';

export default function AdminOffers() {
  const [offers, setOffers] = useState<(Oferta & { producto?: Producto })[]>([]);
  const [loading, setLoading] = useState(true);
  const { alert, modal } = useAlert();
  const [editingOffer, setEditingOffer] = useState<Oferta | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<Producto[]>([]);

  const [formProducto, setFormProducto] = useState<number>(0);
  const [formPrecio, setFormPrecio] = useState('');
  const [formInicio, setFormInicio] = useState('');
  const [formFin, setFormFin] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: offerData } = await supabase
      .from('oferta')
      .select('*, producto:pk_producto(*)')
      .order('id_oferta', { ascending: false });
    if (offerData) setOffers(offerData as unknown as (Oferta & { producto?: Producto })[]);

    const { data: productData } = await supabase.from('producto').select('*').order('nombre_producto');
    if (productData) setProducts(productData as Producto[]);

    setLoading(false);
  };

  const resetForm = () => {
    setFormProducto(0);
    setFormPrecio('');
    setFormInicio('');
    setFormFin('');
    setEditingOffer(null);
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (offer: Oferta) => {
    setEditingOffer(offer);
    setFormProducto(offer.pk_producto);
    setFormPrecio(String(offer.precio_oferta));
    setFormInicio(offer.fecha_inicio);
    setFormFin(offer.fecha_fin);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      pk_producto: formProducto,
      precio_oferta: parseFloat(formPrecio),
      fecha_inicio: formInicio,
      fecha_fin: formFin,
    };

    if (editingOffer) {
      await supabase.from('oferta').update(data).eq('id_oferta', editingOffer.id_oferta);
    } else {
      await supabase.from('oferta').insert(data);
    }

    setShowForm(false);
    resetForm();
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar esta oferta?')) return;
    await supabase.from('oferta').delete().eq('id_oferta', id);
    loadData();
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;

  return (
    <div>
      {modal}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Ofertas</h1>
        <button onClick={openNew} className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary-700">Nueva oferta</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-background rounded-lg shadow p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{editingOffer ? 'Editar' : 'Nueva'} oferta</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Producto</label>
              <select value={formProducto} onChange={e => setFormProducto(Number(e.target.value))} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" required>
                <option value={0}>Seleccionar producto</option>
                {products.map(p => (
                  <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Precio oferta</label>
              <input type="number" step="0.01" value={formPrecio} onChange={e => setFormPrecio(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha inicio</label>
              <input type="date" value={formInicio} onChange={e => setFormInicio(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha fin</label>
              <input type="date" value={formFin} onChange={e => setFormFin(e.target.value)} className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" required />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-muted text-foreground px-4 py-2 rounded hover:bg-muted/80">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-background rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Precio oferta</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Inicio</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Fin</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {offers.map((o) => (
              <tr key={o.id_oferta} className="hover:bg-muted">
                <td className="px-4 py-3 text-sm text-foreground">{o.id_oferta}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{o.producto?.nombre_producto}</td>
                <td className="px-4 py-3 text-sm text-foreground">S/{Number(o.precio_oferta).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-foreground">{o.fecha_inicio}</td>
                <td className="px-4 py-3 text-sm text-foreground">{o.fecha_fin}</td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <button onClick={() => openEdit(o)} className="text-primary hover:text-primary-800">Editar</button>
                  <button onClick={() => handleDelete(o.id_oferta)} className="text-destructive hover:text-destructive/80">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
