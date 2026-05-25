import { SystemBalance } from '@/api/admin'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  History,
} from 'lucide-react'

const COLORS = ['#22c55e', '#ef4444']

export default function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['SystemBalance'],
    queryFn: SystemBalance,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse h-32" />
        ))}
      </div>
    )
  }

  const summary = data?.summary
  const charts = data?.charts
  const history = data?.history || []

  const pieData = [
    {
      name: 'Deposit',
      value: charts?.deposit_withdraw_pie?.values?.[0] || 0,
    },
    {
      name: 'Withdrawal',
      value: charts?.deposit_withdraw_pie?.values?.[1] || 0,
    },
  ]

  const depositFlow = charts?.daily_flow?.deposit_by_day || []
  const withdrawFlow = charts?.daily_flow?.withdraw_by_day || []

  const flowMap = new Map()

  depositFlow.forEach((item: any) => {
    flowMap.set(item.date, {
      date: item.date,
      deposit: item.total,
      withdraw: 0,
    })
  })

  withdrawFlow.forEach((item: any) => {
    if (flowMap.has(item.date)) {
      flowMap.get(item.date).withdraw = item.total
    } else {
      flowMap.set(item.date, {
        date: item.date,
        deposit: 0,
        withdraw: item.total,
      })
    }
  })

  const flowData = Array.from(flowMap.values())

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor system balance, deposits, withdrawals, and activity.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h2 className="text-3xl font-bold mt-2">
                {summary?.total_users}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-muted">
              <Users className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Deposit</p>
              <h2 className="text-3xl font-bold mt-2">
                ${summary?.total_deposit}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
              <ArrowDownCircle className="size-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Withdraw</p>
              <h2 className="text-3xl font-bold mt-2">
                ${summary?.total_withdraw}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
              <ArrowUpCircle className="size-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Rewards</p>
              <h2 className="text-3xl font-bold mt-2">
                ${summary?.total_reward}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
              <Wallet className="size-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-primary/30">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">System Balance</p>
              <h2 className="text-3xl font-bold mt-2 text-primary">
                ${summary?.system_balance}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-primary/10">
              <Wallet className="size-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Deposit vs Withdrawal</CardTitle>
            <CardDescription>
              Distribution of deposits and withdrawals.
            </CardDescription>
          </CardHeader>

          <CardContent className="h-[320px]">
            <ChartContainer
              config={{
                deposit: {
                  label: 'Deposit',
                  color: '#22c55e',
                },
                withdrawal: {
                  label: 'Withdrawal',
                  color: '#ef4444',
                },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    label
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-green-500" />
                <span>
                  Deposit (
                  {
                    charts?.deposit_withdraw_pie?.percentages?.deposit
                  }
                  %)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-500" />
                <span>
                  Withdrawal (
                  {
                    charts?.deposit_withdraw_pie?.percentages?.withdrawal
                  }
                  %)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Area Chart */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Daily Flow</CardTitle>
            <CardDescription>
              Daily deposits and withdrawals overview.
            </CardDescription>
          </CardHeader>

          <CardContent className="h-[320px]">
            <ChartContainer
              config={{
                deposit: {
                  label: 'Deposit',
                  color: '#22c55e',
                },
                withdraw: {
                  label: 'Withdraw',
                  color: '#ef4444',
                },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={flowData}>
                  <CartesianGrid vertical={false} />

                  <XAxis dataKey="date" />
                  <YAxis />

                  <ChartTooltip content={<ChartTooltipContent />} />

                  <Area
                    type="monotone"
                    dataKey="deposit"
                    stroke="#22c55e"
                    fill="#22c55e33"
                  />

                  <Area
                    type="monotone"
                    dataKey="withdraw"
                    stroke="#ef4444"
                    fill="#ef444433"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="size-5" />
            <CardTitle>Balance History</CardTitle>
          </div>
          <CardDescription>
            Latest system balance activities.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Before</TableHead>
                <TableHead>After</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {history.length > 0 ? (
                history.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="capitalize">
                      {item.movement_type}
                    </TableCell>
                    <TableCell>${item.amount}</TableCell>
                    <TableCell>{item.source_type}</TableCell>
                    <TableCell>${item.balance_before}</TableCell>
                    <TableCell>${item.balance_after}</TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-10"
                  >
                    No history available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
