import {
    completeWithdrawal,
    failWithdrawal,
    getWithdrawals,
    processWithdrawal,
    reviewWithdrawal,
} from "@/api/withdraw";

import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Loader2,
    MoreHorizontal,
    Wallet,
    XCircle,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { toast } from "sonner";

export default function PaymentProcess() {
    const queryClient = useQueryClient();

    /* =========================
       PAGINATION
    ========================= */

    const [page, setPage] = useState(1);

    const size = 10;

    /* =========================
       FETCH WITHDRAWALS
    ========================= */

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["getWithdrawals", page],
        queryFn: () =>
            getWithdrawals({
                page,
                size,
            }),

        placeholderData: (previousData) => previousData,
    });

    const withdrawals = data?.data?.data || [];

    const pagination = data?.data;

    /* =========================
       REVIEW
    ========================= */

    const reviewMutation = useMutation({
        mutationFn: ({
            id,
            status,
        }: {
            id: string;
            status: "approved" | "rejected";
        }) =>
            reviewWithdrawal(id, {
                status,
            }),

        onSuccess: () => {
            toast.success("Withdrawal reviewed");

            queryClient.invalidateQueries({
                queryKey: ["getWithdrawals"],
            });
        },

        onError: () => {
            toast.error("Failed to review withdrawal");
        },
    });

    /* =========================
       PROCESS
    ========================= */

    const processMutation = useMutation({
        mutationFn: (id: string) => processWithdrawal(id),

        onSuccess: () => {
            toast.success("Withdrawal moved to processing");

            queryClient.invalidateQueries({
                queryKey: ["getWithdrawals"],
            });
        },

        onError: () => {
            toast.error("Failed to process withdrawal");
        },
    });

    /* =========================
       COMPLETE
    ========================= */

    const completeMutation = useMutation({
        mutationFn: (id: string) =>
            completeWithdrawal(id, {
                processor_reference: `TX-${Date.now()}`,
                processor_notes: "Payment sent successfully",
            }),

        onSuccess: () => {
            toast.success("Withdrawal completed");

            queryClient.invalidateQueries({
                queryKey: ["getWithdrawals"],
            });
        },

        onError: () => {
            toast.error("Failed to complete withdrawal");
        },
    });

    /* =========================
       FAIL
    ========================= */

    const failMutation = useMutation({
        mutationFn: (id: string) =>
            failWithdrawal(id, {
                processor_notes: "Payment failed",
            }),

        onSuccess: () => {
            toast.success("Withdrawal failed and refunded");

            queryClient.invalidateQueries({
                queryKey: ["getWithdrawals"],
            });
        },

        onError: () => {
            toast.error("Failed to fail withdrawal");
        },
    });

    /* =========================
       STATUS UI
    ========================= */

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge
                        variant="secondary"
                        className="gap-1 px-3 py-1 rounded-full"
                    >
                        <Clock3 className="h-3 w-3" />
                        Pending
                    </Badge>
                );

            case "approved":
                return (
                    <Badge className="gap-1 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                    </Badge>
                );

            case "processing":
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 px-3 py-1 rounded-full"
                    >
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Processing
                    </Badge>
                );

            case "paid":
                return (
                    <Badge className="gap-1 px-3 py-1 rounded-full">
                        <Wallet className="h-3 w-3" />
                        Paid
                    </Badge>
                );

            case "failed":
            case "rejected":
                return (
                    <Badge
                        variant="destructive"
                        className="gap-1 px-3 py-1 rounded-full"
                    >
                        <XCircle className="h-3 w-3" />
                        {status}
                    </Badge>
                );

            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* =========================
          HEADER
      ========================= */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Payment Processing
                    </h1>

                    <p className="text-muted-foreground mt-1">
                        Manage and process withdrawal requests
                    </p>
                </div>

                <div className="flex gap-4">
                    <Card className="px-5 py-4 min-w-[150px]">
                        <div className="text-sm text-muted-foreground">
                            Total Requests
                        </div>

                        <div className="text-3xl font-bold mt-1">
                            {pagination?.total || 0}
                        </div>
                    </Card>

                    <Card className="px-5 py-4 min-w-[150px]">
                        <div className="text-sm text-muted-foreground">
                            Current Page
                        </div>

                        <div className="text-3xl font-bold mt-1">
                            {pagination?.current_page || 1}
                        </div>
                    </Card>
                </div>
            </div>

            {/* =========================
          TABLE
      ========================= */}

            <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            Withdrawal Requests
                        </CardTitle>

                        {isFetching && (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                                            <TableHead className="pl-6">
                                                Reference
                                            </TableHead>

                                            <TableHead>Account</TableHead>

                                            <TableHead>Method</TableHead>

                                            <TableHead>Amount</TableHead>

                                            <TableHead>Status</TableHead>

                                            <TableHead>Date</TableHead>

                                            <TableHead className="text-right pr-6">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {withdrawals.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-center h-40"
                                                >
                                                    No withdrawal requests found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            withdrawals.map((withdrawal: any) => (
                                                <TableRow
                                                    key={withdrawal.id}
                                                    className="hover:bg-muted/20 transition-all"
                                                >
                                                    {/* Reference */}

                                                    <TableCell className="pl-6">
                                                        <div>
                                                            <div className="font-semibold">
                                                                {
                                                                    withdrawal.withdrawal_reference
                                                                }
                                                            </div>

                                                            <div className="text-xs text-muted-foreground">
                                                                ID: {withdrawal.id.slice(0, 8)}
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Account */}

                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">
                                                                {withdrawal.account_name}
                                                            </div>

                                                            <div className="text-sm text-muted-foreground">
                                                                {
                                                                    withdrawal.account_number
                                                                }
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Method */}

                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-full uppercase"
                                                        >
                                                            {withdrawal.witdrawal_method.replace(
                                                                "_",
                                                                " ",
                                                            )}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Amount */}

                                                    <TableCell>
                                                        <div className="font-bold">
                                                            {withdrawal.amount}{" "}
                                                            {withdrawal.currency}
                                                        </div>
                                                    </TableCell>

                                                    {/* Status */}

                                                    <TableCell>
                                                        {getStatusBadge(
                                                            withdrawal.status,
                                                        )}
                                                    </TableCell>

                                                    {/* Date */}

                                                    <TableCell>
                                                        {new Date(
                                                            withdrawal.created_at,
                                                        ).toLocaleDateString()}
                                                    </TableCell>

                                                    {/* Actions */}

                                                    <TableCell className="text-right pr-6">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="rounded-full"
                                                                >
                                                                    <MoreHorizontal className="h-5 w-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent align="end">
                                                                {/* Pending */}

                                                                {withdrawal.status ===
                                                                    "pending" && (
                                                                        <>
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    reviewMutation.mutate({
                                                                                        id: withdrawal.id,
                                                                                        status:
                                                                                            "approved",
                                                                                    })
                                                                                }
                                                                            >
                                                                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                                                                Approve Request
                                                                            </DropdownMenuItem>

                                                                            <DropdownMenuItem
                                                                                className="text-red-500"
                                                                                onClick={() =>
                                                                                    reviewMutation.mutate({
                                                                                        id: withdrawal.id,
                                                                                        status:
                                                                                            "rejected",
                                                                                    })
                                                                                }
                                                                            >
                                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                                Reject Request
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}

                                                                {/* Approved */}

                                                                {withdrawal.status ===
                                                                    "approved" && (
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                processMutation.mutate(
                                                                                    withdrawal.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Loader2 className="mr-2 h-4 w-4" />
                                                                            Move to Processing
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                {/* Processing */}

                                                                {withdrawal.status ===
                                                                    "processing" && (
                                                                        <>
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    completeMutation.mutate(
                                                                                        withdrawal.id,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                                                                Mark as Paid
                                                                            </DropdownMenuItem>

                                                                            <DropdownMenuItem
                                                                                className="text-red-500"
                                                                                onClick={() =>
                                                                                    failMutation.mutate(
                                                                                        withdrawal.id,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                                Mark as Failed
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* =========================
                  PAGINATION
              ========================= */}

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t bg-muted/20">
                                <div className="text-sm text-muted-foreground">
                                    Showing page{" "}
                                    <span className="font-semibold text-foreground">
                                        {pagination?.current_page}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-foreground">
                                        {pagination?.last_page}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pagination?.prev_page_url}
                                        onClick={() =>
                                            setPage((prev) =>
                                                Math.max(prev - 1, 1),
                                            )
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!pagination?.next_page_url}
                                        onClick={() =>
                                            setPage((prev) => prev + 1)
                                        }
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}