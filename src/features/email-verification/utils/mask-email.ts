/** a•••@gmail.com, mirroring the backend's mask_email. */
export function maskEmail(email: string): string {
  const [local, domain] = email.trim().toLowerCase().split("@");
  if (!local || !domain) return "•••";
  return `${local[0]}•••@${domain}`;
}
