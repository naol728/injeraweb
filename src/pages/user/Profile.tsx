import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchAdvertiserProfile } from '@/api/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
    Play,
    Pause,
    Share2,
    MessageCircle,
    Heart,
    Eye,
    MapPin,
    Globe,
    Building,
    ChevronLeft,
    MoreVertical,
    Video,
    TrendingUp,
    Tag,
    Calendar,
    ExternalLink,
    MessageSquare,
    ThumbsUp,
    Download,
    Filter,
    User
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

interface Video {
    id: string
    title: string
    video_url: string
    view_count: number
    comment_count: number
    duration: number
    created_at: string
    category?: {
        name: string
    }
    tags?: Array<{
        name: string
    }>
    advertiser?: {
        username: string
        profile_picture?: string
    }
}

interface AdvertiserProfile {
    username?: string
    email?: string
    company_name?: string
    profile_picture?: string
    cover_image?: string | null
    bio?: string | null
    website?: string | null
    city?: string
    country?: string
    total_ads_uploaded?: number
    total_ad_views?: number
    videos?: Video[]
    is_following?: boolean
    followers_count?: number
    following_count?: number
    joined_date?: string
}

export default function Profile() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [currentPlayingVideo, setCurrentPlayingVideo] = useState<string | null>(null)
    const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())
    const [activeTab, setActiveTab] = useState('videos')
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

    const { data: profileData, error, isLoading } = useQuery<AdvertiserProfile>({
        queryKey: ["fetchAdvertiserProfile", id],
        queryFn: () => fetchAdvertiserProfile({ id: id! }),
        enabled: !!id,
    })

    const videos = profileData?.videos || []
    const totalViews = videos.reduce((sum, video) => sum + (video.view_count || 0), 0)
    const totalComments = videos.reduce((sum, video) => sum + (video.comment_count || 0), 0)
    const totalLikes = videos.reduce((sum, video) => sum + (video.view_count || 0), 0)

    // Handle video playback
    const handleVideoPlay = (videoId: string) => {
        // Stop any currently playing video
        if (currentPlayingVideo && currentPlayingVideo !== videoId) {
            const prevVideo = videoRefs.current.get(currentPlayingVideo)
            if (prevVideo) {
                prevVideo.pause()
            }
        }

        const video = videoRefs.current.get(videoId)
        if (video) {
            if (video.paused) {
                video.play().catch(console.error)
                setCurrentPlayingVideo(videoId)
            } else {
                video.pause()
                setCurrentPlayingVideo(null)
            }
        }
    }

    const handleLike = (videoId: string) => {
        setLikedVideos(prev => {
            const newSet = new Set(prev)
            if (newSet.has(videoId)) {
                newSet.delete(videoId)
                toast.success("Unliked video")
            } else {
                newSet.add(videoId)
                toast.success("Liked video")
            }
            return newSet
        })
    }

    const handleShare = (videoId: string) => {
        const shareUrl = `${window.location.origin}/video/${videoId}`
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast.success("Link copied to clipboard")
        })
    }

    const formatNumber = (num?: number) => {
        if (!num) return '0'
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown date'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch {
            return 'Invalid date'
        }
    }

    const getInitials = (name?: string) => {
        if (!name || typeof name !== 'string') return 'U'
        try {
            return name
                .split(' ')
                .filter(word => word.length > 0)
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        } catch {
            return 'U'
        }
    }

    const getDisplayName = () => {
        if (!profileData) return ''
        return profileData.username ||
            profileData.company_name ||
            'Unknown User'
    }

    const getUsernameDisplay = () => {
        if (!profileData?.username) return ''
        return `@${profileData.username}`
    }

    // Get safe values with defaults
    const safeTotalAdsUploaded = profileData?.total_ads_uploaded || 0
    const safeTotalAdViews = profileData?.total_ad_views || 0
    const safeFollowersCount = profileData?.followers_count || 0
    const safeFollowingCount = profileData?.following_count || 0

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-9 w-9 rounded-full" />
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-6">
                    <div className="space-y-6">
                        {/* Cover Image & Logo */}
                        <div className="relative rounded-2xl overflow-hidden">
                            <Skeleton className="w-full h-48" />
                            <div className="absolute -bottom-8 left-6">
                                <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
                            </div>
                        </div>
                        <div className="pt-12 space-y-6">
                            <Skeleton className="h-8 w-48" />
                            <div className="grid grid-cols-3 gap-4">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !profileData) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-6">😔</div>
                    <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
                    <p className="text-muted-foreground mb-6">
                        The advertiser profile you're looking for doesn't exist or has been removed.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => navigate(-1)}>
                            Go Back
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/')}>
                            Browse Videos
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Fixed Header */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="hover:bg-accent"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={profileData.profile_picture} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-sm">
                                    {getInitials(profileData.username || profileData.company_name)}
                                </AvatarFallback>
                            </Avatar>
                            <h1 className="text-lg font-semibold">
                                {getUsernameDisplay() || getDisplayName()}
                            </h1>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-accent">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleShare(getDisplayName())}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.info("Report feature coming soon")}>
                                    <span className="text-destructive">Report Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.info("Block feature coming soon")}>
                                    <span className="text-destructive">Block User</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                {/* Profile Header */}
                <div className="space-y-6">
                    {/* Cover Image & Avatar */}
                    <div className="relative rounded-2xl overflow-hidden">
                        {profileData.cover_image ? (
                            <img
                                src={profileData.cover_image}
                                alt="Cover"
                                className="w-full h-48 object-cover"
                            />
                        ) : (
                            <div className="w-full h-48 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10"></div>
                        )}
                        <div className="absolute -bottom-8 left-6">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarImage src={profileData.profile_picture} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-2xl font-bold">
                                    {getInitials(profileData.username || profileData.company_name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="pt-12 space-y-6">
                        {/* Username & Company */}
                        <div className="space-y-3">
                            <div>
                                <h1 className="text-2xl font-bold">{getDisplayName()}</h1>
                                {profileData.username && (
                                    <p className="text-muted-foreground">
                                        {getUsernameDisplay()}
                                    </p>
                                )}
                                {profileData.company_name && profileData.username && (
                                    <p className="text-muted-foreground mt-1">
                                        {profileData.company_name}
                                    </p>
                                )}
                            </div>


                        </div>

                        {/* Bio */}
                        {profileData.bio && (
                            <Card className="bg-card border-none shadow-sm">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold mb-2 text-sm">About</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{profileData.bio}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-card border-none shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Video className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{safeTotalAdsUploaded}</div>
                                            <div className="text-xs text-muted-foreground">Videos</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-none shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-500/10">
                                            <Eye className="h-4 w-4 text-green-500" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{formatNumber(safeTotalAdViews)}</div>
                                            <div className="text-xs text-muted-foreground">Views</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-none shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/10">
                                            <ThumbsUp className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{formatNumber(totalLikes)}</div>
                                            <div className="text-xs text-muted-foreground">Likes</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card border-none shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-amber-500/10">
                                            <MessageCircle className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{formatNumber(totalComments)}</div>
                                            <div className="text-xs text-muted-foreground">Comments</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Location & Website */}
                        {(profileData.city || profileData.country || profileData.website) && (
                            <div className="space-y-3">
                                {(profileData.city || profileData.country) && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-accent">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">Location</div>
                                            <div className="text-sm text-muted-foreground">
                                                {profileData.city && profileData.country
                                                    ? `${profileData.city}, ${profileData.country}`
                                                    : profileData.city || profileData.country || 'Not specified'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {profileData.website && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-accent">
                                            <Globe className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">Website</div>
                                            <a
                                                href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                            >
                                                {profileData.website.replace(/^https?:\/\//, '')}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="videos" className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Videos ({videos?.length})
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="tags" className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Tags
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="videos" className="space-y-6">
                        {/* Videos Filter */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-sm">
                                    <Eye className="h-3 w-3 mr-1" />
                                    {formatNumber(totalViews)} total views
                                </Badge>
                                <Badge variant="outline" className="text-sm">
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    {formatNumber(totalComments)} comments
                                </Badge>
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                        </div>

                        {videos.length === 0 ? (
                            <Card className="bg-card border-dashed">
                                <CardContent className="p-12 text-center">
                                    <div className="inline-flex p-4 rounded-full bg-accent/10 mb-6">
                                        <Video className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">No videos uploaded yet</h3>
                                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                        {getDisplayName()} hasn't uploaded any promotional videos yet.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {videos.map((video) => (
                                    <Card
                                        key={video.id}
                                        className="group relative overflow-hidden bg-card hover:shadow-lg transition-all duration-300 border-none shadow-sm"
                                    >
                                        {/* Video Thumbnail/Player */}
                                        <div className="relative aspect-[9/16] overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                                            {/* Video Duration */}
                                            <Badge className="absolute top-3 left-3 bg-black/80 text-white z-10 text-xs font-medium">
                                                {formatDuration(video.duration)}
                                            </Badge>

                                            {/* Category Badge */}
                                            {video.category?.name && (
                                                <Badge variant="secondary" className="absolute top-3 right-3 z-10 text-xs">
                                                    {video.category.name}
                                                </Badge>
                                            )}

                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-16 w-16 rounded-full bg-black/70 backdrop-blur hover:bg-black/90 transition-all duration-300 ${currentPlayingVideo === video.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                        }`}
                                                    onClick={() => handleVideoPlay(video.id)}
                                                >
                                                    {currentPlayingVideo === video.id ? (
                                                        <Pause className="h-8 w-8 text-white" />
                                                    ) : (
                                                        <Play className="h-8 w-8 text-white" />
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Video */}
                                            <video
                                                ref={el => {
                                                    if (el) {
                                                        videoRefs.current.set(video.id, el)
                                                    } else {
                                                        videoRefs.current.delete(video.id)
                                                    }
                                                }}
                                                src={`${video.video_url}`}
                                                className="w-full h-full object-cover"
                                                loop
                                                playsInline
                                                muted
                                                onClick={() => handleVideoPlay(video.id)}
                                                onPlay={() => setCurrentPlayingVideo(video.id)}
                                                onPause={() => {
                                                    if (currentPlayingVideo === video.id) {
                                                        setCurrentPlayingVideo(null)
                                                    }
                                                }}
                                            />

                                            {/* View Count Overlay */}
                                            <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                                                <Badge variant="secondary" className="bg-black/80 text-white text-xs font-medium">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    {formatNumber(video.view_count)}
                                                </Badge>
                                                {video.comment_count > 0 && (
                                                    <Badge variant="secondary" className="bg-black/80 text-white text-xs font-medium">
                                                        <MessageCircle className="h-3 w-3 mr-1" />
                                                        {formatNumber(video.comment_count)}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Progress Bar */}
                                            {currentPlayingVideo === video.id && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 z-10">
                                                    <Progress
                                                        value={50}
                                                        className="h-full bg-primary"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Video Info */}
                                        <CardContent className="p-4 space-y-4">
                                            <div className="space-y-2">
                                                <h3 className="font-semibold line-clamp-2 leading-tight text-base">
                                                    {video.title}
                                                </h3>

                                                {/* Tags */}
                                                {video.tags && video.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {video.tags.slice(0, 2).map((tag, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="outline"
                                                                className="text-xs px-2 py-0.5"
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        ))}
                                                        {video.tags.length > 2 && (
                                                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                                                                +{video.tags.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Date */}
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {formatDate(video.created_at)}
                                                </div>
                                            </div>

                                            {/* Video Actions */}
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-2">

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => toast.info("Comments coming soon")}
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => handleShare(video.id)}
                                                    >
                                                        <Share2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {/* <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-3"
                                                    onClick={() => toast.info("Download coming soon")}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button> */}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <Card className="bg-card border-none shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Total Views</span>
                                            <span className="font-bold">{formatNumber(totalViews)}</span>
                                        </div>
                                        <Progress value={(totalViews / Math.max(totalViews, 1)) * 100} className="h-2" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium">Avg. Views per Video</div>
                                            <div className="text-2xl font-bold">
                                                {videos.length > 0 ? formatNumber(totalViews / videos.length) : 0}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium">Engagement Rate</div>
                                            <div className="text-2xl font-bold">
                                                {videos.length > 0 && totalViews > 0
                                                    ? ((totalComments / totalViews) * 100).toFixed(1)
                                                    : 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tags" className="space-y-6">
                        {videos.length === 0 ? (
                            <Card className="bg-card border-dashed">
                                <CardContent className="p-12 text-center">
                                    <div className="inline-flex p-4 rounded-full bg-accent/10 mb-6">
                                        <Tag className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">No tags available</h3>
                                    <p className="text-muted-foreground">
                                        Tags will appear when videos are uploaded.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {Array.from(new Set(videos.flatMap(v => v.tags || []).map(t => t.name))).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="px-4 py-2 text-base">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}