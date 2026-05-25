import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Wallet,
    BarChart3,
    Download,
    Filter,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    ShoppingBag,
    PieChart,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
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
    PieChart as RechartsPieChart,
    Pie,
    Cell
} from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

// Dummy data for financial analytics
const revenueData = [
    { month: 'Jan', revenue: 125000, expenses: 45000, profit: 80000 },
    { month: 'Feb', revenue: 138000, expenses: 48000, profit: 90000 },
    { month: 'Mar', revenue: 156000, expenses: 52000, profit: 104000 },
    { month: 'Apr', revenue: 172000, expenses: 56000, profit: 116000 },
    { month: 'May', revenue: 189000, expenses: 61000, profit: 128000 },
    { month: 'Jun', revenue: 205000, expenses: 67000, profit: 138000 },
    { month: 'Jul', revenue: 223000, expenses: 72000, profit: 151000 },
    { month: 'Aug', revenue: 245000, expenses: 78000, profit: 167000 },
]

const transactionTypes = [
    { type: 'Advertiser Top-ups', value: 65, color: '#8884d8' },
    { type: 'Commission Fees', value: 25, color: '#82ca9d' },
    { type: 'Withdrawals', value: 8, color: '#ffc658' },
    { type: 'Refunds', value: 2, color: '#ff6b6b' },
]

const recentTransactions = [
    {
        id: 'TXN-001',
        advertiser: 'peragoo',
        type: 'Top-up',
        amount: '₦12,450',
        status: 'completed',
        date: '2024-01-15',
        method: 'TeleBirr',
    },
    {
        id: 'TXN-002',
        advertiser: 'ethio_crafts',
        type: 'Commission',
        amount: '₦2,340',
        status: 'completed',
        date: '2024-01-15',
        method: 'Platform',
    },
    {
        id: 'TXN-003',
        advertiser: 'addis_fashion',
        type: 'Withdrawal',
        amount: '₦8,450',
        status: 'pending',
        date: '2024-01-14',
        method: 'CBE Birr',
    },
    {
        id: 'TXN-004',
        advertiser: 'coffee_tradition',
        type: 'Top-up',
        amount: '₦7,890',
        status: 'completed',
        date: '2024-01-14',
        method: 'TeleBirr',
    },
    {
        id: 'TXN-005',
        advertiser: 'meseret_shop',
        type: 'Commission',
        amount: '₦1,560',
        status: 'completed',
        date: '2024-01-13',
        method: 'Platform',
    },
    {
        id: 'TXN-006',
        advertiser: 'peragoo',
        type: 'Withdrawal',
        amount: '₦15,000',
        status: 'failed',
        date: '2024-01-13',
        method: 'CBE Birr',
    },
    {
        id: 'TXN-007',
        advertiser: 'handmade_goods',
        type: 'Top-up',
        amount: '₦5,670',
        status: 'completed',
        date: '2024-01-12',
        method: 'TeleBirr',
    },
    {
        id: 'TXN-008',
        advertiser: 'local_art',
        type: 'Refund',
        amount: '₦890',
        status: 'completed',
        date: '2024-01-12',
        method: 'Platform',
    },
]

const topAdvertisersBySpend = [
    { rank: 1, name: 'peragoo', totalSpent: '₦124,500', campaigns: 45, avgOrder: '₦2,767' },
    { rank: 2, name: 'addis_fashion', totalSpent: '₦84,500', campaigns: 32, avgOrder: '₦2,641' },
    { rank: 3, name: 'ethio_crafts', totalSpent: '₦78,700', campaigns: 38, avgOrder: '₦2,071' },
    { rank: 4, name: 'coffee_tradition', totalSpent: '₦67,890', campaigns: 28, avgOrder: '₦2,424' },
    { rank: 5, name: 'meseret_shop', totalSpent: '₦54,560', campaigns: 25, avgOrder: '₦2,182' },
]

const walletBalances = [
    { advertiser: 'peragoo', balance: '₦45,670', lastTopup: '2024-01-15', status: 'active' },
    { advertiser: 'addis_fashion', balance: '₦23,450', lastTopup: '2024-01-14', status: 'active' },
    { advertiser: 'ethio_crafts', balance: '₦18,900', lastTopup: '2024-01-13', status: 'low' },
    { advertiser: 'coffee_tradition', balance: '₦12,340', lastTopup: '2024-01-12', status: 'active' },
    { advertiser: 'meseret_shop', balance: '₦8,900', lastTopup: '2024-01-10', status: 'low' },
    { advertiser: 'handmade_goods', balance: '₦5,670', lastTopup: '2024-01-08', status: 'low' },
]

