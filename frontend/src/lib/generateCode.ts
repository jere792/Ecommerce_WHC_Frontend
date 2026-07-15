import { supabase } from './supabaseClient';

export async function generarCodigoTransaccion(prefijo: string): Promise<string> {
  const now = new Date();
  const anioMes = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const pattern = `${prefijo}-${anioMes}-%`;

  const { data } = await supabase
    .from('pedido')
    .select('codigo_transaccion')
    .ilike('codigo_transaccion', pattern)
    .order('codigo_transaccion', { ascending: false })
    .limit(1);

  let correlativo = 1;
  if (data && data.length > 0) {
    const last = data[0].codigo_transaccion;
    const parts = last.split('-');
    correlativo = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefijo}-${anioMes}-${String(correlativo).padStart(5, '0')}`;
}
