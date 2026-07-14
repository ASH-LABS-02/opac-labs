import jsPDF from 'jspdf';

interface InvoiceItem { name: string; quantity: number; price: number; }
interface InvoiceData {
    orderId: string; date: string; status: string;
    items: InvoiceItem[]; total: number;
    userName?: string; userEmail?: string;
}

// Portal theme: white, #111 text, #e5e5e5 borders, minimal
const C = {
    black:   [17, 17, 17]     as [number, number, number],
    gray:    [100, 100, 100]  as [number, number, number],
    light:   [245, 245, 245]  as [number, number, number],
    border:  [229, 229, 229]  as [number, number, number],
    white:   [255, 255, 255]  as [number, number, number],
    success: [16, 185, 129]   as [number, number, number],
    warning: [245, 158, 11]   as [number, number, number],
    danger:  [239, 68, 68]    as [number, number, number],
};

function statusColor(s: string): [number, number, number] {
    if (s === 'Delivered') return C.success;
    if (s === 'Cancelled') return C.danger;
    return C.warning;
}

export function generateInvoicePDF(invoice: InvoiceData): jsPDF {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // White background
    doc.setFillColor(...C.white);
    doc.rect(0, 0, W, H, 'F');

    // ── Top black bar ─────────────────────────────────────────────────────────
    doc.setFillColor(...C.black);
    doc.rect(0, 0, W, 72, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...C.white);
    doc.text('OPAC LABS', 48, 44);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('Electronics for Students', 48, 58);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...C.white);
    doc.text('INVOICE', W - 48, 48, { align: 'right' });

    // ── Meta row ──────────────────────────────────────────────────────────────
    const metaY = 96;
    const colW = (W - 96) / 3;

    [
        { label: 'ORDER', value: `#${invoice.orderId.slice(0, 8).toUpperCase()}` },
        { label: 'DATE', value: invoice.date },
        { label: 'STATUS', value: invoice.status, isStatus: true },
    ].forEach((item, i) => {
        const x = 48 + i * colW;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...C.gray);
        doc.text(item.label, x, metaY);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...(item.isStatus ? statusColor(item.value) : C.black));
        doc.text(item.value, x, metaY + 18);
    });

    // Divider
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.75);
    doc.line(48, metaY + 30, W - 48, metaY + 30);

    // ── Bill To ───────────────────────────────────────────────────────────────
    let y = metaY + 50;
    if (invoice.userName || invoice.userEmail) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...C.gray);
        doc.text('BILL TO', 48, y);
        y += 16;

        if (invoice.userName) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(...C.black);
            doc.text(invoice.userName, 48, y);
            y += 16;
        }
        if (invoice.userEmail) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...C.gray);
            doc.text(invoice.userEmail, 48, y);
            y += 12;
        }
        y += 12;
    }

    // ── Table header ──────────────────────────────────────────────────────────
    const tableTop = y + 8;
    const colX = { item: 48, qty: 340, unit: 420, total: W - 48 };

    doc.setFillColor(...C.light);
    doc.rect(48, tableTop, W - 96, 28, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.5);
    doc.rect(48, tableTop, W - 96, 28, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.gray);
    doc.text('ITEM', colX.item + 12, tableTop + 18);
    doc.text('QTY', colX.qty, tableTop + 18, { align: 'center' });
    doc.text('UNIT PRICE', colX.unit + 10, tableTop + 18);
    doc.text('TOTAL', colX.total, tableTop + 18, { align: 'right' });

    // ── Table rows ────────────────────────────────────────────────────────────
    y = tableTop + 28;
    invoice.items.forEach((item, idx) => {
        const rowH = 38;
        if (idx % 2 !== 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(48, y, W - 96, rowH, 'F');
        }
        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.4);
        doc.line(48, y + rowH, W - 48, y + rowH);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...C.black);
        doc.text(item.name, colX.item + 12, y + 24);

        doc.setTextColor(...C.gray);
        doc.text(String(item.quantity), colX.qty, y + 24, { align: 'center' });
        doc.text(`Rs. ${item.price.toFixed(2)}`, colX.unit + 10, y + 24);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.black);
        doc.text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, colX.total, y + 24, { align: 'right' });

        y += rowH;
    });

    // ── Total ─────────────────────────────────────────────────────────────────
    y += 20;
    const totalW = 220;
    const totalX = W - 48 - totalW;

    doc.setFillColor(...C.black);
    doc.rect(totalX, y, totalW, 48, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('TOTAL AMOUNT', totalX + 16, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...C.white);
    doc.text(`Rs. ${invoice.total.toFixed(2)}`, W - 64, y + 36, { align: 'right' });

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.setFillColor(...C.light);
    doc.rect(0, H - 48, W, 48, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.5);
    doc.line(0, H - 48, W, H - 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.gray);
    doc.text('Thank you for your order!', W / 2, H - 28, { align: 'center' });
    doc.text('opac-labs.com  ·  support@opac-labs.com', W / 2, H - 14, { align: 'center' });

    return doc;
}

export function downloadInvoice(invoice: InvoiceData) {
    const doc = generateInvoicePDF(invoice);
    doc.save(`invoice-${invoice.orderId.slice(0, 8).toUpperCase()}.pdf`);
}

export function getInvoiceDataURL(invoice: InvoiceData): string {
    const doc = generateInvoicePDF(invoice);
    return doc.output('datauristring');
}
