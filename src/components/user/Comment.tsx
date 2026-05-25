/* eslint-disable */
// @ts-nocheck

import type { AdVideo } from '@/types/models/adVideo'
import type { Comment, CommentApiResponse } from '@/types/api/comment'
import React, { useState } from 'react'
import {
    SheetDescription,
    SheetFooter,
    SheetTitle,
} from '../ui/sheet'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { SendIcon } from 'lucide-react'
import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { postComment, fetchAdcomment } from '@/api/feed'
import CommentItem from './CommentItem'
import { Loading } from '../Loading'

export default function Comment({ v }: { v: AdVideo }) {
    const queryClient = useQueryClient()
    const [comment, setComment] = useState('')
    const [page, setPage] = useState(1)

    /* =========================
       FETCH COMMENTS
    ========================= */
    const { data, isLoading, isFetching } = useQuery<CommentApiResponse>({
        queryKey: ['comments', v.id, page],
        queryFn: () => fetchAdcomment({ adid: v.id, page }),
        keepPreviousData: true,
    })

    const comments = data?.data.data ?? []
    const pagination = data?.data

    /* =========================
       POST COMMENT
    ========================= */
    const { mutate, isPending } = useMutation({
        mutationFn: postComment,
        onSuccess: () => {
            setComment('')
            queryClient.invalidateQueries({
                queryKey: ['comments', v.id],
            })
        },
    })

    const handleSendComment = () => {
        if (!comment.trim()) return
        mutate({ comment, videoid: v.id })
    }

    return (
        <>
            {/* HEADER */}
            <SheetTitle className="text-center text-base font-semibold">
                {data?.comment_count ?? 0} comments
            </SheetTitle>

            {/* COMMENTS */}
            <SheetDescription className="mt-3 max-h-[420px] overflow-y-auto space-y-4 px-1">
                {isLoading && <Loading />}

                {!isLoading && comments.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                        Be the first to comment 👀
                    </p>
                )}

                {comments.map((c: Comment) => (
                    <CommentItem key={c.id} c={c} />
                ))}

                {isFetching && <Loading />}
            </SheetDescription>

            {/* PAGINATION – TikTok style */}
            {pagination && pagination.last_page > 1 && (
                <div className={`flex justify-between px-2 py-2 `}>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!pagination.prev_page_url}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </Button>

                    <span className="text-xs text-muted-foreground">
                        {pagination.current_page} / {pagination.last_page}
                    </span>

                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!pagination.next_page_url}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* INPUT (TikTok-like bottom bar) */}
            <SheetFooter className="border-t pt-3">
                <div className="flex w-full items-end gap-2">
                    <Textarea
                        placeholder="Add comment..."
                        className="resize-none rounded-full px-4 py-2 text-sm"
                        rows={1}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />

                    <Button
                        size="icon"
                        className="rounded-full"
                        disabled={isPending || !comment.trim()}
                        onClick={handleSendComment}
                    >
                        <SendIcon className="h-4 w-4" />
                    </Button>
                </div>
            </SheetFooter>
        </>
    )
}
