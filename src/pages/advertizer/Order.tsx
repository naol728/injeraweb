import { getOrders } from '@/api/order'
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
import { Separator } from '@/components/ui/separator'

import {
    ShoppingBag,
    Phone,
    DollarSign,
    Package,
    CalendarDays,
} from 'lucide-react'

export default function Order() {
    const { data, isLoading, error } = useQuery({
        queryFn: getOrders,
        queryKey: ['getOrders'],
    })

    const orders = data?.data?.data || []

    const totalRevenue = orders.reduce(
        (acc: number, order: any) => acc + order.total_price,
        0
    )

    const totalQuantity = orders.reduce(
        (acc: number, order: any) => acc + order.quantity,
        0
    )

    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-32 rounded-2xl bg-muted animate-pulse"
                        />
                    ))}
                </div>

                <div className="h-[400px] rounded-2xl bg-muted animate-pulse" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Card className="w-full max-w-md border-red-500/30">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-semibold text-red-500">
                            Failed to load orders
                        </h2>

                        <p className="text-muted-foreground mt-2">
                            Something went wrong while fetching orders.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Orders Dashboard
                </h1>

                <p className="text-muted-foreground">
                    Manage and monitor all customer product orders.
                </p>
            </div>

            {/* STATS */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Orders
                            </p>

                            <h2 className="text-4xl font-bold mt-2">
                                {orders.length}
                            </h2>
                        </div>

                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <ShoppingBag className="size-7 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-green-500/10 to-green-500/5">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Revenue
                            </p>

                            <h2 className="text-4xl font-bold mt-2 text-green-600">
                                ${totalRevenue}
                            </h2>
                        </div>

                        <div className="size-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                            <DollarSign className="size-7 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Products Ordered
                            </p>

                            <h2 className="text-4xl font-bold mt-2 text-orange-600">
                                {totalQuantity}
                            </h2>
                        </div>

                        <div className="size-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                            <Package className="size-7 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* TABLE */}
            <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">
                        Recent Orders
                    </CardTitle>

                    <CardDescription>
                        Complete list of customer product orders.
                    </CardDescription>
                </CardHeader>

                <Separator />

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="pl-6">
                                        Product
                                    </TableHead>

                                    <TableHead>
                                        Phone
                                    </TableHead>

                                    <TableHead>
                                        Quantity
                                    </TableHead>

                                    <TableHead>
                                        Total Price
                                    </TableHead>

                                    <TableHead>
                                        Status
                                    </TableHead>

                                    <TableHead className="pr-6">
                                        Created
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {orders.length > 0 ? (
                                    orders.map((order: any) => (
                                        <TableRow
                                            key={order.id}
                                            className="hover:bg-muted/40 transition"
                                        >
                                            {/* PRODUCT */}
                                            <TableCell className="pl-6">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">
                                                        {order.video_title}
                                                    </span>

                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        ID: {order.id.slice(0, 8)}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* PHONE */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="size-4 text-muted-foreground" />

                                                    <span>
                                                        {order.user_phone_number}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* QUANTITY */}
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-full px-3 py-1"
                                                >
                                                    {order.quantity} Items
                                                </Badge>
                                            </TableCell>

                                            {/* TOTAL */}
                                            <TableCell>
                                                <span className="font-bold text-green-600">
                                                    ${order.total_price}
                                                </span>
                                            </TableCell>

                                            {/* STATUS */}
                                            <TableCell>
                                                <Badge className="bg-green-500 hover:bg-green-500 rounded-full px-3">
                                                    Completed
                                                </Badge>
                                            </TableCell>

                                            {/* DATE */}
                                            <TableCell className="pr-6">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <CalendarDays className="size-4" />

                                                    <span>
                                                        {new Date(
                                                            order.created_at
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-40 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <ShoppingBag className="size-10 text-muted-foreground" />

                                                <div>
                                                    <h3 className="font-semibold">
                                                        No Orders Found
                                                    </h3>

                                                    <p className="text-sm text-muted-foreground">
                                                        Orders will appear here once users purchase products.
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