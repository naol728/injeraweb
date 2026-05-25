import { fetchownaddetail } from '@/api/ad'
import { fetchAdcomment } from '@/api/feed'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, Eye, MessageCircle, Clock, Calendar,
    Play, Pause, Volume2, Maximize, Share2,
    ThumbsUp, ThumbsDown, Send, MoreVertical,
    User, ChevronLeft, ChevronRight, BarChart2,
    Download, Edit, Flag, AlertCircle, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Components
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdvertiserAddetail() {
    const { id } = useParams<{ id: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const currentPage = parseInt(searchParams.get('page') || '1')

    // Video player state
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(0.7)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [commentText, setCommentText] = useState('')

    const videoRef = useRef<HTMLVideoElement>(null)
    const progressRef = useRef<HTMLDivElement>(null)

    // Fetch ad details
    const {
        data: ad,
        error: aderr,
        isLoading: adloading,
        refetch: refetchAd
    } = useQuery({
        queryKey: ['fetchownaddetail', id],
        queryFn: () => fetchownaddetail({ id: id! }),
        enabled: !!id,
    })

    // Fetch comments with pagination
    const {
        data: commentData,
        error: commenterr,
        isLoading: commentloading,
        refetch: refetchComments
    } = useQuery({
        queryKey: ['fetchAdcomment', id, currentPage],
        queryFn: () => fetchAdcomment({ page: currentPage, adid: id! }),
        enabled: !!id && !!ad,
    })

    const comments = commentData?.data?.data || []
    const pagination = commentData?.data || {}
    const totalComments = commentData?.comment_count || 0

    // Video player controls
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value)
        setVolume(newVolume)
        if (videoRef.current) {
            videoRef.current.volume = newVolume
        }
    }

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (progressRef.current && videoRef.current) {
            const rect = progressRef.current.getBoundingClientRect()
            const pos = (e.clientX - rect.left) / rect.width
            videoRef.current.currentTime = pos * videoRef.current.duration
            setCurrentTime(pos * videoRef.current.duration)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
            if (!duration) {
                setDuration(videoRef.current.duration)
            }
        }
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            videoRef.current?.parentElement?.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Comment handling
    const handleSubmitComment = async () => {
        if (!commentText.trim()) return

        try {
            // Add your comment submission logic here
            console.log('Submitting comment:', commentText)
            setCommentText('')
            // Refetch comments after submission
            await refetchComments()
        } catch (error) {
            console.error('Error submitting comment:', error)
        }
    }

    // Pagination
    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: newPage.toString() })
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date)
        } catch (error) {
            return 'Invalid date'
        }
    }

    // Handle fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])

    // Loading state
    if (adloading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-[500px] w-full rounded-xl" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-64 w-full rounded-xl" />
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (aderr || !ad) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {aderr?.message || 'Failed to load ad details'}
                        </AlertDescription>
                    </Alert>
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Ad Not Found</h2>
                        <p className="text-muted-foreground mb-6">
                            The requested ad could not be found or has been removed.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => refetchAd()} variant="outline">
                                Try Again
                            </Button>
                            <Link to="/advertiser/advideo">
                                <Button className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Ads
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const videoUrl = `https://pub-7fa68a27c9094c06b1a9403bec80db5a.r2.dev/${ad.video_url}`

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <Link to="/advertiser/advideo">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Ads
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold line-clamp-1">{ad.title}</h1>
                                <p className="text-sm text-muted-foreground">
                                    Created {formatDate(ad.created_at)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Edit className="w-4 h-4" />
                                Edit
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Share2 className="w-4 h-4" />
                                Share
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Download className="w-4 h-4" />
                                Download
                            </Button>
                        </div>
                    </div>
                    <Separator />
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content - Video & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Player */}
                        <Card className="overflow-hidden border-0 shadow-lg">
                            <div className="relative bg-black rounded-xl overflow-hidden">
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    className="w-full aspect-video"
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={() => {
                                        if (videoRef.current) {
                                            setDuration(videoRef.current.duration)
                                        }
                                    }}
                                    onClick={togglePlay}
                                />

                                {/* Custom Video Controls */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                                    {/* Progress Bar */}
                                    <div
                                        ref={progressRef}
                                        className="h-1 bg-gray-600 rounded-full mb-3 cursor-pointer group"
                                        onClick={handleProgressClick}
                                    >
                                        <div
                                            className="h-full bg-primary rounded-full relative group-hover:bg-primary/90 transition-colors"
                                            style={{ width: `${(currentTime / duration) * 100}%` }}
                                        >
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-white hover:text-white hover:bg-white/20 rounded-full"
                                                onClick={togglePlay}
                                            >
                                                {isPlaying ? (
                                                    <Pause className="w-5 h-5" />
                                                ) : (
                                                    <Play className="w-5 h-5" />
                                                )}
                                            </Button>

                                            <div className="flex items-center gap-2">
                                                <Volume2 className="w-4 h-4 text-white" />
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={volume}
                                                    onChange={handleVolumeChange}
                                                    className="w-20 accent-white cursor-pointer"
                                                />
                                            </div>

                                            <div className="text-sm text-white font-medium">
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-white hover:text-white hover:bg-white/20 rounded-full"
                                                onClick={toggleFullscreen}
                                            >
                                                <Maximize className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Play Button Overlay */}
                                <AnimatePresence>
                                    {!isPlaying && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                            onClick={togglePlay}
                                        >
                                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                                <Play className="w-10 h-10 text-white fill-white" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Card>

                        {/* Ad Details Tabs */}
                        <Card>
                            <CardContent className="p-6">
                                <Tabs defaultValue="overview" className="w-full">
                                    <TabsList className="grid grid-cols-4 mb-6">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                                        <TabsTrigger value="comments">
                                            Comments ({totalComments})
                                        </TabsTrigger>
                                        <TabsTrigger value="settings">Settings</TabsTrigger>
                                    </TabsList>

                                    {/* Overview Tab */}
                                    <TabsContent value="overview" className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold mb-2">Description</h2>
                                            <p className="text-muted-foreground whitespace-pre-line">
                                                {ad.description || 'No description provided.'}
                                            </p>
                                        </div>

                                        <Separator />

                                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium text-muted-foreground">Views</h4>
                                                <div className="flex items-center gap-2">
                                                    <Eye className="w-5 h-5 text-blue-500" />
                                                    <span className="text-2xl font-bold">{ad.views?.toLocaleString() || 0}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium text-muted-foreground">Likes</h4>
                                                <div className="flex items-center gap-2">
                                                    <ThumbsUp className="w-5 h-5 text-green-500" />
                                                    <span className="text-2xl font-bold">{ad.likes?.toLocaleString() || 0}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium text-muted-foreground">Shares</h4>
                                                <div className="flex items-center gap-2">
                                                    <Share2 className="w-5 h-5 text-purple-500" />
                                                    <span className="text-2xl font-bold">{ad.shares?.toLocaleString() || 0}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium text-muted-foreground">Comments</h4>
                                                <div className="flex items-center gap-2">
                                                    <MessageCircle className="w-5 h-5 text-orange-500" />
                                                    <span className="text-2xl font-bold">{totalComments.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Analytics Tab */}
                                    <TabsContent value="analytics" className="space-y-4">
                                        <div className="text-center py-12">
                                            <BarChart2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                                            <p className="text-muted-foreground mb-6">
                                                Detailed performance metrics and insights for your ad campaign
                                            </p>
                                            <Button className="gap-2">
                                                <BarChart2 className="w-4 h-4" />
                                                View Full Analytics
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    {/* Comments Tab */}
                                    <TabsContent value="comments" className="space-y-6">
                                        {/* Add Comment */}
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback>
                                                        <User className="w-5 h-5" />
                                                    </AvatarFallback>
                                                </Avatar>

                                            </div>
                                        </div>

                                        {/* Comments List */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold">
                                                    {totalComments} Comment{totalComments !== 1 ? 's' : ''}
                                                </h4>
                                                <Button variant="ghost" size="sm" className="gap-2">
                                                    <Filter className="w-4 h-4" />
                                                    Sort by
                                                </Button>
                                            </div>

                                            <Separator />

                                            {commentloading ? (
                                                <div className="space-y-4">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div key={i} className="flex gap-3">
                                                            <Skeleton className="h-10 w-10 rounded-full" />
                                                            <div className="flex-1 space-y-2">
                                                                <Skeleton className="h-4 w-24" />
                                                                <Skeleton className="h-16 w-full" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : comments.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                                    <h4 className="text-lg font-semibold mb-2">No Comments Yet</h4>
                                                    <p className="text-muted-foreground">
                                                        Be the first to comment on this ad
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {comments.map((comment: any) => (
                                                        <motion.div
                                                            key={comment.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="flex gap-3 group"
                                                        >
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback>
                                                                    <User className="w-5 h-5" />
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <h5 className="font-semibold">
                                                                            {comment.user?.name || 'Anonymous User'}
                                                                        </h5>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {formatDate(comment.created_at)}
                                                                        </p>
                                                                    </div>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            >
                                                                                <MoreVertical className="w-4 h-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem className="text-red-600">
                                                                                <Flag className="w-4 h-4 mr-2" />
                                                                                Report Comment
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <p className="text-sm whitespace-pre-line">
                                                                    {comment.content}
                                                                </p>
                                                                <div className="flex items-center gap-4">
                                                                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                                                                        <ThumbsUp className="w-4 h-4" />
                                                                        {comment.likes_count || 0}
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                                                                        <ThumbsDown className="w-4 h-4" />
                                                                        {comment.dislikes_count || 0}
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" className="h-8">
                                                                        Reply
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Pagination */}
                                            {pagination.last_page > 1 && (
                                                <div className="flex items-center justify-between pt-6 border-t">
                                                    <div className="text-sm text-muted-foreground">
                                                        Showing page {pagination.current_page} of {pagination.last_page}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePageChange(currentPage - 1)}
                                                            disabled={!pagination.prev_page_url}
                                                            className="gap-2"
                                                        >
                                                            <ChevronLeft className="w-4 h-4" />
                                                            Previous
                                                        </Button>
                                                        <div className="flex items-center gap-1">
                                                            {Array.from(
                                                                { length: Math.min(5, pagination.last_page) },
                                                                (_, i) => {
                                                                    let pageNum
                                                                    if (pagination.last_page <= 5) {
                                                                        pageNum = i + 1
                                                                    } else if (currentPage <= 3) {
                                                                        pageNum = i + 1
                                                                    } else if (currentPage >= pagination.last_page - 2) {
                                                                        pageNum = pagination.last_page - 4 + i
                                                                    } else {
                                                                        pageNum = currentPage - 2 + i
                                                                    }

                                                                    return (
                                                                        <Button
                                                                            key={pageNum}
                                                                            variant={currentPage === pageNum ? "default" : "outline"}
                                                                            size="sm"
                                                                            className="w-8 h-8 p-0"
                                                                            onClick={() => handlePageChange(pageNum)}
                                                                        >
                                                                            {pageNum}
                                                                        </Button>
                                                                    )
                                                                }
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePageChange(currentPage + 1)}
                                                            disabled={!pagination.next_page_url}
                                                            className="gap-2"
                                                        >
                                                            Next
                                                            <ChevronRight className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Settings Tab */}
                                    <TabsContent value="settings" className="space-y-4">
                                        <div className="text-center py-12">
                                            <h3 className="text-xl font-semibold mb-2">Ad Settings</h3>
                                            <p className="text-muted-foreground mb-6">
                                                Configure visibility, privacy, and other settings for this ad
                                            </p>
                                            <Button className="gap-2">
                                                <Edit className="w-4 h-4" />
                                                Edit Settings
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Performance Metrics</h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Engagement Rate</span>
                                        <Badge variant="outline">
                                            {totalComments > 0 || ad.likes > 0 ? 'Good' : 'Needs Improvement'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">View Duration</span>
                                        <Badge variant="outline">
                                            {duration > 30 ? 'Optimal' : 'Short'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <Badge className="bg-green-500">Active</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Quick Actions</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <Edit className="w-4 h-4" />
                                    Edit Ad Details
                                </Button>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <Share2 className="w-4 h-4" />
                                    Share Ad Link
                                </Button>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <Download className="w-4 h-4" />
                                    Download Video
                                </Button>

                            </CardContent>
                        </Card>

                        {/* Ad Information */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Ad Information</h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Ad ID</h4>
                                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                        {ad.ad_video_id?.substring(0, 8)}...
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                                    <p className="text-sm">
                                        {formatDate(ad.created_at)}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                                    <p className="text-sm">
                                        {formatDate(ad.updated_at)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Related Ads */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Your Other Ads</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-6">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        View and manage your other ad campaigns
                                    </p>
                                    <Link to="/advertiser/advideo">
                                        <Button variant="outline" className="w-full">
                                            View All Ads
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}