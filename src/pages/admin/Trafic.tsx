/*eslint-disable*/
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  Calendar,
  Download,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle2,
  Server,
  Database,
  Wallet,
  Gamepad2,
  Award,
  User,
  RotateCw,
  Video,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useQuery } from '@tanstack/react-query'
import { fetchAnalytics } from '@/api/admin'

// Helper function to format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Helper to format response time
const formatResponseTime = (seconds: number) => {
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`
  return `${seconds.toFixed(2)}s`
}

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label, unit = 'requests' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-sm">{label}</p>
        {payload.map((p: any, idx: number) => (
          <p key={idx} className="text-sm" style={{ color: p.color }}>
            {p.name}: {p.value.toLocaleString()} {unit}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Stat Card Component
const StatCard = ({ title, value, description, icon: Icon, trend, trendValue, color = "blue", isLoading }: any) => {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20",
    green: "from-green-500/10 to-green-600/5 border-green-500/20",
    orange: "from-orange-500/10 to-orange-600/5 border-orange-500/20",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20",
    red: "from-red-500/10 to-red-600/5 border-red-500/20",
    cyan: "from-cyan-500/10 to-cyan-600/5 border-cyan-500/20",
  }

  const iconColors = {
    blue: "text-blue-500",
    green: "text-green-500",
    orange: "text-orange-500",
    purple: "text-purple-500",
    red: "text-red-500",
    cyan: "text-cyan-500",
  }

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm overflow-hidden`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconColors[color]}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <>
            <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Endpoint icon mapper
const getEndpointIcon = (endpoint: string) => {
  if (endpoint.includes('wallet')) return <Wallet className="h-4 w-4" />
  if (endpoint.includes('game')) return <Gamepad2 className="h-4 w-4" />
  if (endpoint.includes('points')) return <Award className="h-4 w-4" />
  if (endpoint.includes('me') || endpoint.includes('profile')) return <User className="h-4 w-4" />
  if (endpoint.includes('spin')) return <RotateCw className="h-4 w-4" />
  if (endpoint.includes('video')) return <Video className="h-4 w-4" />
  return <Activity className="h-4 w-4" />
}

