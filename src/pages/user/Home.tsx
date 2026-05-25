import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, useCallback } from "react";
import { VideoCard } from "@/components/user/VideoCard";
import { fetchAdFeed } from "@/api/feed";
import { cn } from "@/lib/utils";
import { Loading } from "@/components/Loading";

interface Video {
    id: string;
    title: string;
    video_url: string;
    view_count: number;
    comment_count: number;
    duration: number;
    created_at: string;
    advertiser: {
        id: string;
        username: string;
        profile_picture?: string;
    };
    category: {
        name: string;
    };
    tags?: Array<{
        name: string;
    }>;
}

interface FetchAdsResponse {
    data: Video[];
    next_cursor: string | null;
    has_more: boolean;
}

export default function Home() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        isLoading,
        isError,
        error,
    } = useInfiniteQuery<FetchAdsResponse, Error>({
        queryKey: ["videos"],
        initialPageParam: null as string | null,
        queryFn: ({ pageParam }) => fetchAdFeed({ cursor: pageParam }),
        getNextPageParam: (lastPage) =>
            lastPage.has_more ? lastPage.next_cursor : undefined,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    const [activeIndex, setActiveIndex] = useState(0);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef();

    // Handle scroll with debouncing
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        setIsScrolling(true);

        const scrollTop = containerRef.current.scrollTop;
        const windowHeight = window.innerHeight;
        const index = Math.round(scrollTop / windowHeight);
        setActiveIndex(index);

        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 100);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    // Fetch next page when intersecting
    useEffect(() => {
        if (!loadMoreRef.current || !hasNextPage || isScrolling) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !isScrolling) {
                    fetchNextPage();
                }
            },
            {
                threshold: 0.5,
                root: containerRef.current,
                rootMargin: "200px" // Load earlier to prevent empty space
            }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, isScrolling]);

    // Add scroll event listener
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Flatten all videos from pages
    const allVideos = data?.pages.flatMap((page) => page.data) || [];

    // Prefetch when near the end
    useEffect(() => {
        if (allVideos.length === 0 || !hasNextPage || isFetchingNextPage) return;

        // Prefetch when we're 3 videos from the end
        if (activeIndex >= allVideos.length - 3 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [activeIndex, allVideos.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Auto-play current video
    useEffect(() => {
        if (isScrolling) return;

        // You might want to dispatch an event or update context for VideoCard to handle
        // This is where you'd signal which video should be playing
    }, [activeIndex, isScrolling]);

    // Loading state
    if (isLoading && !data) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center h-screen bg-background text-foreground">
                <div className="relative">
                    <Loading />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-16 w-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                </div>
                <p className="text-muted-foreground animate-pulse">Loading videos...</p>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-4">
                <div className="text-center max-w-md">
                    <div className="text-destructive text-4xl mb-4">⚠️</div>
                    <p className="text-destructive text-lg font-medium mb-2">
                        Failed to load videos
                    </p>
                    <p className="text-muted-foreground mb-6">
                        {error?.message || "Please check your connection and try again"}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => fetchNextPage()}
                            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
                        >
                            Load More
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No videos state
    if (allVideos.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-6">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-6">📺</div>
                    <p className="text-xl font-medium mb-3">No videos available yet</p>
                    <p className="text-muted-foreground mb-8">
                        Be the first to upload content or check back later for new videos
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "h-screen w-full overflow-y-scroll snap-y snap-mandatory",
                "bg-background text-foreground relative scroll-smooth",
                "scrollbar-none" // Add custom scrollbar hiding
            )}
            style={{
                scrollBehavior: 'smooth',
            }}
        >
            {/* Videos */}
            {allVideos.map((video, index) => (
                <div
                    key={`${video.id}-${index}`}
                    className="snap-center h-screen relative"
                    data-video-index={index}
                    data-video-id={video.id}
                >
                    <VideoCard
                        v={video}
                        index={index}
                        activeIndex={activeIndex}
                    />
                </div>
            ))}

            {/* Load more trigger */}
            {hasNextPage && (
                <div
                    ref={loadMoreRef}
                    className="min-h-[50vh] w-full flex justify-center items-center py-12"
                >
                    <div className="text-center">
                        {isFetchingNextPage ? (
                            <>
                                <div className="h-12 w-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-sm text-muted-foreground">
                                    Loading more videos...
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {allVideos.length} videos loaded so far
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="h-2 w-24 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                                    <div className="h-full w-1/2 bg-primary animate-pulse" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Scroll down for more videos
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {allVideos.length} videos loaded
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* No more videos message */}
            {!hasNextPage && allVideos.length > 0 && (
                <div className="h-[50vh] w-full flex justify-center items-center py-12">
                    <div className="text-center max-w-md px-4">
                        <div className="text-4xl mb-4">🎉</div>
                        <p className="text-lg font-medium mb-2">You've reached the end!</p>
                        <p className="text-sm text-muted-foreground mb-6">
                            You've watched all available videos. Check back later for new content.
                        </p>

                    </div>
                </div>
            )}



            {/* Loading overlay when fetching next page */}
            {isFetchingNextPage && (
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Loading more...
                    </div>
                </div>
            )}
        </div>
    );
}