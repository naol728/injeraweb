import { fetchownad } from '@/api/ad'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Eye, MessageCircle, Clock, Calendar,
    Play, BarChart2, ShoppingBag, Tag, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Components
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdvertiserAd() {
    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ["fetchownad"],
        queryFn: fetchownad,
        // Add retry logic
        retry: 2,
        retryDelay: 1000,
    })
    // Handle undefined data case
    const ads = data?.data || []

    // Show error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Failed to load ads. {error.message}
                        </AlertDescription>
                    </Alert>
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Unable to Load Ads</h2>
                        <p className="text-muted-foreground mb-6">
                            There was a problem retrieving your ad campaigns.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => refetch()} className="gap-2">
                                <Play className="w-4 h-4" />
                                Try Again
                            </Button>
                            <Link to="/advertiser/advideo/create">
                                <Button variant="outline">
                                    Create New Ad
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">My Ad Campaigns</h1>
                    <p className="text-muted-foreground">Loading your advertising content...</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="overflow-hidden animate-pulse">
                            <div className="h-48 bg-muted" />
                            <CardContent className="p-4">
                                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                                <div className="h-4 bg-muted rounded w-full mb-4" />
                                <div className="flex gap-2">
                                    <div className="h-5 bg-muted rounded w-16" />
                                    <div className="h-5 bg-muted rounded w-16" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    // Format date to readable format
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).format(date)
        } catch (error) {
            return 'Invalid date'
        }
    }

    // Format duration from seconds to MM:SS
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Get status based on view count and recency
    const getAdStatus = (viewCount: number, createdAt: string) => {
        try {
            const createdDate = new Date(createdAt)
            const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

            if (daysAgo < 1) return { label: 'New', color: 'bg-green-500' }
            if (viewCount === 0) return { label: 'No Views', color: 'bg-yellow-500' }
            if (viewCount < 10) return { label: 'Low Views', color: 'bg-blue-500' }
            return { label: 'Active', color: 'bg-primary' }
        } catch (error) {
            return { label: 'Unknown', color: 'bg-gray-500' }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">My Ad Campaigns</h1>
                            <p className="text-muted-foreground">
                                Manage and monitor your advertising content ({ads.length} total)
                            </p>
                        </div>
                        <Link to="/advertiser/advideo/create">
                            <Button className="gap-2">
                                <Play className="w-4 h-4" />
                                Create New Ad
                            </Button>
                        </Link>
                    </div>

                    <Separator className="my-6" />
                </motion.div>

                {/* Stats Summary */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    <div className="bg-card border rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Ads</p>
                                <p className="text-2xl font-bold">{ads.length}</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Play className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Views</p>
                                <p className="text-2xl font-bold">
                                    {ads.reduce((sum: number, ad: any) => sum + (ad.view_count || 0), 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Eye className="w-5 h-5 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Comments</p>
                                <p className="text-2xl font-bold">
                                    {ads.reduce((sum: number, ad: any) => sum + (ad.comment_count || 0), 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <MessageCircle className="w-5 h-5 text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Avg. Duration</p>
                                <p className="text-2xl font-bold">
                                    {ads.length > 0
                                        ? formatDuration(Math.round(
                                            ads.reduce((sum: number, ad: any) => sum + (ad.duration || 0), 0) / ads.length
                                        ))
                                        : '0:00'
                                    }
                                </p>
                            </div>
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Clock className="w-5 h-5 text-purple-500" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Ads Grid */}
                {ads.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-16"
                    >
                        <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                            <Play className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Ads Yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Start your advertising journey by creating your first ad campaign
                        </p>
                        <Link to="/advertiser/advideo/create">
                            <Button size="lg" className="gap-2">
                                <Play className="w-4 h-4" />
                                Create Your First Ad
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ads.map((ad: any, index: number) => {
                            const status = getAdStatus(ad.view_count || 0, ad.created_at || new Date().toISOString())
                            const videoUrl = `${ad.video_url}`

                            return (
                                <motion.div
                                    key={ad.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border hover:border-primary/20">
                                        {/* Video Thumbnail */}
                                        <div className="relative aspect-video overflow-hidden bg-muted">
                                            <video
                                                src={videoUrl}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                muted
                                                playsInline
                                                preload="metadata"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Duration Badge */}
                                            <Badge className="absolute top-3 right-3 bg-black/80 text-white">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {formatDuration(ad.duration || 0)}
                                            </Badge>

                                            {/* Status Badge */}
                                            <Badge className={cn("absolute top-3 left-3 text-white border-0", status.color)}>
                                                {status.label}
                                            </Badge>

                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                    <Play className="w-8 h-8 text-white fill-white" />
                                                </div>
                                            </div>
                                        </div>

                                        <CardContent className="p-5">
                                            {/* Title */}
                                            <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                                {ad.title || 'Untitled Ad'}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {ad.description || 'No description provided'}
                                            </p>

                                            {/* Metrics */}
                                            <div className="flex items-center gap-4 text-sm mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4 text-blue-500" />
                                                    <span className="font-medium">{(ad.view_count || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle className="w-4 h-4 text-green-500" />
                                                    <span className="font-medium">{(ad.comment_count || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {ad.is_orderable ? (
                                                        <>
                                                            <ShoppingBag className="w-4 h-4 text-purple-500" />
                                                            <span className="font-medium">Orderable</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <BarChart2 className="w-4 h-4 text-orange-500" />
                                                            <span className="font-medium">Brand Ad</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tags/Info */}
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {formatDate(ad.created_at)}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    <Tag className="w-3 h-3 mr-1" />
                                                    ID: {ad.id?.substring(0, 8) || 'N/A'}
                                                </Badge>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="p-5 pt-0 flex gap-2">
                                            <Link to={`/advertiser/advideo/${ad.id}`} className="flex-1">
                                                <Button variant="outline" className="w-full" size="sm">
                                                    View Details
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="sm">
                                                <BarChart2 className="w-4 h-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {/* Pagination (if available) */}
                {data?.last_page > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled={!data?.prev_page_url}>
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: data.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={data.current_page === page ? "default" : "outline"}
                                        size="sm"
                                        className="w-8 h-8 p-0"
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" disabled={!data?.next_page_url}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}