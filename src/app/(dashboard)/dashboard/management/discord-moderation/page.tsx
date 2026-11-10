import { DiscordModerationPage } from "@/features/discord-moderation";
import { DISCORD_MODERATION_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata = {
  title: "Discord Moderation | Management",
};

export default async function Page() {
  await requireRole(DISCORD_MODERATION_ROLES);
  return <DiscordModerationPage />;
}
