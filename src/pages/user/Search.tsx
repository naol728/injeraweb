/*eslint-disable*/
import { fetchsearchpagead, searchAd } from "@/api/search"
import { useQuery } from "@tanstack/react-query"
import type { AdVideo } from "@/types/models/adVideo"

import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Eye, Search as SearchIcon, Filter, Play, Pause, Calendar, Tag, User, X } from "lucide-react"
import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { generateThumbnail } from "@/lib/video"
import { formatDistanceToNow } from "date-fns"

type VideoCardProps = {
    video: AdVideo
}

type SortOption = "newest" | "popular" | "trending"

type SearchResponse = {
    success: boolean
    data: AdVideo[]
    message?: string
}

export default function Search() {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [sortBy, setSortBy] = useState<SortOption>("newest")

    // Debounce search query to avoid too many API calls
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
        }, 500) // 500ms delay

        return () => {
            clearTimeout(handler)
        }
    }, [searchQuery])

    // Fetch all videos (initial load)
    const {
        data: allVideosData,
        isLoading: isLoadingAll,
        error: allVideosError
    } = useQuery<SearchResponse>({
        queryKey: ["fetchsearchpagead"],
        queryFn: fetchsearchpagead,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Fetch search results
    const {
        data: searchData,
        isLoading: isLoadingSearch,
        error: searchError,
        isFetching: isSearchFetching
    } = useQuery<SearchResponse>({
        queryKey: ["searchAds", debouncedSearchQuery],
        queryFn: () => {
            if (!debouncedSearchQuery.trim()) {
                // Return empty array when no search query
                return { success: true, data: [] }
            }
            return searchAd({ term: debouncedSearchQuery.trim() })
        },
        enabled: !!debouncedSearchQuery.trim(), // Only enable when there's a search term
        staleTime: 2 * 60 * 1000, // 2 minutes
    })

    // Determine which data to use
    const videosData = useMemo(() => {
        // If we have a search query and search data is available, use search results
        if (debouncedSearchQuery.trim() && searchData) {
            return searchData.data || []
        }
        // Otherwise use all videos data
        return allVideosData?.data || []
    }, [debouncedSearchQuery, searchData, allVideosData])

    const isLoading = isLoadingAll || (debouncedSearchQuery.trim() && isLoadingSearch)
    const error = allVideosError || searchError

    // Extract unique categories from data
    const categories = useMemo(() => {
        if (!videosData || videosData.length === 0) return []
        const uniqueCategories = new Map<string, string>()
        videosData.forEach((video: AdVideo) => {
            if (video.category) {
                uniqueCategories.set(video.category.id, video.category.name)
            }
        })
        return Array.from(uniqueCategories, ([id, name]) => ({ id, name }))
    }, [videosData])

    // Filter and sort videos
    const filteredVideos = useMemo(() => {
        if (!videosData || videosData.length === 0) return []

        let filtered = videosData.filter((video: AdVideo) => {
            // Safe string checks
            const videoTitle = video.title || ''
            const videoDescription = video.description || ''
            const advertiserUsername = video.advertiser?.username || ''

            // If we're searching via API, we only apply local filters (category)
            // The API already handled the search term
            const matchesSearch = debouncedSearchQuery.trim()
                ? true // Search API already filtered by search term
                : searchQuery // Local search for initial data
                    ? videoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    videoDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    advertiserUsername.toLowerCase().includes(searchQuery.toLowerCase())
                    : true

            const matchesCategory = selectedCategory === "all" || video.category?.id === selectedCategory

            return matchesSearch && matchesCategory
        })

        // Sort videos
        filtered.sort((a: AdVideo, b: AdVideo) => {
            const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
            const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
            const aViews = a.view_count || 0
            const bViews = b.view_count || 0

            switch (sortBy) {
                case "newest":
                    return bDate - aDate
                case "popular":
                    return bViews - aViews
                case "trending":
                    // Simple trending algorithm based on views and recency
                    const aRecency = new Date().getTime() - aDate
                    const bRecency = new Date().getTime() - bDate
                    const aScore = aViews / Math.max(1, aRecency / (1000 * 60 * 60 * 24))
                    const bScore = bViews / Math.max(1, bRecency / (1000 * 60 * 60 * 24))
                    return bScore - aScore
                default:
                    return 0
            }
        })

        return filtered
    }, [videosData, searchQuery, debouncedSearchQuery, selectedCategory, sortBy])

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value)
    }, [])

    const handleClearSearch = useCallback(() => {
        setSearchQuery("")
        setDebouncedSearchQuery("")
    }, [])

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            // Trigger immediate search on Enter
            setDebouncedSearchQuery(searchQuery)
        }
    }, [searchQuery])

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-destructive text-lg font-semibold">
                        Failed to load videos
                    </div>
                    <p className="text-muted-foreground">
                        Please try refreshing the page
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* HEADER */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                    Discover Ads
                                </h1>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Explore professional advertising videos
                                </p>
                            </div>
                        </div>

                        {/* SEARCH BAR */}
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                type="search"
                                placeholder="Search videos, advertisers, or keywords..."
                                className="pl-10 pr-10 py-6 text-base bg-muted/50 border-muted-foreground/20 focus:border-primary transition-colors"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoadingSearch || isSearchFetching}
                            />
                            {(isLoadingSearch || isSearchFetching) && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                </div>
                            )}
                            {searchQuery && !isLoadingSearch && !isSearchFetching && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                                    onClick={handleClearSearch}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* FILTERS */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Filter className="h-4 w-4" />
                                <span>Filters</span>
                            </div>
                            <div className="flex-1 flex flex-wrap gap-2">
                                <Select
                                    value={selectedCategory}
                                    onValueChange={setSelectedCategory}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={sortBy}
                                    onValueChange={(value: SortOption) => setSortBy(value)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest First</SelectItem>
                                        <SelectItem value="popular">Most Popular</SelectItem>
                                        <SelectItem value="trending">Trending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="container mx-auto px-4 py-6">
                {/* RESULTS INFO */}
                {!isLoading && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <p className="text-muted-foreground">
                                    {debouncedSearchQuery.trim() ? (
                                        <>
                                            Found <span className="font-semibold text-foreground">{filteredVideos.length}</span> results
                                            <span className="ml-2">
                                                for "<span className="font-semibold text-foreground">{debouncedSearchQuery}</span>"
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            Showing <span className="font-semibold text-foreground">{filteredVideos.length}</span> videos
                                            {searchQuery && (
                                                <span className="ml-2">
                                                    filtered by "<span className="font-semibold text-foreground">{searchQuery}</span>"
                                                </span>
                                            )}
                                        </>
                                    )}
                                </p>
                                {(isLoadingSearch || isSearchFetching) && (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                )}
                            </div>
                            {(debouncedSearchQuery.trim() || searchQuery) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearSearch}
                                    disabled={isLoadingSearch || isSearchFetching}
                                >
                                    Clear search
                                </Button>
                            )}
                        </div>
                        <Separator className="mt-3" />
                    </div>
                )}

                {/* LOADING SKELETONS */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="aspect-[9/16] rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* NO RESULTS */}
                {!isLoading && filteredVideos.length === 0 && (
                    <div className="text-center py-20">
                        <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No videos found</h3>
                        <p className="text-muted-foreground mb-6">
                            {debouncedSearchQuery.trim() || searchQuery
                                ? searchData?.message || "Try different search terms or filters"
                                : "No videos available at the moment"}
                        </p>
                        {(debouncedSearchQuery.trim() || searchQuery) && (
                            <Button
                                onClick={handleClearSearch}
                                disabled={isLoadingSearch || isSearchFetching}
                            >
                                Clear Search
                            </Button>
                        )}
                    </div>
                )}

                {/* VIDEO GRID */}
                {!isLoading && filteredVideos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredVideos.map((video: AdVideo) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

/* =========================
   ENHANCED VIDEO CARD
========================= */
export function VideoCard({ video }: VideoCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [thumbnail, setThumbnail] = useState<string | null>(null)
    const [showThumb, setShowThumb] = useState(true)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
        if (video.video_url) {
            generateThumbnail(
                `https://pub-7fa68a27c9094c06b1a9403bec80db5a.r2.dev/${video.video_url}`
            ).then(setThumbnail).catch(() => setThumbnail(null))
        }
    }, [video.video_url])

    const handleMouseEnter = useCallback(() => {
        if (window.innerWidth >= 768 && videoRef.current) {
            setShowThumb(false)
            setIsPlaying(true)
            videoRef.current?.play().catch(console.error)
        }
    }, [])

    const handleMouseLeave = useCallback(() => {
        if (window.innerWidth >= 768 && videoRef.current) {
            videoRef.current?.pause()
            if (videoRef.current) videoRef.current.currentTime = 0
            setShowThumb(true)
            setIsPlaying(false)
        }
    }, [])

    const handleClick = useCallback(() => {
        if (window.innerWidth < 768 && videoRef.current) {
            setShowThumb((p) => !p)
            setIsPlaying((p) => !p)
            if (videoRef.current?.paused) {
                videoRef.current.play().catch(console.error)
            } else {
                videoRef.current?.pause()
            }
        }
    }, [])

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }, [])

    return (
        <Card
            className="group relative overflow-hidden rounded-2xl border-border/50 hover:border-primary/30 transition-all duration-300 bg-card hover:shadow-xl cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {/* VIDEO CONTAINER */}
            <div className="relative aspect-[9/16] overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30">
                {/* PLAY/PAUSE INDICATOR */}
                <div className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'
                    }`}>
                    <div className={`rounded-full bg-background/80 backdrop-blur-sm p-3 transition-transform duration-300 ${isPlaying ? 'scale-0' : 'scale-100'
                        }`}>
                        {isPlaying ? (
                            <Pause className="h-6 w-6 text-foreground" />
                        ) : (
                            <Play className="h-6 w-6 text-foreground ml-0.5" />
                        )}
                    </div>
                </div>

                {/* THUMBNAIL */}
                {showThumb && thumbnail && (
                    <div className="absolute inset-0 z-10">
                        <img
                            src={thumbnail}
                            alt={video.title || 'Video thumbnail'}
                            className="h-full w-full object-cover transition-opacity duration-300"
                            onError={() => setThumbnail(null)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    </div>
                )}

                {/* VIDEO */}
                {video.video_url && (
                    <video
                        ref={videoRef}
                        src={`https://pub-7fa68a27c9094c06b1a9403bec80db5a.r2.dev/${video.video_url}`}
                        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                        playsInline
                        preload="metadata"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    />
                )}

                {/* DURATION BADGE */}
                {video.duration && (
                    <Badge
                        variant="secondary"
                        className="absolute top-3 right-3 z-20 bg-background/90 backdrop-blur text-xs font-medium border-border"
                    >
                        {formatTime(video.duration)}
                    </Badge>
                )}

                {/* VIEW COUNT BADGE */}
                <Badge
                    variant="secondary"
                    className="absolute top-3 left-3 z-20 bg-background/90 backdrop-blur text-xs font-medium border-border flex items-center gap-1.5"
                >
                    <Eye className="h-3 w-3" />
                    {(video.view_count || 0).toLocaleString()}
                </Badge>
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-3">
                {/* TITLE */}
                <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
                    {video.title || 'Untitled Video'}
                </h3>

                {/* DESCRIPTION */}
                {video.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {video.description}
                    </p>
                )}

                {/* META INFO */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        {video.advertiser?.username && (
                            <div className="flex items-center gap-1.5">
                                <User className="h-3 w-3" />
                                <span className="font-medium">@{video.advertiser.username}</span>
                            </div>
                        )}
                        {video.created_at && (
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
                            </div>
                        )}
                    </div>
                    {video.category && (
                        <Badge variant="outline" className="text-xs">
                            {video.category.name}
                        </Badge>
                    )}
                </div>

                {/* TAGS */}
                {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                        <Tag className="h-3 w-3 text-muted-foreground mt-0.5" />
                        {video.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag.id || tag.idd}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium"
                            >
                                {tag.name}
                            </span>
                        ))}
                        {video.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                                +{video.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* STATS */}
                <div className="flex items-center gap-4 pt-2 text-sm">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground">Views:</span>
                        <span className="font-semibold">{(video.view_count || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-secondary" />
                        <span className="text-muted-foreground">Comments:</span>
                        <span className="font-semibold">{video.comment_count || 0}</span>
                    </div>
                </div>
            </div>

            {/* HOVER OVERLAY */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>
    )
}