const paymentMethods = [
    { method: 'TeleBirr', transactions: 1560, amount: '₦2,345,000', percentage: 65 },
    { method: 'CBE Birr', transactions: 890, amount: '₦1,234,000', percentage: 25 },
    { method: 'Other Mobile Money', transactions: 340, amount: '₦456,000', percentage: 8 },
    { method: 'Bank Transfer', transactions: 120, amount: '₦189,000', percentage: 2 },
]

const commissionStats = [
    { category: 'Food & Beverage', commission: '15%', revenue: '₦456,000', transactions: 456 },
    { category: 'Fashion & Clothing', commission: '12%', revenue: '₦389,000', transactions: 312 },
    { category: 'Arts & Crafts', commission: '10%', revenue: '₦278,000', transactions: 234 },
    { category: 'Services', commission: '20%', revenue: '₦189,000', transactions: 145 },
    { category: 'Electronics', commission: '8%', revenue: '₦156,000', transactions: 128 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border rounded-lg p-3 shadow-lg">
                <p className="font-medium">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: ₦{entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

const PaymentTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border rounded-lg p-3 shadow-lg">
                <p className="font-medium">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toLocaleString()} transactions
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default function Money() {
    const [timeRange, setTimeRange] = useState('monthly')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const filteredTransactions = recentTransactions.filter(txn => {
        const matchesSearch = txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.advertiser.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || txn.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
            case 'pending':
                return <Badge variant="default" className="bg-amber-100 text-amber-800 hover:bg-amber-100"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
            case 'failed':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getWalletStatus = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
            case 'low':
                return <Badge variant="default" className="bg-red-100 text-red-800 hover:bg-red-100">Low Balance</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Monetary Dashboard</h1>
                        <p className="text-muted-foreground">
                            Financial overview, transactions, and revenue analytics
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Today</SelectItem>
                                <SelectItem value="weekly">This Week</SelectItem>
                                <SelectItem value="monthly">This Month</SelectItem>
                                <SelectItem value="quarterly">This Quarter</SelectItem>
                                <SelectItem value="yearly">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Key Financial Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦2.45M</div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-500">+18.5%</span> from last month
                            </p>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            Platform revenue YTD
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦367,500</div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-500">+15.2%</span> from last month
                            </p>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            15% average commission rate
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Advertisers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">342</div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-500">+24</span> this month
                            </p>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            Advertisers with active campaigns
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Spend/Advertiser</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦7,165</div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-500">+12.3%</span> from last month
                            </p>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            Monthly average per advertiser
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Charts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Revenue Chart */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Revenue Overview</CardTitle>
                                    <CardDescription>
                                        Monthly revenue, expenses, and profit margins
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                                        Revenue
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                                        Expenses
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3 text-blue-500" />
                                        Profit
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="month" stroke="#6b7280" />
                                        <YAxis
                                            stroke="#6b7280"
                                            tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}K`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey="revenue"
                                            fill="#4ade80"
                                            name="Revenue"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="expenses"
                                            fill="#f87171"
                                            name="Expenses"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="profit"
                                            fill="#60a5fa"
                                            name="Profit"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transaction Types */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Distribution</CardTitle>
                                <CardDescription>Breakdown by transaction type</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center">
                                <div className="h-56 w-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={transactionTypes}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry) => `${entry.type}: ${entry.value}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                nameKey="type"
                                            >
                                                {transactionTypes.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-4 w-full">
                                    {transactionTypes.map((type, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: type.color }}
                                            />
                                            <div>
                                                <div className="text-sm font-medium">{type.type}</div>
                                                <div className="text-xs text-muted-foreground">{type.value}%</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Methods */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Methods</CardTitle>
                                <CardDescription>Transaction volume by payment method</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={paymentMethods}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="method" stroke="#6b7280" />
                                            <YAxis stroke="#6b7280" />
                                            <Tooltip content={<PaymentTooltip />} />
                                            <Legend />
                                            <Bar
                                                dataKey="transactions"
                                                fill="#8884d8"
                                                name="Transactions"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {paymentMethods.map((method, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{method.method}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold">{method.amount}</div>
                                                    <div className="text-xs text-muted-foreground">{method.transactions} txn</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Progress value={method.percentage} className="h-2 flex-1" />
                                                <span className="text-sm text-muted-foreground">{method.percentage}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                    {/* Top Advertisers */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Advertisers by Spend</CardTitle>
                            <CardDescription>Highest spending advertisers</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {topAdvertisersBySpend.map((advertiser, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                <span className="text-xs font-bold">{advertiser.rank}</span>
                                            </div>
                                            <div>
                                                <div className="font-medium">{advertiser.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {advertiser.campaigns} campaigns
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">{advertiser.totalSpent}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Avg: {advertiser.avgOrder}
                                            </div>
                                        </div>
                                    </div>
                                    {index < topAdvertisersBySpend.length - 1 && <Separator />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Wallet Balances */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5" />
                                Advertiser Wallet Balances
                            </CardTitle>
                            <CardDescription>Current wallet balances and status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {walletBalances.map((wallet, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            <span className="font-medium">{wallet.advertiser}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">{wallet.balance}</div>
                                            {getWalletStatus(wallet.status)}
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Last top-up: {wallet.lastTopup}
                                    </div>
                                    {index < walletBalances.length - 1 && <Separator />}
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full mt-2">
                                View All Wallets
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Commission Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Commission by Category</CardTitle>
                            <CardDescription>Revenue breakdown by business category</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {commissionStats.map((category, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{category.category}</span>
                                        <div className="text-right">
                                            <div className="font-semibold">{category.revenue}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {category.commission} commission • {category.transactions} txn
                                            </div>
                                        </div>
                                    </div>
                                    <Progress
                                        value={(category.transactions / 1275) * 100}
                                        className="h-2"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>All platform transactions and payments</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative">
                                <Input
                                    placeholder="Search transactions..."
                                    className="w-full sm:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>Advertiser</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">{transaction.id}</TableCell>
                                            <TableCell>{transaction.advertiser}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{transaction.type}</Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">{transaction.amount}</TableCell>
                                            <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                                            <TableCell>{transaction.date}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4" />
                                                    {transaction.method}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Financial Summary Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">
                        <PieChart className="h-4 w-4 mr-2" />
                        Financial Overview
                    </TabsTrigger>
                    <TabsTrigger value="forecast">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Revenue Forecast
                    </TabsTrigger>
                    <TabsTrigger value="analytics">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Advanced Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Performance Summary</CardTitle>
                            <CardDescription>Key financial metrics and KPIs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Gross Profit Margin</span>
                                        <Badge variant="default" className="bg-green-100 text-green-800">68.2%</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Net Profit Margin</span>
                                        <Badge variant="default" className="bg-blue-100 text-blue-800">51.3%</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Revenue Growth Rate</span>
                                        <Badge variant="default" className="bg-purple-100 text-purple-800">18.5%</Badge>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Customer Acquisition Cost</span>
                                        <span className="font-semibold">₦1,234</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Lifetime Value/Customer</span>
                                        <span className="font-semibold">₦8,456</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Return on Investment</span>
                                        <Badge variant="default" className="bg-green-100 text-green-800">285%</Badge>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Cash Flow Positive</span>
                                        <Badge variant="default" className="bg-green-100 text-green-800">Yes</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Monthly Recurring Revenue</span>
                                        <span className="font-semibold">₦245,000</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Burn Rate</span>
                                        <span className="font-semibold">₦78,000/mo</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="forecast">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Forecast</CardTitle>
                            <CardDescription>Projected revenue growth for next 6 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={[
                                            ...revenueData.slice(-3),
                                            { month: 'Sep', revenue: 268000, expenses: 85000, profit: 183000 },
                                            { month: 'Oct', revenue: 295000, expenses: 92000, profit: 203000 },
                                            { month: 'Nov', revenue: 325000, expenses: 100000, profit: 225000 },
                                            { month: 'Dec', revenue: 358000, expenses: 108000, profit: 250000 },
                                        ]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="month" stroke="#6b7280" />
                                        <YAxis
                                            stroke="#6b7280"
                                            tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}K`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#4ade80"
                                            strokeWidth={3}
                                            strokeDasharray="5 5"
                                            name="Projected Revenue"
                                            dot={{ r: 6 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="profit"
                                            stroke="#60a5fa"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            name="Projected Profit"
                                            dot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Financial Analytics</CardTitle>
                            <CardDescription>Detailed financial analysis and insights</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">Revenue Concentration</div>
                                        <Progress value={65} className="h-2" />
                                        <div className="text-xs text-muted-foreground">
                                            Top 20% advertisers generate 65% of revenue
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">Payment Success Rate</div>
                                        <Progress value={92} className="h-2" />
                                        <div className="text-xs text-muted-foreground">
                                            92% successful transactions, 8% require intervention
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-sm font-medium text-muted-foreground">Avg. Transaction Value</div>
                                            <div className="text-2xl font-bold mt-2">₦2,456</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Increased by 12% this month
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-sm font-medium text-muted-foreground">Commission Efficiency</div>
                                            <div className="text-2xl font-bold mt-2">89.5%</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Automated commission calculation
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-sm font-medium text-muted-foreground">Revenue per User</div>
                                            <div className="text-2xl font-bold mt-2">₦1,845</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                +8.5% from previous period
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}