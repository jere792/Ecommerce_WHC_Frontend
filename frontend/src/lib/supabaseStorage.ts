import { supabase } from './supabaseClient';

export async function uploadPdf(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'pdf';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('fichas-tecnicas')
    .upload(fileName, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) throw new Error(`Error al subir PDF: ${error.message}`);

  const { data: publicUrl } = supabase.storage
    .from('fichas-tecnicas')
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}
