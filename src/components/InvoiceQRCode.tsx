import { useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface InvoiceQRCodeProps {
  invoiceId: string;
  size?: number;
  invoiceNumber?: string;
  customerName?: string;
  amount?: number;
  showActions?: boolean;
}

export function InvoiceQRCode({
  invoiceId,
  size = 128,
  invoiceNumber,
  customerName,
  amount,
  showActions = false,
}: InvoiceQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const payUrl = `${window.location.origin}/pay/${invoiceId}`;

  const svgToCanvas = useCallback((): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const svg = qrRef.current?.querySelector("svg");
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const padding = 40;
      canvas.width = size + padding * 2;
      canvas.height = size + padding * 2 + (invoiceNumber ? 80 : 0);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, padding, padding, size, size);
        // Add text below QR
        if (invoiceNumber) {
          ctx.fillStyle = "#000000";
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(invoiceNumber, canvas.width / 2, size + padding + 24);
          if (customerName && amount !== undefined) {
            ctx.font = "12px sans-serif";
            ctx.fillStyle = "#666666";
            ctx.fillText(`${customerName} — $${amount.toFixed(2)}`, canvas.width / 2, size + padding + 44);
          }
          ctx.font = "11px sans-serif";
          ctx.fillStyle = "#999999";
          ctx.fillText("Scan to pay", canvas.width / 2, size + padding + 64);
        }
        resolve(canvas);
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    });
  }, [size, invoiceNumber, customerName, amount]);

  const handleDownload = useCallback(async () => {
    const canvas = await svgToCanvas();
    const link = document.createElement("a");
    link.download = `${invoiceNumber || "invoice"}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [svgToCanvas, invoiceNumber]);

  const handlePrint = useCallback(async () => {
    const canvas = await svgToCanvas();
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Print QR - ${invoiceNumber || "Invoice"}</title>
      <style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;}</style>
      </head><body><img src="${canvas.toDataURL("image/png")}" /></body></html>
    `);
    win.document.close();
    win.onload = () => { win.print(); win.close(); };
  }, [svgToCanvas, invoiceNumber]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={qrRef} className="rounded-lg border bg-white p-3">
        <QRCodeSVG value={payUrl} size={size} level="M" />
      </div>
      <p className="text-xs text-muted-foreground text-center max-w-[180px] break-all">
        Scan to view &amp; pay this invoice
      </p>
      {showActions && (
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </div>
      )}
    </div>
  );
}
