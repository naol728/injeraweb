import type { Comment } from "@/types/models/adVideo";
import type { AdVideo } from "@/types/models/adVideo";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { replytoComment, fetchAdcommentreply } from "@/api/feed";

export default function CommentItem({ c }: { c: Comment }) {
    const queryClient = useQueryClient();

    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showReplies, setShowReplies] = useState(false);
    const [page, setPage] = useState(1);

    /* =========================
       FETCH REPLIES
    ========================= */
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["commentReplies", c.id, page],
        queryFn: () =>
            fetchAdcommentreply({
                adid: c.ad_id,
                commentId: c.id,
                page,
            }),
        enabled: showReplies,
        keepPreviousData: true,
    });

    const fetchedReplies = Array.isArray(data?.data?.data)
        ? data.data.data
        : [];

    /* =========================
       POST REPLY
    ========================= */
    const mutation = useMutation({
        mutationFn: replytoComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["commentReplies", c.id] });
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
    });

    const handleReply = () => {
        if (!replyText.trim()) return;

        mutation.mutate({
            reply: replyText,
            videoid: c.ad_id,
            commentid: c.id,
        });

        setReplyText("");
        setIsReplying(false);
    };

    const replyCount = Number(c.reply_count || 0);

    return (
        <div className="flex gap-3 mb-5">
            <Avatar className="w-10 h-10">
                <AvatarImage src={c.user.avatar} />
                <AvatarFallback>
                    {c.user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="flex flex-col flex-1">
                <p className="font-semibold text-sm">{c.user.username}</p>
                <p className="text-sm">{c.comment}</p>

                {/* ACTIONS */}
                <div className="flex gap-4 mt-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="px-0 text-xs"
                        onClick={() => setIsReplying((p) => !p)}
                    >
                        Reply
                    </Button>

                    {replyCount > 0 && (
                        <button
                            className="text-xs text-muted-foreground"
                            onClick={() => setShowReplies((p) => !p)}
                        >
                            {showReplies
                                ? "Hide replies"
                                : `View replies (${replyCount})`}
                        </button>
                    )}
                </div>

                {/* REPLY INPUT */}
                {isReplying && (
                    <div className="mt-3 flex gap-2">
                        <Textarea
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        />
                        <Button size="icon" onClick={handleReply}>
                            <SendHorizonal size={16} />
                        </Button>
                    </div>
                )}

                {/* REPLIES */}
                {showReplies && (
                    <div className="mt-3 ml-6 border-l pl-4 space-y-3">
                        {isLoading && (
                            <p className="text-xs">Loading replies...</p>
                        )}

                        {fetchedReplies.map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                                <Avatar className="w-6 h-6">
                                    <AvatarFallback>
                                        {reply.user.username[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs font-medium">
                                        {reply.user.username}
                                    </p>
                                    <p className="text-sm">{reply.reply}</p>
                                </div>
                            </div>
                        ))}

                        {data?.data?.next_page_url && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Load more replies
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
