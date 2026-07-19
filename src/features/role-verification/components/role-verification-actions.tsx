import { CheckCircle, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteRoleVerification,
  useVerifyRole,
} from "../hooks/use-role-verification";
import type { RoleVerificationItem } from "../schemas";

const roleProfileFieldLabels: Record<string, string> = {
  type: "Profile Type",
  company_id: "Company ID",
  name: "Company Name",
  slug: "Slug",
  description: "Description",
  industry_sector: "Industry Sector",
  company_size: "Company Size",
  website_link: "Website",
  linkedin_url: "LinkedIn",
  location: "Location",
  legal_name: "Legal Name",
  registration_number: "Registration Number",
  tax_id: "Tax ID",
  status: "Status",
  verification_document_url: "Verification Document",
  verification_requested_at: "Requested At",
  rejection_reason: "Rejection Reason",
  founded_year: "Founded Year",
};

function formatKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const renderRoleProfileValue = (key: string, value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  // Handle URL values
  if (
    typeof value === "string" &&
    (key.endsWith("_url") || key.endsWith("_link") || value.startsWith("http"))
  ) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-blue hover:underline break-all"
      >
        {value}
      </a>
    );
  }

  // Handle Date values
  if (
    typeof value === "string" &&
    (key.endsWith("_at") || key.endsWith("_date"))
  ) {
    try {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    } catch {
      // fallback to plain string
    }
  }

  // Fallback to stringifying objects/arrays just in case, otherwise toString
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

interface RoleVerificationActionsProps {
  item: RoleVerificationItem;
}

export function RoleVerificationActions({
  item,
}: RoleVerificationActionsProps) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const { mutate: verifyRole, isPending: isVerifying } = useVerifyRole();
  const { mutate: deleteRole, isPending: isDeleting } =
    useDeleteRoleVerification();

  const handleVerify = () => {
    verifyRole(item.id, {
      onSuccess: () => {
        setIsViewModalOpen(false);
      },
    });
  };

  const handleDelete = () => {
    setIsRejectModalOpen(true);
  };

  const confirmDelete = () => {
    deleteRole(item.id, {
      onSuccess: () => {
        setIsRejectModalOpen(false);
        setIsViewModalOpen(false);
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => setIsViewModalOpen(true)}
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl md:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Role Verification Details</DialogTitle>
            <DialogDescription>
              Review the details for {item.full_name} before verifying or
              rejecting the role request.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto -mx-6 px-6 border-y border-border/40 py-2">
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Full Name
                  </h4>
                  <p className="text-sm font-medium break-words">
                    {item.full_name}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    MuID
                  </h4>
                  <p className="text-sm font-medium break-all">{item.muid}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </h4>
                  <p className="text-sm font-medium break-all">{item.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Mobile
                  </h4>
                  <p className="text-sm font-medium break-words">
                    {item.mobile || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Discord ID
                  </h4>
                  <p className="text-sm font-medium break-all">
                    {item.discord_id || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Joined Date
                  </h4>
                  <p className="text-sm font-medium break-words">
                    {item.joined
                      ? new Date(item.joined).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Gender
                  </h4>
                  <p className="text-sm font-medium break-words">
                    {item.gender || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    DOB
                  </h4>
                  <p className="text-sm font-medium break-words">
                    {item.dob || "N/A"}
                  </p>
                </div>
              </div>

              {/* Location Info */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">
                  Location Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Country
                    </h4>
                    <p className="text-sm font-medium break-words">
                      {item.country || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      State
                    </h4>
                    <p className="text-sm font-medium break-words">
                      {item.state || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      District
                    </h4>
                    <p className="text-sm font-medium break-words">
                      {item.district || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Role Info */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Role Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Requested Role
                    </h4>
                    <p className="text-sm font-medium break-words">
                      {item.role_title}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Status
                    </h4>
                    <p className="text-sm font-medium break-words">
                      {item.verified ? "Verified" : "Pending"}
                    </p>
                  </div>
                </div>

                {(() => {
                  const roleProfile = item.role_profile;
                  return (
                    roleProfile &&
                    Object.keys(roleProfile).length > 0 && (
                      <div className="mt-6 border-t pt-4">
                        <h3 className="text-sm font-semibold mb-3">
                          Role Profile Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          {Object.keys(roleProfile)
                            .filter((key) => key !== "description")
                            .map((key) => {
                              const val = roleProfile[key];
                              return (
                                <div key={key}>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                    {roleProfileFieldLabels[key] ||
                                      formatKey(key)}
                                  </h4>
                                  <p className="text-sm font-medium break-all">
                                    {renderRoleProfileValue(key, val)}
                                  </p>
                                </div>
                              );
                            })}
                          {roleProfile.description !== undefined && (
                            <div className="col-span-1 sm:col-span-2 md:col-span-3">
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                {roleProfileFieldLabels.description ||
                                  "Description"}
                              </h4>
                              <p className="text-sm font-medium break-words whitespace-pre-wrap bg-muted/30 p-3 rounded-md border border-border/20">
                                {renderRoleProfileValue(
                                  "description",
                                  roleProfile.description,
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  );
                })()}
              </div>

              {/* Organizations */}
              {item.organizations && item.organizations.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Organizations</h3>
                  <div className="space-y-3">
                    {item.organizations.map((org, idx) => (
                      <div
                        key={org.org_id || idx}
                        className="bg-muted/50 p-3 rounded-md"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Name:{" "}
                            </span>
                            <span className="text-sm font-medium break-words">
                              {org.org_title}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Type:{" "}
                            </span>
                            <span className="text-sm font-medium break-words">
                              {org.org_type}
                            </span>
                          </div>
                          {org.department && (
                            <div>
                              <span className="text-xs text-muted-foreground">
                                Department:{" "}
                              </span>
                              <span className="text-sm font-medium break-words">
                                {org.department}
                              </span>
                            </div>
                          )}
                          {org.graduation_year && (
                            <div>
                              <span className="text-xs text-muted-foreground">
                                Graduation Year:{" "}
                              </span>
                              <span className="text-sm font-medium break-words">
                                {org.graduation_year}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interest Groups */}
              {item.interest_groups && item.interest_groups.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">
                    Interest Groups
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(item.interest_groups)).map((ig) => (
                      <Badge
                        key={String(ig)}
                        variant="secondary"
                        className="rounded-full px-3 py-1 font-semibold text-xs border border-border/40 hover:bg-muted/50 cursor-default"
                      >
                        {String(ig)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              onClick={handleDelete}
              disabled={isVerifying || isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Reject Request
            </Button>
            <Button
              className="bg-brand-blue text-white hover:bg-brand-blue/90"
              onClick={handleVerify}
              disabled={item.verified || isVerifying || isDeleting}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {item.verified ? "Already Verified" : "Verify Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
