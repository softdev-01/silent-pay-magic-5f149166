import { QRCodeSVG } from "qrcode.react";

interface InvoiceQRCodeProps {
  invoiceId: string;
  size?: number;
}

export function InvoiceQRCode({ invoiceId, size = 128 }: InvoiceQRCodeProps) {
  const payUrl = `${window.location.origin}/pay/${invoiceId}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-lg border bg-white p-3">
        <QRCodeSVG value={payUrl} size={size} level="M" />
      </div>
      <p className="text-xs text-muted-foreground text-center max-w-[180px] break-all">
        Scan to view &amp; pay this invoice
      </p>
    </div>
  );
}
