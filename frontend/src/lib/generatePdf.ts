import jsPDF from 'jspdf';
import type { Pedido } from './supabaseTypes';

export function generateCotizacion(venta: Pedido) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const yStart = 30;
  let y = yStart;

  const bold = (text: string, size = 10) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(size); return text; };
  const normal = (text: string, size = 10) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(size); return text; };

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('COTIZACIÓN', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`N° ${venta.id_pedido}`, margin, y);
  doc.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, pageWidth - margin, y, { align: 'right' });
  y += 12;

  // Separator
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Client info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Cliente', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${venta.nombre || '—'}`, margin, y);
  y += 5;
  doc.text(`Teléfono: ${venta.telefono || '—'}`, margin, y);
  y += 10;

  // Separator
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Table header
  const cols = [
    { label: 'Producto', x: margin, align: 'left' as const },
    { label: 'Cant.', x: 120, align: 'center' as const },
    { label: 'Precio', x: 145, align: 'right' as const },
    { label: 'Subtotal', x: 175, align: 'right' as const },
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 4, pageWidth - 2 * margin, 7, 'F');
  cols.forEach(c => doc.text(c.label, c.x, y, { align: c.align }));
  y += 8;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const detalles = (venta as any).detalles || [];
  for (const d of detalles) {
    const prodName = d.producto?.nombre_producto || `Producto #${d.pk_producto_pedido}`;
    const qty = d.cantidad_pedido || 0;
    const price = Number(d.producto?.precio_producto || 0);
    const subtotal = qty * price;

    doc.text(prodName, margin, y);
    doc.text(String(qty), 120, y, { align: 'center' });
    doc.text(`S/${price.toFixed(2)}`, 145, y, { align: 'right' });
    doc.text(`S/${subtotal.toFixed(2)}`, 175, y, { align: 'right' });
    y += 6;

    if (y > 270) {
      doc.addPage();
      y = 30;
    }
  }

  // Total
  y += 4;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', 148, y, { align: 'right' });
  doc.text(`S/${Number(venta.monto_total).toFixed(2)}`, 175, y, { align: 'right' });

  // Footer
  y = 275;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Esta cotización es válida por 7 días.', margin, y);
  doc.text('Gracias por su preferencia.', margin, y + 4);

  doc.save(`cotizacion_${venta.id_pedido}.pdf`);
}
