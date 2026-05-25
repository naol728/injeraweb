import { getAnalyticsAdvertiser } from "@/api/analytics"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    BarChart3,
    Eye,
    MessageCircle,
    ShoppingCart,
    DollarSign,
    Megaphone,
    TrendingUp,
    Calendar,
    Activity,
    Sparkles,
} from "lucide-react"

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    AreaChart,
    Area,
    BarChart,
    Bar,
} from "recharts"
import { useAppSelector } from "@/store/hook"

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, unit = "" }: any) => {
    if (active && payload && payload.length) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-background border rounded-lg shadow-lg p-3 px-4"
            >
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-lg font-bold">
                    {payload[0].value.toLocaleString()}{unit}
                </p>
            </motion.div>
        )
    }
    return null
}

// Stat card with animation
const StatCard = ({ title, value, icon: Icon, delay }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
        >
            <Card className="rounded-2xl shadow-sm border hover:shadow-md transition-shadow duration-300 overflow-hidden group">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                {title}
                            </p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: delay + 0.2, duration: 0.3 }}
                                className="text-3xl font-bold mt-2 tracking-tight"
                            >
                                {typeof value === 'number' ? value.toLocaleString() : value}
                            </motion.p>
                        </div>

                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Icon className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// Chart card wrapper with animation
const ChartCard = ({ title, description, children, delay }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <Card className="rounded-2xl shadow-sm border hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[320px] w-full">
                        {children}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default function Index() {
    const { data, isLoading, error } = useQuery({
        queryFn: getAnalyticsAdvertiser,
        queryKey: ["getAnalyticsAdvertiser"],
    })
    const user = useAppSelector((state) => state.auth.user)

    // Loading state with skeleton animation
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
                <div className="mb-8">
                    <Skeleton className="h-10 w-64 rounded-lg" />
                    <Skeleton className="h-4 w-96 mt-2 rounded-lg" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <div className="grid gap-6 mt-6 lg:grid-cols-2">
                    <Skeleton className="h-[400px] rounded-2xl" />
                    <Skeleton className="h-[400px] rounded-2xl" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 flex items-center justify-center"
            >
                <Card className="max-w-md w-full border-red-500/20 shadow-lg">
                    <CardContent className="p-8 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                            <BarChart3 className="h-8 w-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Failed to Load Analytics</h2>
                        <p className="text-muted-foreground">
                            Please refresh the page or try again later.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    const analytics = data

    const stats = [
        { title: "Total Ads", value: analytics?.total_ads || 0, icon: Megaphone },
        { title: "Total Views", value: analytics?.total_views || 0, icon: Eye },
        { title: "Comments", value: analytics?.total_comments || 0, icon: MessageCircle },
        { title: "Orders", value: analytics?.total_orders || 0, icon: ShoppingCart },
    ]

    const chartData =
        analytics?.series?.map((item: any) => ({
            ...item,
            shortDate: new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
        })) || []

    const hasData = analytics?.total_views > 0 || analytics?.total_orders > 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="p-6 lg:p-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            Welcome back, {user?.username || 'Advertiser'} 👋
                        </h1>
                    </div>
                    <p className="text-muted-foreground ml-12">
                        Here's what's happening with your campaigns today.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            delay={index * 0.1}
                        />
                    ))}
                </div>

                <AnimatePresence>
                    {hasData ? (
                        <>
                            {/* Charts Grid */}
                            <div className="grid gap-6 mt-6 lg:grid-cols-2">
                                {/* Views Area Chart */}
                                <ChartCard
                                    title="Views Analytics"
                                    description="Daily advertisement views trend"
                                    delay={0.2}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="shortDate" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="views"
                                                stroke="currentColor"
                                                fill="url(#viewsGradient)"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                {/* Revenue Line Chart */}
                                <ChartCard
                                    title="Revenue Analytics"
                                    description="Daily generated revenue"
                                    delay={0.3}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="shortDate" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                            <Tooltip content={<CustomTooltip unit="$" />} />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                                dot={{ r: 4, strokeWidth: 2 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            {/* Bottom Charts */}
                            <div className="grid gap-6 mt-6 lg:grid-cols-2">
                                {/* Orders Bar Chart */}
                                <ChartCard
                                    title="Orders"
                                    description="Orders generated from advertisements"
                                    delay={0.4}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="shortDate" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar
                                                dataKey="orders"
                                                radius={[8, 8, 0, 0]}
                                                fill="currentColor"
                                                className="fill-primary"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                {/* Comments Line Chart */}
                                <ChartCard
                                    title="Comments Engagement"
                                    description="User engagement and feedback on ads"
                                    delay={0.5}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="shortDate" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line
                                                type="monotone"
                                                dataKey="comments"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                                dot={{ r: 4, strokeWidth: 2 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>
                        </>
                    ) : (
                        // Empty State with Animation
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="mt-6"
                        >
                            <Card className="rounded-2xl border-dashed border-primary/20 shadow-sm">
                                <CardContent className="py-20 flex flex-col items-center justify-center text-center">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                        className="relative"
                                    >
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                                        <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                            <BarChart3 className="h-12 w-12 text-primary" />
                                        </div>
                                    </motion.div>

                                    <motion.h2
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-2xl font-semibold"
                                    >
                                        No analytics yet
                                    </motion.h2>

                                    <motion.p
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="text-muted-foreground mt-2 max-w-md"
                                    >
                                        Your analytics will appear here once your ads start getting views, comments, and orders.
                                    </motion.p>

                                    <motion.div
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="mt-6"
                                    >
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Activity className="h-4 w-4" />
                                            <span>Waiting for data...</span>
                                        </div>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-center text-xs text-muted-foreground"
                >
                    <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Data updates in real-time</span>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}