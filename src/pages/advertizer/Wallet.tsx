/*eslint-disable*/
import { deposit, getWalletBalance } from '@/api/wallet'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState } from 'react'
import Subscription from './Subscription'

import { getUserSubscriptions } from '@/api/subscription'

import {
    Wallet,
    Crown,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    Loader2,
    Sparkles,
    TrendingUp,
    Shield,
    Clock,
    ArrowRight,
    Coins,
    Banknote,
    User,
    Phone,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
// Badge component (if not already imported, add this)
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
        {children}
    </span>
)

// Animated number counter
const AnimatedNumber = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
    const [displayValue, setDisplayValue] = useState(value)

    useState(() => {
        if (value !== displayValue) {
            const duration = 500
            const steps = 30
            const stepValue = (value - displayValue) / steps
            let current = displayValue
            for (let i = 1; i <= steps; i++) {
                setTimeout(() => {
                    current += stepValue
                    setDisplayValue(Math.round(current))
                }, (duration / steps) * i)
            }
        }
    })

    return <span>{prefix}{displayValue}{suffix}</span>
}

// Stat card component
const StatCard = ({ icon: Icon, label, value, suffix = "", delay = 0 }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.3 }}
        className="rounded-xl border bg-muted/30 p-4 hover:border-primary/20 transition-all duration-300"
    >
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{value}{suffix}</p>
            </div>
        </div>
    </motion.div>
)
const depositSchema = z.object({
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters"),

    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters"),

    phone: z
        .string()
        .regex(/^09\d{8}$/, "Phone number must be valid"),

    amount: z
        .number({
            required_error: "Amount is required",
        })
        .min(1, "Amount must be greater than 0"),
})

