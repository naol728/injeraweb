import React from 'react'

import { getAdvertiserTransaction } from "@/api/wallet"
import { useQuery } from '@tanstack/react-query'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"

import { Separator } from "@/components/ui/separator"

import {
    Wallet,
    ArrowDownCircle,
    CheckCircle2,
    CalendarDays,
    Receipt,
    CreditCard,
    TrendingUp,
} from "lucide-react"

export default function Transactions() {
    const { data, error, isLoading } = useQuery({
        queryFn: getAdvertiserTransaction,
        queryKey: ["getAdvertiserTransaction"]
    })

    const deposits = data?.deposits?.data || []

    const totalDeposits = deposits.reduce(
        (acc: number, item: any) => acc + Number(item.amount),
        0
    )

    const successfulTransactions = deposits.filter(
        (item: any) => item.status === "success"
    ).length

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-36 rounded-3xl bg-muted animate-pulse"
                        />
                    ))}
                </div>

                <div className="h-[500px] rounded-3xl bg-muted animate-pulse" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-[70vh] flex items-center justify-center p-6">
                <Card className="max-w-md w-full border-red-500/20 shadow-lg rounded-3xl">
                    <CardContent className="p-10 text-center">
                        <div className="mx-auto mb-5 size-16 rounded-full bg-red-500/10 flex items-center justify-center">
                            <Receipt className="size-8 text-red-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-red-500">
                            Failed to Load Transactions
                        </h2>

                        <p className="text-muted-foreground mt-3">
                            Something went wrong while loading your transaction history.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/20">
            <div className="p-4 md:p-8 space-y-8">

                {/* HEADER */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Transactions
                    </h1>

                    <p className="text-muted-foreground text-base">
                        View and manage your advertiser deposit history and payment activity.
                    </p>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* TOTAL DEPOSIT */}
                    <Card className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Deposits
                                </p>

                                <h2 className="text-4xl font-bold mt-2">
                                    ${totalDeposits}
                                </h2>

                                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                    <TrendingUp className="size-4" />
                                    Wallet growth
                                </p>
                            </div>

                            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Wallet className="size-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* SUCCESSFUL */}
                    <Card className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-green-500/10 via-green-500/5 to-background">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Successful Payments
                                </p>

                                <h2 className="text-4xl font-bold mt-2 text-green-600">
                                    {successfulTransactions}
                                </h2>

                                <p className="text-sm text-muted-foreground mt-2">
                                    Verified completed deposits
                                </p>
                            </div>

                            <div className="size-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                <CheckCircle2 className="size-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* TRANSACTIONS */}
                    <Card className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Transactions
                                </p>

                                <h2 className="text-4xl font-bold mt-2 text-orange-600">
                                    {deposits.length}
                                </h2>

                                <p className="text-sm text-muted-foreground mt-2">
                                    Payment records available
                                </p>
                            </div>

                            <div className="size-16 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                                <CreditCard className="size-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* TABLE */}
                <Card className="rounded-3xl border-0 shadow-xl overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl">
                            Deposit History
                        </CardTitle>

                        <CardDescription>
                            Complete advertiser deposit transaction records.
                        </CardDescription>
                    </CardHeader>

                    <Separator />

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="pl-6">
                                            Transaction
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
                                            Updated
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {deposits.length > 0 ? (
                                        deposits.map((transaction: any) => (
                                            <TableRow
                                                key={transaction.id}
                                                className="hover:bg-muted/30 transition"
                                            >
                                                {/* TX REF */}
                                                <TableCell className="pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center">
                                                            <ArrowDownCircle className="size-5 text-primary" />
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold">
                                                                {transaction.tx_ref}
                                                            </p>

                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                ID: {transaction.id.slice(0, 10)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* AMOUNT */}
                                                <TableCell>
                                                    <span className="font-bold text-green-600 text-lg">
                                                        ${transaction.amount}
                                                    </span>
                                                </TableCell>

                                                {/* STATUS */}
                                                <TableCell>
                                                    <Badge
                                                        className={`
                                                            rounded-full px-4 py-1 text-white
                                                            ${transaction.status === "success"
                                                                ? "bg-green-500 hover:bg-green-500"
                                                                : "bg-yellow-500 hover:bg-yellow-500"
                                                            }
                                                        `}
                                                    >
                                                        {transaction.status}
                                                    </Badge>
                                                </TableCell>

                                                {/* CREATED */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <CalendarDays className="size-4" />

                                                        <span>
                                                            {new Date(
                                                                transaction.created_at
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* UPDATED */}
                                                <TableCell className="pr-6">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <CalendarDays className="size-4" />

                                                        <span>
                                                            {new Date(
                                                                transaction.updated_at
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-52 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="size-20 rounded-full bg-muted flex items-center justify-center">
                                                        <Wallet className="size-10 text-muted-foreground" />
                                                    </div>

                                                    <div>
                                                        <h3 className="text-xl font-semibold">
                                                            No Transactions Yet
                                                        </h3>

                                                        <p className="text-muted-foreground mt-2">
                                                            Your deposit history will appear here once payments are made.
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
        </div>
    )
}