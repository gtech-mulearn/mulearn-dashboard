import { DiscordModerationPage } from "@/features/discord-moderation";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Discord Moderation | Management",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN, ROLES.DISCORD_MODERATOR]);
  return <DiscordModerationPage />;
}
