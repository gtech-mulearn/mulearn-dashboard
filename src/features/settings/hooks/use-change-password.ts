import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { changePassword } from "@/features/settings";

export function useChangePassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: (res) => {
      const msg = res.message?.general?.[0];
      if (res.hasError) {
        toast.error(msg);
        return;
      }
      toast.success(msg);
      router.push("/dashboard/profile");
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });
}
