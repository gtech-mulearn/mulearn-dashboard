import { Code2, FileText, Github, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";

type SocialsMap = {
  github?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  dribble?: string | null;
  behance?: string | null;
  stackoverflow?: string | null;
  medium?: string | null;
  hackerrank?: string | null;
};

function buildSocialLinks(
  socials?: SocialsMap | null,
): { href: string; label: string; icon: React.ReactNode }[] {
  if (!socials) return [];
  const links: { href: string; label: string; icon: React.ReactNode }[] = [];

  if (socials.github)
    links.push({
      href: `https://github.com/${socials.github}`,
      label: "Github",
      icon: <Github className="h-4 w-4" />,
    });
  if (socials.linkedin)
    links.push({
      href: socials.linkedin.startsWith("http")
        ? socials.linkedin
        : `https://linkedin.com/in/${socials.linkedin}`,
      label: "LinkedIn",
      icon: <Linkedin className="h-4 w-4" />,
    });
  if (socials.stackoverflow)
    links.push({
      href: `https://stackoverflow.com/users/${socials.stackoverflow}`,
      label: "Stack Overflow",
      icon: <Code2 className="h-4 w-4" />,
    });
  if (socials.medium)
    links.push({
      href: socials.medium.startsWith("http")
        ? socials.medium
        : `https://medium.com/@${socials.medium}`,
      label: "Medium",
      icon: <FileText className="h-4 w-4" />,
    });

  return links;
}

// ── Person Card (main column – full details) ──────────────────────────────────
interface PersonCardProps {
  muid?: string | null;
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  profile_pic?: string | null;
  socials?: SocialsMap | null;
  accentClass?: string;
  avatarBgClass?: string;
}

export function PersonCard({
  muid,
  full_name,
  name,
  email,
  profile_pic,
  socials,
  accentClass = "text-primary",
  avatarBgClass = "from-primary/20 to-primary/5",
}: PersonCardProps) {
  const displayName = full_name || name || "—";
  const initial = displayName.charAt(0).toUpperCase();
  const socialLinks = buildSocialLinks(socials);
  const hasLinks = (email && true) || socialLinks.length > 0;

  const avatar = profile_pic ? (
    <Image
      src={profile_pic}
      alt={displayName}
      width={48}
      height={48}
      className="h-12 w-12 shrink-0 rounded-full object-cover"
    />
  ) : (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${avatarBgClass} text-lg font-bold ${accentClass} shadow-sm`}
    >
      {initial}
    </div>
  );

  return (
    <Card className="flex flex-col gap-4 p-5">
      {muid ? (
        <Link
          href={`/profile/${muid}`}
          className="flex items-center gap-4 hover:opacity-80 transition-opacity"
        >
          {avatar}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground">{displayName}</p>
          </div>
        </Link>
      ) : (
        <div className="flex items-center gap-4">
          {avatar}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground">{displayName}</p>
          </div>
        </div>
      )}
      {hasLinks && (
        <div className="flex flex-wrap gap-2">
          {email && (
            <Link
              href={`mailto:${email}`}
              title={email}
              className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-background p-2 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary hover:shadow-sm"
            >
              <Mail className="h-4 w-4" />
            </Link>
          )}
          {socialLinks.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={s.label}
              className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-background p-2 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary hover:shadow-sm"
            >
              {s.icon}
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
