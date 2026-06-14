import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Formulario, Usuario } from '../../lib/supabaseTypes';

export default function AdminFormDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Formulario | null>(null);
  const [admins, setAdmins] = useState<Usuario[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const { data: formData } = await supabase
      .from('formulario')
      .select('*, tipo:pk_tipo_formulario(*), estado:pk_estado_formulario(*)')
      .eq('id_formulario', id)
      .single();
    if (formData) setForm(formData as unknown as Formulario);

    const { data: adminData } = await supabase
      .from('usuarios')
      .select('*, rol:pk_rol_usuario(*)')
      .eq('pk_rol_usuario', 1);
    if (adminData) setAdmins(adminData as unknown as Usuario[]);

    setLoading(false);
  };

  const handleAttend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) {
      alert('Selecciona un administrador');
      return;
    }

    const estadoForm = await supabase
      .from('estado_form')
      .select('id_estado_form')
      .eq('nombre_estado', 'ATENDIDO')
      .single();

    await supabase.from('formulario').update({
      pk_estado_formulario: estadoForm.data?.id_estado_form || 2,
      user_atencion: selectedAdmin,
      text_estado: comment,
    }).eq('id_formulario', id);

    navigate('/admin/formularios');
  };

  if (loading) return <div>Cargando...</div>;
  if (!form) return <div>Formulario no encontrado</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/admin/formularios" className="text-blue-600 hover:underline mb-4 block">&larr; Volver</Link>
      <h1 className="text-2xl font-bold mb-6">Atender formulario</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6 space-y-3">
        <div><span className="font-medium">Nombre:</span> {form.nombre_formulario}</div>
        <div><span className="font-medium">DNI:</span> {form.dni_formulario}</div>
        <div><span className="font-medium">Email:</span> {form.correo_formulario}</div>
        <div><span className="font-medium">Teléfono:</span> {form.telefono_formulario}</div>
        <div><span className="font-medium">Tipo:</span> {form.tipo?.nombre_tipo}</div>
        <div><span className="font-medium">Estado:</span> {form.estado?.nombre_estado}</div>
        <div><span className="font-medium">Fecha:</span> {form.fecha_formulario ? new Date(form.fecha_formulario).toLocaleString() : '-'}</div>
        <div><span className="font-medium">Mensaje:</span> {form.text_estado}</div>
      </div>

      <form onSubmit={handleAttend} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold">Atender formulario</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asignar a</label>
          <select
            value={selectedAdmin}
            onChange={e => setSelectedAdmin(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value={0}>Seleccionar administrador</option>
            {admins.map(a => (
              <option key={a.id_usuario} value={a.id_usuario}>{a.nombre_persona}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Marcar como atendido
        </button>
      </form>
    </div>
  );
}