type DepositFormValues = z.infer<typeof depositSchema>
export default function AdvertiserWallet() {
    const [isHovered, setIsHovered] = useState(false)
    const [subscriptionOpen, setSubscriptionOpen] = useState(false)
    const [depositOpen, setDepositOpen] = useState(false)

    const { data: wallet, refetch: refetchWallet } = useQuery({
        queryKey: ["getWalletBalance"],
        queryFn: getWalletBalance,
    })


    const { data: subscription } = useQuery({
        queryFn: getUserSubscriptions,
        queryKey: ["getUserSubscriptions"]
    })


    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<DepositFormValues>({
        resolver: zodResolver(depositSchema),
        mode: "onChange",
        defaultValues: {
            firstName: "",
            lastName: "",
            phone: "",
            amount: 0,
        },
    })

    const hasActiveSubscription = subscription?.some((item: any) => item?.subscription?.is_active === true) ?? false

    const activeSubscription = subscription?.find((item: any) => item?.subscription?.is_active === true)

    const { mutate, isPending } = useMutation({
        mutationFn: deposit,
        mutationKey: ["deposit"],
        onSuccess: (data) => {
            const checkoutUrl = data?.data?.checkout_url
            if (checkoutUrl) {
                window.location.href = checkoutUrl
            } else {
                toast.error("Failed to get payment link")
            }
        },
        onError: (error: any) => {
            toast.error(error.message)
        }
    })

    const handleDeposit = (values: DepositFormValues) => {
        mutate({
            amount: values.amount,
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
        })
    }

    const balance = wallet?.data?.balance
    console.log(wallet?.data?.balance)
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
        >
            <div
                className="relative rounded-2xl border bg-gradient-to-br from-background via-background to-muted/30 shadow-sm overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Animated gradient border effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                    animate={{ x: isHovered ? "100%" : "-100%" }}
                    transition={{ duration: 0.8 }}
                />

                <div className="relative p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* LEFT - Balance Section */}
                        <motion.div
                            className="flex items-center gap-4"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <div className="relative">
                                <motion.div
                                    className="absolute inset-0 rounded-xl bg-primary/20 blur-xl"
                                    animate={{ scale: isHovered ? 1.2 : 1 }}
                                />
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
                                    <Wallet className="h-5 w-5 text-primary-foreground" />
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Available Balance
                                </p>
                                <motion.div
                                    className="flex items-baseline gap-1"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                        <AnimatedNumber value={balance} />
                                    </h2>
                                    <span className="text-sm text-muted-foreground font-medium">ETB</span>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* RIGHT - Actions */}
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            {/* SUBSCRIPTION BUTTON */}
                            <Dialog open={subscriptionOpen} onOpenChange={setSubscriptionOpen}>
                                <DialogTrigger asChild>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            size="default"
                                            className={cn(
                                                "rounded-xl gap-2 shadow-sm",
                                                hasActiveSubscription
                                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                                                    : "bg-gradient-to-r from-primary to-primary/80"
                                            )}
                                        >
                                            <Crown className="h-4 w-4" />
                                            {hasActiveSubscription ? "Active Plan" : "Subscribe"}
                                            <ArrowRight className="h-3.5 w-3.5 opacity-70" />
                                        </Button>
                                    </motion.div>
                                </DialogTrigger>

                                <DialogContent className="max-w-[95vw] sm:max-w-2xl rounded-2xl p-0 overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        {hasActiveSubscription ? (
                                            <motion.div
                                                key="active-subscription"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {/* HEADER */}
                                                <div className="border-b bg-gradient-to-r from-primary/5 to-transparent p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
                                                            <Sparkles className="h-6 w-6 text-primary-foreground" />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-xl font-bold">
                                                                {activeSubscription?.subscription?.name}
                                                            </h2>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Your subscription is active and running
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* BODY */}
                                                <div className="space-y-5 p-6">
                                                    {/* DESCRIPTION */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 }}
                                                        className="rounded-xl bg-muted/30 p-4 border"
                                                    >
                                                        <p className="text-sm font-semibold mb-2">Plan Description</p>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            {activeSubscription?.subscription?.description}
                                                        </p>
                                                    </motion.div>

                                                    {/* STATS GRID */}
                                                    <div className="grid gap-4 sm:grid-cols-3">
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.15 }}
                                                            className="rounded-xl border bg-gradient-to-br from-green-500/5 to-transparent p-4"
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                                                            </div>
                                                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                                                Active
                                                            </Badge>
                                                        </motion.div>

                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                            className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-4"
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <CalendarDays className="h-4 w-4 text-primary" />
                                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expires</span>
                                                            </div>
                                                            <p className="text-sm font-semibold">
                                                                {new Date(activeSubscription?.expires_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </p>
                                                        </motion.div>

                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.25 }}
                                                            className="rounded-xl border bg-gradient-to-br from-amber-500/5 to-transparent p-4"
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <CreditCard className="h-4 w-4 text-amber-500" />
                                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid</span>
                                                            </div>
                                                            <p className="text-sm font-semibold">
                                                                {activeSubscription?.amount_paid} <span className="text-muted-foreground">ETB</span>
                                                            </p>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="subscription-plans"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="p-4"
                                            >
                                                <Subscription onSubscribe={() => {
                                                    setSubscriptionOpen(false)
                                                    refetchWallet()
                                                }} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </DialogContent>
                            </Dialog>

                            {/* DEPOSIT BUTTON */}
                            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                                <DialogTrigger asChild>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            variant="outline"

                                            size="default"
                                            className="rounded-xl gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                                        >
                                            <Banknote className="h-4 w-4" />
                                            Deposit
                                        </Button>
                                    </motion.div>
                                </DialogTrigger>

                                <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl p-0 overflow-hidden">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* HEADER */}
                                        <div className="border-b bg-gradient-to-r from-primary/5 to-transparent p-6">
                                            <DialogHeader className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                                        <Coins className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <DialogTitle className="text-xl font-bold">
                                                        Deposit Funds
                                                    </DialogTitle>
                                                </div>
                                                <DialogDescription className="text-sm">
                                                    Add funds securely to your wallet using Chapa payment gateway.
                                                </DialogDescription>
                                            </DialogHeader>
                                        </div>

                                        {/* FORM */}
                                        <div className="space-y-5 p-6">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        First Name
                                                    </Label>

                                                    <Input
                                                        className="h-11 rounded-xl border-muted-foreground/20 focus:border-primary"
                                                        placeholder="John"
                                                        {...register("firstName")}
                                                    />

                                                    {errors.firstName && (
                                                        <p className="text-xs text-red-500">
                                                            {errors.firstName.message}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        Last Name
                                                    </Label>

                                                    <Input
                                                        className="h-11 rounded-xl border-muted-foreground/20 focus:border-primary"
                                                        placeholder="Doe"
                                                        {...register("lastName")}
                                                    />

                                                    {errors.lastName && (
                                                        <p className="text-xs text-red-500">
                                                            {errors.lastName.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-medium flex items-center gap-2">
                                                    <Phone className="h-3 w-3" />
                                                    Phone Number
                                                </Label>

                                                <Input
                                                    className="h-11 rounded-xl border-muted-foreground/20 focus:border-primary"
                                                    placeholder="09XXXXXXXX"
                                                    {...register("phone")}
                                                />

                                                {errors.phone && (
                                                    <p className="text-xs text-red-500">
                                                        {errors.phone.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-medium flex items-center gap-2">
                                                    <Coins className="h-3 w-3" />
                                                    Amount (ETB)
                                                </Label>

                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="h-11 rounded-xl border-muted-foreground/20 focus:border-primary pl-8"
                                                        placeholder="100"
                                                        {...register("amount", {
                                                            valueAsNumber: true,
                                                        })}
                                                    />

                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                                        Br
                                                    </span>
                                                </div>

                                                {errors.amount && (
                                                    <p className="text-xs text-red-500">
                                                        {errors.amount.message}
                                                    </p>
                                                )}
                                            </div>

                                            <Separator className="my-2" />

                                            <Button
                                                onClick={handleSubmit(handleDeposit)}
                                                disabled={isPending || !isValid}
                                                className="h-12 w-full rounded-xl gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm"
                                            >
                                                {isPending ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="h-4 w-4" />
                                                        Continue to Payment
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </>
                                                )}
                                            </Button>

                                            <p className="text-xs text-center text-muted-foreground">
                                                Secure payment powered by <span className="font-medium">Chapa</span>
                                            </p>
                                        </div>
                                    </motion.div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}