import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalProps {
  setIsOpen: (isOpen: boolean) => void;
  id: string | number | boolean;
  heading?: string;
  content?: string;
  click?: (id: string | number | boolean) => Promise<void> | void;
  type?: string;
  isOpen: boolean;
}

const Modal = ({
  setIsOpen,
  id,
  heading,
  content,
  click,
  type,
  isOpen,
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>
          <DialogDescription>{content}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={type === "error" ? "destructive" : "default"}
            onClick={async () => {
              await click?.(id);
              setIsOpen(false);
            }}
            className="rounded-xl text-secondary"
          >
            {type === "error" ? "Delete" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