export default function Traffic() {
  // Fetch all analytics data
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => fetchAnalytics("overview"),
  })

  const { data: topEndpoints, isLoading: topEndpointsLoading } = useQuery({
    queryKey: ["analytics", "top-endpoints"],
    queryFn: () => fetchAnalytics("topEndpoints"),
  })

  const { data: topEndpointsMethod, isLoading: topEndpointsMethodLoading } = useQuery({
    queryKey: ["analytics", "top-endpoints-method"],
    queryFn: () => fetchAnalytics("topEndpointsMethod"),
  })

  const { data: traffic, isLoading: trafficLoading } = useQuery({
    queryKey: ["analytics", "traffic"],
    queryFn: () => fetchAnalytics("traffic"),
  })

  const { data: avgResponse, isLoading: avgResponseLoading } = useQuery({
    queryKey: ["analytics", "avg-response"],
    queryFn: () => fetchAnalytics("avgResponse"),
  })

  const { data: errors, isLoading: errorsLoading } = useQuery({
    queryKey: ["analytics", "errors"],
    queryFn: () => fetchAnalytics("errors"),
  })

  const { data: slowEndpoints, isLoading: slowEndpointsLoading } = useQuery({
    queryKey: ["analytics", "slow-endpoints"],
    queryFn: () => fetchAnalytics("slowEndpoints"),
  })

  // Prepare traffic data for charts (format dates)
  const trafficData = React.useMemo(() => {
    if (!traffic) return []
    return traffic.map((item: any) => ({
      ...item,
      formattedDate: formatDate(item.date),
      displayDate: item.date
    }))
  }, [traffic])

  // Calculate totals for pie chart (GET vs POST)
  const methodStats = React.useMemo(() => {
    if (!topEndpointsMethod) return { get: 0, post: 0 }
    const getTotal = topEndpointsMethod
      .filter((item: any) => item.method === 'GET')
      .reduce((sum: number, item: any) => sum + item.total_requests, 0)
    const postTotal = topEndpointsMethod
      .filter((item: any) => item.method === 'POST')
      .reduce((sum: number, item: any) => sum + item.total_requests, 0)
    return [
      { name: 'GET', value: getTotal, color: '#10b981' },
      { name: 'POST', value: postTotal, color: '#f59e0b' }
    ]
  }, [topEndpointsMethod])
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  // Calculate request distribution for pie chart
  const endpointDistribution = React.useMemo(() => {
    if (!topEndpoints) return []
    return topEndpoints.slice(0, 6).map((item: any, idx: number) => ({
      name: item.endpoint.split('/').pop(),
      value: item.total_requests,
      color: COLORS[idx % COLORS.length]
    }))
  }, [topEndpoints])


  const isLoading = overviewLoading || topEndpointsLoading || trafficLoading || avgResponseLoading || topEndpointsMethodLoading || slowEndpointsLoading


  if (isLoading) return <div>Loading</div>
  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your API traffic, performance metrics, and user activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            Live
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={overview?.total_requests || 0}
          description="All time API requests"
          icon={Eye}
          trend="up"
          trendValue="+12% from last week"
          color="blue"
          isLoading={overviewLoading}
        />
        <StatCard
          title="Today's Requests"
          value={overview?.today_requests || 0}
          description="Requests in the last 24 hours"
          icon={Calendar}
          color="green"
          isLoading={overviewLoading}
        />
        <StatCard
          title="Avg Response Time"
          value={formatResponseTime(overview?.avg_response_time || 0)}
          description="Average API response time"
          icon={Clock}
          trend={overview?.avg_response_time < 0.5 ? 'down' : 'up'}
          trendValue={overview?.avg_response_time < 0.5 ? 'Excellent' : 'Needs improvement'}
          color="cyan"
          isLoading={overviewLoading}
        />
        <StatCard
          title="Error Rate"
          value={errors?.error_rate_percent === 0 ? '0%' : `${errors?.error_rate_percent}%`}
          description="Requests with errors"
          icon={AlertCircle}
          color="green"
          isLoading={errorsLoading}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Traffic Trend Chart */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
                <CardDescription>Daily API request volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="formattedDate"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip content={<CustomTooltip unit="requests" />} />
                      <Area
                        type="monotone"
                        dataKey="total_requests"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorRequests)"
                        name="Requests"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Request Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Request Distribution</CardTitle>
                <CardDescription>Top endpoints by volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={endpointDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {endpointDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* GET vs POST */}
            <Card>
              <CardHeader>
                <CardTitle>HTTP Methods</CardTitle>
                <CardDescription>GET vs POST request breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={methodStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {methodStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Endpoints Bar Chart */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Most Requested Endpoints</CardTitle>
                <CardDescription>Top 10 endpoints by request volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topEndpoints}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" stroke="#888888" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="endpoint"
                        stroke="#888888"
                        fontSize={12}
                        tickFormatter={(value) => value.split('/').pop()}
                        width={100}
                      />
                      <Tooltip />
                      <Bar dataKey="total_requests" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Requests" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Endpoints with Methods Table */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Endpoint Details</CardTitle>
                <CardDescription>Complete breakdown with HTTP methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-sm">
                    <div className="col-span-6">Endpoint</div>
                    <div className="col-span-2">Method</div>
                    <div className="col-span-2 text-right">Requests</div>
                    <div className="col-span-2 text-right">% of Total</div>
                  </div>
                  <div className="divide-y">
                    {topEndpointsMethod?.slice(0, 15).map((item: any, idx: number) => {
                      const percentage = ((item.total_requests / (overview?.total_requests || 1)) * 100).toFixed(1)
                      return (
                        <div key={idx} className="grid grid-cols-12 gap-4 p-4 text-sm items-center hover:bg-muted/30 transition-colors">
                          <div className="col-span-6 font-mono text-xs flex items-center gap-2">
                            {getEndpointIcon(item.endpoint)}
                            {item.endpoint}
                          </div>
                          <div className="col-span-2">
                            <Badge variant={item.method === 'GET' ? 'default' : 'secondary'} className="text-xs">
                              {item.method}
                            </Badge>
                          </div>
                          <div className="col-span-2 text-right font-semibold">
                            {item.total_requests.toLocaleString()}
                          </div>
                          <div className="col-span-2 text-right text-muted-foreground">
                            {percentage}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Slow Endpoints */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Slowest Endpoints</CardTitle>
                <CardDescription>Endpoints with highest average response time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={slowEndpoints}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        type="number"
                        stroke="#888888"
                        fontSize={12}
                        tickFormatter={(value) => formatResponseTime(value)}
                      />
                      <YAxis
                        type="category"
                        dataKey="endpoint"
                        stroke="#888888"
                        fontSize={12}
                        width={120}
                      />
                      <Tooltip
                        formatter={(value: number) => formatResponseTime(value)}
                        labelFormatter={(label) => `Endpoint: ${label}`}
                      />
                      <Bar dataKey="avg_time" fill="#ef4444" radius={[0, 4, 4, 0]} name="Avg Response Time">
                        {slowEndpoints?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.avg_time > 1 ? '#ef4444' : '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* All Endpoints Performance */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>All Endpoints Performance</CardTitle>
                <CardDescription>Average response time by endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {avgResponse?.slice(0, 15).map((item: any, idx: number) => {
                    const maxTime = Math.max(...(avgResponse?.map((i: any) => i.avg_time) || [1]))
                    const percentage = (item.avg_time / maxTime) * 100
                    const isSlow = item.avg_time > 1
                    const isMedium = item.avg_time > 0.5
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 font-mono text-xs">
                            {getEndpointIcon(item.endpoint)}
                            {item.endpoint}
                          </div>
                          <span className={`font-semibold ${isSlow ? 'text-red-500' : isMedium ? 'text-yellow-500' : 'text-green-500'}`}>
                            {formatResponseTime(item.avg_time)}
                          </span>
                        </div>
                        <Progress
                          value={percentage}
                          className={`h-2 ${isSlow ? 'bg-red-500/20' : isMedium ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}
                          indicatorClassName={isSlow ? 'bg-red-500' : isMedium ? 'bg-yellow-500' : 'bg-green-500'}
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Detailed Traffic Chart */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Traffic Timeline</CardTitle>
                <CardDescription>Detailed request volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="formattedDate"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip unit="requests" />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total_requests"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Daily Requests"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Summary</CardTitle>
                <CardDescription>Key metrics from traffic data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Peak Day</span>
                    <div className="text-right">
                      <div className="font-semibold">
                        {trafficData?.reduce((max: any, item: any) =>
                          item.total_requests > (max?.total_requests || 0) ? item : max, {}
                        )?.formattedDate || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trafficData?.reduce((max: any, item: any) =>
                          Math.max(max, item.total_requests), 0
                        ).toLocaleString()} requests
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Daily</span>
                    <div className="font-semibold">
                      {(trafficData?.reduce((sum: number, item: any) => sum + item.total_requests, 0) / (trafficData?.length || 1)).toFixed(0).toLocaleString()} requests
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Days Tracked</span>
                    <div className="font-semibold">{trafficData?.length || 0} days</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>API performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Error Rate</span>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      {errors?.error_rate_percent === 0 ? 'Perfect' : `${errors?.error_rate_percent}%`}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-cyan-500" />
                      <span className="text-sm">Avg Response</span>
                    </div>
                    <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                      {formatResponseTime(overview?.avg_response_time || 0)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Uptime</span>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      99.99%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}