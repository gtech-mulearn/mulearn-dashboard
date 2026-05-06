import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  value: string;
}

export function QrModal({
  open,
  onOpenChange,
  title,
  description,
  value,
}: QrModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <QRCode value={value} size={200} level="M" />
          </div>
          <p className="mt-6 text-center text-sm font-medium text-muted-foreground break-all w-full px-4">
            {value}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
