"use client";
import { ArrowDown, ArrowUp, ExternalLink, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useCommentOnProject,
  useDeleteComment,
  useProject,
  useVoteProject,
} from "../hooks";
import { MemberList } from "./member-list";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  currentUserId: string | null;
}

export function ProjectDetailModal({
  open,
  onOpenChange,
  projectId,
  currentUserId,
}: Props) {
  const { data: project, isLoading } = useProject(open ? projectId : "");
  const vote = useVoteProject(projectId);
  const comment = useCommentOnProject(projectId);
  const deleteComment = useDeleteComment(projectId);
  const [text, setText] = useState("");

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {project?.title ?? "Project"}
            {project && project.status !== "published" && (
              <Badge variant="secondary" className="capitalize">
                {project.status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        {isLoading || !project ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm whitespace-pre-wrap">{project.description}</p>

            {project.links.length > 0 && (
              <ul className="space-y-1">
                {project.links.map((l) => (
                  <li key={l.id}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="font-medium">{l.label}:</span>
                      <span className="truncate max-w-md">{l.url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {project.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.skills.map((s) => (
                  <Badge key={s.id} variant="outline">
                    {s.name}
                  </Badge>
                ))}
              </div>
            )}

            {project.members.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold mb-2">Team</h5>
                <MemberList members={project.members} />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => vote.mutate("upvote")}
                disabled={!currentUserId}
              >
                <ArrowUp className="h-3 w-3 mr-1" />
                {project.votes.filter((v) => v.vote === "upvote").length}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => vote.mutate("downvote")}
                disabled={!currentUserId}
              >
                <ArrowDown className="h-3 w-3 mr-1" />
                {project.votes.filter((v) => v.vote === "downvote").length}
              </Button>
            </div>

            <div>
              <h5 className="font-semibold text-sm mb-2">
                Comments ({project.comments.length})
              </h5>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {project.comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-md border p-2 text-sm flex justify-between gap-2"
                  >
                    <div>
                      <p className="font-medium">{c.user ?? "Anonymous"}</p>
                      <p>{c.comment}</p>
                    </div>
                    {currentUserId && c.user_id === currentUserId && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteComment.mutate(c.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              {currentUserId && (
                <div className="mt-2 flex gap-2">
                  <Textarea
                    rows={2}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add a comment…"
                  />
                  <Button
                    onClick={() => {
                      if (text.trim()) {
                        comment.mutate(text.trim());
                        setText("");
                      }
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
