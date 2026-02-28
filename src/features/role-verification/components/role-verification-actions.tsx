import { CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { mutate: verifyRole, isPending: isVerifying } = useVerifyRole();
  const { mutate: deleteRole, isPending: isDeleting } =
    useDeleteRoleVerification();

  const handleVerify = () => {
    verifyRole(item.id);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to reject and delete this role request?",
      )
    ) {
      deleteRole(item.id);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700"
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
  );
}
