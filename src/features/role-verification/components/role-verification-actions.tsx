import { CheckCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useDeleteRoleVerification,
  useVerifyRole,
} from "../hooks/use-role-verification";
import type { RoleVerificationItem } from "../schemas";

interface RoleVerificationActionsProps {
  item: RoleVerificationItem;
}

export function RoleVerificationActions({
  item,
}: RoleVerificationActionsProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const { mutate: verifyRole, isPending: isVerifying } = useVerifyRole();
  const { mutate: deleteRole, isPending: isDeleting } =
    useDeleteRoleVerification();

  const handleVerify = () => {
    verifyRole(item.id);
  };

  const handleDelete = () => {
    setIsRejectModalOpen(true);
  };

  const confirmDelete = () => {
    deleteRole(item.id, {
      onSuccess: () => {
        setIsRejectModalOpen(false);
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-success hover:bg-success/10 hover:text-success/80"
          onClick={handleVerify}
          disabled={item.verified || isVerifying || isDeleting}
          title="Verify Role"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
          disabled={isVerifying || isDeleting}
          title="Reject/Delete Request"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ConfirmDialog
        open={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        title="Reject Role Request"
        description={`Are you sure you want to reject and delete the role request for ${item.full_name}?`}
        onConfirm={confirmDelete}
        isPending={isDeleting}
        confirmLabel="Reject & Delete"
      />
    </>
  );
}
