import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  MessageCircle,
  Smile,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { propertyService } from "@/services/propertyService";
import { supabase } from "@/lib/supabase";

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
  hasLiked: boolean;
  reactions: { emoji: string; count: number }[];
  replies: Comment[];
}

interface PropertyCommentsProps {
  propertyId: string;
  feedItemId?: string;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😮", "😢", "😡", "🎉"];

export function PropertyComments({
  propertyId,
  feedItemId,
}: PropertyCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );
  const { toast } = useToast();

  const loadComments = useCallback(async () => {
    if (!feedItemId) return;
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const data = await propertyService.getComments(feedItemId);

      // Build tree
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      data.forEach((item: any) => {
        const comment: Comment = {
          id: item.id,
          author: {
            id: item.perfiles?.id,
            name: item.perfiles?.nombre_completo || "Usuario",
            avatar: item.perfiles?.foto,
          },
          content: item.contenido,
          timestamp: new Date(item.created_at),
          likes: item.likes_comentarios?.length || 0,
          hasLiked: item.likes_comentarios?.some(
            (l: any) => l.usuario_id === user?.id,
          ),
          reactions: [], // Reacciones not yet in schema? keeping empty for now
          replies: [],
        };
        commentMap.set(item.id, comment);
      });

      data.forEach((item: any) => {
        const comment = commentMap.get(item.id);
        if (
          item.parent_comentario_id &&
          commentMap.has(item.parent_comentario_id)
        ) {
          commentMap.get(item.parent_comentario_id)!.replies.push(comment!);
        } else {
          rootComments.push(comment!);
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [feedItemId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !feedItemId) return;

    try {
      await propertyService.addComment(feedItemId, newComment);
      setNewComment("");
      loadComments();
      toast({ title: "Comentario agregado" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim() || !feedItemId) return;

    try {
      await propertyService.addComment(feedItemId, replyContent, parentId);
      setReplyContent("");
      setReplyingTo(null);
      loadComments();
      setExpandedReplies((prev) => new Set(prev).add(parentId));
      toast({ title: "Respuesta agregada" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLike = async (
    commentId: string,
    isReply: boolean = false,
    parentId?: string,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes estar logueado para dar like",
        variant: "destructive",
      });
      return;
    }

    // Toggle logic
    const currentComment =
      isReply && parentId
        ? comments
            .find((c) => c.id === parentId)
            ?.replies.find((r) => r.id === commentId)
        : comments.find((c) => c.id === commentId);

    if (!currentComment) return;

    try {
      if (currentComment.hasLiked) {
        await supabase
          .from("likes_comentarios")
          .delete()
          .eq("comentario_id", commentId)
          .eq("usuario_id", user.id);
      } else {
        await supabase
          .from("likes_comentarios")
          .insert({ comentario_id: commentId, usuario_id: user.id });
      }
      loadComments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReaction = (
    commentId: string,
    emoji: string,
    isReply: boolean = false,
    parentId?: string,
  ) => {
    setComments((prev) =>
      prev.map((comment) => {
        const updateReactions = (c: Comment) => {
          const existingReaction = c.reactions.find((r) => r.emoji === emoji);
          if (existingReaction) {
            return {
              ...c,
              reactions: c.reactions.map((r) =>
                r.emoji === emoji ? { ...r, count: r.count + 1 } : r,
              ),
            };
          }
          return {
            ...c,
            reactions: [...c.reactions, { emoji, count: 1 }],
          };
        };

        if (isReply && parentId && comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId ? updateReactions(reply) : reply,
            ),
          };
        }
        if (comment.id === commentId) {
          return updateReactions(comment);
        }
        return comment;
      }),
    );
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  };

  const CommentItem = ({
    comment,
    isReply = false,
    parentId,
  }: {
    comment: Comment;
    isReply?: boolean;
    parentId?: string;
  }) => (
    <div className={`flex gap-3 ${isReply ? "ml-10 mt-3" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author.avatar} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {comment.author.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatTime(comment.timestamp)}
            </span>
          </div>
          <p className="text-sm text-foreground/90">{comment.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1.5 px-2">
          <button
            onClick={() => handleLike(comment.id, isReply, parentId)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              comment.hasLiked
                ? "text-red-500"
                : "text-muted-foreground hover:text-red-500"
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 ${comment.hasLiked ? "fill-current" : ""}`}
            />
            {comment.likes > 0 && comment.likes}
          </button>

          {!isReply && (
            <button
              onClick={() =>
                setReplyingTo(replyingTo === comment.id ? null : comment.id)
              }
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Responder
            </button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                <Smile className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" side="top">
              <div className="flex gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() =>
                      handleReaction(comment.id, emoji, isReply, parentId)
                    }
                    className="hover:scale-125 transition-transform text-lg p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex items-center gap-1 ml-auto">
              {comment.reactions.map((reaction) => (
                <span
                  key={reaction.emoji}
                  className="text-xs bg-muted rounded-full px-1.5 py-0.5"
                >
                  {reaction.emoji} {reaction.count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="flex gap-2 mt-2 ml-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className="min-h-[60px] text-sm resize-none"
              rows={2}
            />
            <Button
              size="sm"
              onClick={() => handleAddReply(comment.id)}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Replies toggle */}
        {!isReply && comment.replies.length > 0 && (
          <button
            onClick={() => toggleReplies(comment.id)}
            className="flex items-center gap-1 text-xs text-primary mt-2 ml-2 hover:underline"
          >
            {expandedReplies.has(comment.id) ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Ocultar respuestas
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Ver {comment.replies.length} respuesta
                {comment.replies.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        )}

        {/* Replies */}
        {!isReply && expandedReplies.has(comment.id) && (
          <div className="space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply
                parentId={comment.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Comentarios ({comments.length})
      </h4>

      {/* Add comment */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            TÚ
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="min-h-[60px] text-sm resize-none"
            rows={2}
          />
          <Button
            size="sm"
            onClick={handleAddComment}
            className="self-end"
            disabled={!newComment.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
