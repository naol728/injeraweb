import { getUsersWithdrawalhistory } from '@/api/withdraw'
import { useQuery } from '@tanstack/react-query'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Badge } from '@/components/ui/badge'

import {
  Wallet,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  XCircle,
  Ban,
  Clock3,
} from 'lucide-react'

export default function WithdrawHistory() {
  const { data, isLoading, error } = useQuery({
    queryFn: getUsersWithdrawalhistory,
    queryKey: ['getUsersWithdrawalhistory'],
  })

  const withdrawals = data?.withdrawals?.data || []

  const totalWithdrawn = withdrawals.reduce(
    (acc: number, item: any) => acc + Number(item.amount),
    0
  )

  const paidWithdrawals = withdrawals.filter(
    (item: any) => item.status === 'paid'
  ).length

  const cancelledWithdrawals = withdrawals.filter(
    (item: any) => item.status === 'cancelled'
  ).length

  const rejectedWithdrawals = withdrawals.filter(
    (item: any) => item.status === 'rejected'
  ).length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500 hover:bg-green-500 rounded-full px-4 py-1">
            <CheckCircle2 className="size-3 mr-1" />
            Paid
          </Badge>
        )

      case 'cancelled':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-500 rounded-full px-4 py-1">
            <Clock3 className="size-3 mr-1" />
            Cancelled
          </Badge>
        )

      case 'rejected':
        return (
          <Badge className="bg-red-500 hover:bg-red-500 rounded-full px-4 py-1">
            <XCircle className="size-3 mr-1" />
            Rejected
          </Badge>
        )

      default:
        return (
          <Badge className="rounded-full px-4 py-1">
            {status}
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-3xl bg-muted animate-pulse"
            />
          ))}
        </div>

        <div className="h-[450px] rounded-3xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="rounded-3xl border-red-500/20 shadow-md">
        <CardContent className="py-14 flex flex-col items-center justify-center text-center">
          <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Ban className="size-8 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-red-500">
            Failed to Load Withdrawals
          </h2>

          <p className="text-muted-foreground mt-2">
            Something went wrong while loading withdrawal history.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Withdrawal History
        </h2>

        <p className="text-muted-foreground">
          Track all your withdrawal requests and payment statuses.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* TOTAL */}
        <Card className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-primary/10 to-background">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Withdrawn
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {totalWithdrawn} ETB
              </h2>
            </div>

            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Wallet className="size-7 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* PAID */}
        <Card className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-green-500/10 to-background">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Paid
              </p>

              <h2 className="text-3xl font-bold mt-2 text-green-600">
                {paidWithdrawals}
              </h2>
            </div>

            <div className="size-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="size-7 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* CANCELLED */}
        <Card className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-yellow-500/10 to-background">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Cancelled
              </p>

              <h2 className="text-3xl font-bold mt-2 text-yellow-600">
                {cancelledWithdrawals}
              </h2>
            </div>

            <div className="size-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
              <Clock3 className="size-7 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        {/* REJECTED */}
        <Card className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-red-500/10 to-background">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Rejected
              </p>

              <h2 className="text-3xl font-bold mt-2 text-red-600">
                {rejectedWithdrawals}
              </h2>
            </div>

            <div className="size-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <XCircle className="size-7 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="rounded-3xl border-0 shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl">
            Recent Withdrawals
          </CardTitle>

          <CardDescription>
            Detailed history of all your withdrawal transactions.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-6">
                    Reference
                  </TableHead>

                  <TableHead>
                    Method
                  </TableHead>

                  <TableHead>
                    Account
                  </TableHead>

                  <TableHead>
                    Amount
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead>
                    Created
                  </TableHead>

                  <TableHead className="pr-6">
                    Processor Ref
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {withdrawals.length > 0 ? (
                  withdrawals.map((withdrawal: any) => (
                    <TableRow
                      key={withdrawal.id}
                      className="hover:bg-muted/30 transition"
                    >
                      {/* REF */}
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center">
                            <ArrowUpRight className="size-5 text-primary" />
                          </div>

                          <div>
                            <p className="font-semibold">
                              {withdrawal.withdrawal_reference}
                            </p>

                            <p className="text-xs text-muted-foreground mt-1">
                              {withdrawal.currency}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* METHOD */}
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="rounded-full capitalize"
                        >
                          <CreditCard className="size-3 mr-1" />
                          {withdrawal.witdrawal_method.replace(
                            '_',
                            ' '
                          )}
                        </Badge>
                      </TableCell>

                      {/* ACCOUNT */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {withdrawal.account_name}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {withdrawal.account_number}
                          </span>
                        </div>
                      </TableCell>

                      {/* AMOUNT */}
                      <TableCell>
                        <span className="font-bold text-lg">
                          {withdrawal.amount} ETB
                        </span>
                      </TableCell>

                      {/* STATUS */}
                      <TableCell>
                        {getStatusBadge(withdrawal.status)}
                      </TableCell>

                      {/* CREATED */}
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="size-4" />

                          <span>
                            {new Date(
                              withdrawal.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>

                      {/* PROCESSOR REF */}
                      <TableCell className="pr-6">
                        {withdrawal.processor_reference ? (
                          <span className="text-sm font-medium text-muted-foreground">
                            {withdrawal.processor_reference}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-52 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="size-20 rounded-full bg-muted flex items-center justify-center">
                          <Wallet className="size-10 text-muted-foreground" />
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold">
                            No Withdrawals Yet
                          </h3>

                          <p className="text-muted-foreground mt-2">
                            Your withdrawal history will appear here.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}