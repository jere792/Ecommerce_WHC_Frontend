import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from './supabaseClient';
import type { Pedido } from './supabaseTypes';

// Paleta alineada con tu theme (index.css)
const COLORS = {
  primary: [13, 60, 107] as [number, number, number],        // #0D3C6B
  primaryLight: [239, 244, 249] as [number, number, number], // #EFF4F9
  secondary: [35, 56, 118] as [number, number, number],       // #233876
  accent: [44, 201, 156] as [number, number, number],         // #2CC99C
  textGray: [100, 116, 139] as [number, number, number],      // muted-foreground
  border: [226, 232, 240] as [number, number, number],        // --border
  lightGray: [245, 247, 250] as [number, number, number],
};

interface DetallePedido {
  pk_producto_pedido: number;
  cantidad_pedido: number;
  producto?: {
    nombre_producto?: string;
    precio_producto?: number;
  };
}

interface EmpresaConfig {
  nombre_empresa?: string;
  url_logo?: string;
  correo_empresa?: string;
  telefono_empresa?: string;
  whatsapp_empresa?: string;
  direccion_empresa?: string;
}

async function loadImageAsDataURL(url: string): Promise<{ dataUrl: string; ratio: number } | null> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const ratio: number = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
      img.onerror = reject;
      img.src = dataUrl;
    });

    return { dataUrl, ratio };
  } catch {
    return null;
  }
}

export async function generateCotizacion(venta: Pedido): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 18;
  let y = 16;

  const { data: config } = await supabase
    .from('configuracion_tienda')
    .select('*')
    .eq('id', 1)
    .single();
  const empresa = (config as EmpresaConfig) || {};

  // ─────────────────────────────
  // HEADER
  // ─────────────────────────────
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pw, 38, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 38, pw, 1.2, 'F');

  let logoX = m;
  const logoY = 8;
  const logoH = 20;

  if (empresa.url_logo) {
    const logo = await loadImageAsDataURL(empresa.url_logo);
    if (logo) {
      const logoW = logoH * logo.ratio;
      doc.addImage(logo.dataUrl, 'PNG', m, logoY, logoW, logoH);
      logoX = m + logoW + 6;
    }
  }

  // Ancho reservado para el bloque derecho (título + N° + fecha)
  const rightBlockWidth = 62;
  const maxLeftWidth = pw - logoX - rightBlockWidth - 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(empresa.nombre_empresa || 'Mi Empresa', logoX, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(220, 230, 245);

  let lineY = 20;

  // Dirección (si existe)
  if (empresa.direccion_empresa) {
    const dirLines = doc.splitTextToSize(empresa.direccion_empresa, maxLeftWidth);
    doc.text(dirLines, logoX, lineY);
    lineY += dirLines.length * 3.6;
  }

  // Línea 1: Teléfono + WhatsApp
  const telWsp: string[] = [];
  if (empresa.telefono_empresa) telWsp.push(`Tel: ${empresa.telefono_empresa}`);
  if (empresa.whatsapp_empresa) telWsp.push(`WhatsApp: ${empresa.whatsapp_empresa}`);

  if (telWsp.length) {
    const telWspLines = doc.splitTextToSize(telWsp.join('  |  '), maxLeftWidth);
    doc.text(telWspLines, logoX, lineY);
    lineY += telWspLines.length * 3.6;
  }

  // Línea 2: Correo (debajo, en su propia línea)
  if (empresa.correo_empresa) {
    const correoLines = doc.splitTextToSize(empresa.correo_empresa, maxLeftWidth);
    doc.text(correoLines, logoX, lineY);
  }

  // ── Bloque derecho: título, N° y fecha ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text('COTIZACIÓN', pw - m, 13, { align: 'right' });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${String(venta.id_pedido).padStart(8, '0')}`, pw - m, 22, { align: 'right' });

  const fechaEmision = new Date(venta.fecha).toLocaleDateString('es-PE', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.text(fechaEmision, pw - m, 28, { align: 'right' });

  y = 50;

  // ─────────────────────────────
  // CLIENTE + VALIDEZ (dos columnas)
  // ─────────────────────────────
  const boxW = (pw - 2 * m - 6) / 2;

  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(m, y, boxW, 26, 2, 2, 'F');
  doc.roundedRect(m + boxW + 6, y, boxW, 26, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.primary);
  doc.text('CLIENTE', m + 4, y + 6);
  doc.text('DETALLES', m + boxW + 10, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  doc.text(`Nombre: ${venta.nombre || '—'}`, m + 4, y + 13);
  doc.text(`Teléfono: ${venta.telefono || '—'}`, m + 4, y + 19);

  doc.text(`Fecha emisión: ${fechaEmision}`, m + boxW + 10, y + 13);
  const validez = new Date(venta.fecha);
  validez.setDate(validez.getDate() + 7);
  doc.text(
    `Válido hasta: ${validez.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' })}`,
    m + boxW + 10, y + 19
  );

  y += 34;

  // ─────────────────────────────
  // TABLA DE PRODUCTOS (autoTable)
  // ─────────────────────────────
  const detalles: DetallePedido[] = (venta as any).detalles || [];

  const rows = detalles.map((d) => {
    const nombre = d.producto?.nombre_producto || `Producto #${d.pk_producto_pedido}`;
    const cantidad = d.cantidad_pedido || 0;
    const precio = Number(d.producto?.precio_producto || 0);
    const subtotal = cantidad * precio;
    return [nombre, String(cantidad), `S/ ${precio.toFixed(2)}`, `S/ ${subtotal.toFixed(2)}`];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: m, right: m },
    head: [['Producto', 'Cant.', 'Precio unit.', 'Subtotal']],
    body: rows,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 9.5,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
      textColor: [30, 30, 30],
      lineColor: COLORS.border,
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 32 },
    },
    alternateRowStyles: { fillColor: COLORS.lightGray },
    didParseCell: (data) => {
      if (data.section === 'body') {
        data.cell.styles.lineWidth = { bottom: 0.1 };
        data.cell.styles.lineColor = COLORS.border;
      }
    },
  });

  // @ts-expect-error - lastAutoTable se agrega en runtime por el plugin
  y = doc.lastAutoTable.finalY + 8;

  // ─────────────────────────────
  // TOTAL
  // ─────────────────────────────
  if (y > ph - 60) {
    doc.addPage();
    y = 20;
  }

  const totalBoxW = 60;
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(pw - m - totalBoxW, y, totalBoxW, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', pw - m - totalBoxW + 5, y + 9);

  doc.setFontSize(13);
  doc.text(`S/ ${Number(venta.monto_total).toFixed(2)}`, pw - m - 4, y + 9, { align: 'right' });

  y += 24;

  // ─────────────────────────────
  // NOTAS
  // ─────────────────────────────
  if (y < ph - 40) {
    doc.setDrawColor(...COLORS.border);
    doc.line(m, y, pw - m, y);
    y += 6;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textGray);
    doc.text('• Esta cotización es válida por 7 días a partir de su emisión.', m, y);
    y += 4.5;
    doc.text('• Los precios incluyen IGV. Sujeto a disponibilidad de stock.', m, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.accent);
    doc.text('¡Gracias por su preferencia!', m, y);
  }

  // ─────────────────────────────
  // FOOTER (todas las páginas)
  // ─────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, ph - 10, pw, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `${empresa.nombre_empresa || 'Mi Empresa'}  •  Página ${i} de ${pageCount}`,
      pw / 2, ph - 4, { align: 'center' }
    );
  }

  doc.save(`COTIZACION-${String(venta.id_pedido).padStart(8, '0')}.pdf`);
}