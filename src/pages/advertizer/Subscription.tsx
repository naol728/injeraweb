import {
    createUserSubscription,
    getSubscriptions,
    getUserSubscriptions,
} from '@/api/subscription'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Loader2, CheckCircle2, Crown } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'

interface SubscriptionPlan {
    id: string
    name: string
    slug: string
    description?: string
    price: number
    currency: string
    duration_days: number
    video_upload_limit: number
    max_video_duration_seconds?: number
    is_active: boolean
    sort_order?: number
}

interface UserSubscription {
    id: string
    status: 'pending' | 'active' | 'expired' | 'cancelled'
    subscription_id: string
    starts_at: string
    expires_at: string
    subscription: SubscriptionPlan
}



export default function Subscription() {
    const queryClient = useQueryClient()

    const [selectedPlan, setSelectedPlan] =
        useState<SubscriptionPlan | null>(null)

    const [open, setOpen] = useState(false)

    /* -------------------------------------------------------------------------- */
    /*                                   PLANS                                    */
    /* -------------------------------------------------------------------------- */

    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryFn: getSubscriptions,
        queryKey: ['getSubscriptions'],
    })

    const subscriptions: SubscriptionPlan[] = data?.data?.data || []

    /* -------------------------------------------------------------------------- */
    /*                           CURRENT USER SUBSCRIPTION                        */
    /* -------------------------------------------------------------------------- */

    const {
        data: userSubscriptionsData,
    } = useQuery({
        queryFn: getUserSubscriptions,
        queryKey: ['getUserSubscriptions'],
    })

    const activeSubscription: UserSubscription | null = useMemo(() => {
        const items = userSubscriptionsData?.data || []

        return (
            items?.find(
                (item: UserSubscription) => item.status === 'active',
            ) || null
        )
    }, [userSubscriptionsData])

    /* -------------------------------------------------------------------------- */
    /*                                 SUBSCRIBE                                  */
    /* -------------------------------------------------------------------------- */

    const subscribeMutation = useMutation({
        mutationFn: createUserSubscription,

        onSuccess: (response) => {
            toast.success(
                response?.message ||
                'Subscription activated successfully',
            )

            queryClient.invalidateQueries({
                queryKey: ['getUserSubscriptions'],
            })

            queryClient.invalidateQueries({
                queryKey: ['getWalletBalance'],
            })

            setOpen(false)
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ||
                'Failed to activate subscription',
            )
        },
    })

    const handleSubscribe = () => {
        if (!selectedPlan) return


        subscribeMutation.mutate({
            subscription_id: selectedPlan.id,
        })
    }

    /* -------------------------------------------------------------------------- */
    /*                                   LOADING                                  */
    /* -------------------------------------------------------------------------- */

    if (isLoading) {
        return (
            <div className='flex items-center justify-center py-20'>
                <Loader2 className='h-8 w-8 animate-spin' />
            </div>
        )
    }

    if (isError) {
        return (
            <div className='flex items-center justify-center py-20'>
                <p className='text-sm text-red-500'>
                    Failed to load subscriptions
                </p>
            </div>
        )
    }

    return (
        <div className='space-y-8'>
            {/* -------------------------------------------------------------------------- */
            /*                           CURRENT ACTIVE PLAN                              */
            /* -------------------------------------------------------------------------- */}

            {activeSubscription && (
                <Card className='rounded-3xl border-primary/20 bg-primary/5 p-6'>
                    <div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between'>
                        <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                                <Crown className='h-5 w-5 text-yellow-500' />

                                <h2 className='text-2xl font-bold'>
                                    Current Active Plan
                                </h2>
                            </div>

                            <h3 className='text-xl font-semibold'>
                                {activeSubscription.subscription.name}
                            </h3>

                            <p className='text-muted-foreground text-sm'>
                                {activeSubscription.subscription.description}
                            </p>

                            <div className='flex flex-wrap gap-2 pt-2'>
                                <Badge>
                                    Expires:{' '}
                                    {new Date(
                                        activeSubscription.expires_at,
                                    ).toLocaleDateString()}
                                </Badge>

                                <Badge variant='secondary'>
                                    {
                                        activeSubscription.subscription
                                            .video_upload_limit
                                    }{' '}
                                    Uploads
                                </Badge>
                            </div>
                        </div>

                        <div className='text-right'>
                            <h2 className='text-4xl font-black'>
                                {activeSubscription.subscription.price}{' '}
                                {
                                    activeSubscription.subscription.currency
                                }
                            </h2>

                            <p className='text-muted-foreground text-sm'>
                                Active Subscription
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* -------------------------------------------------------------------------- */
            /*                                   HEADER                                   */
            /* -------------------------------------------------------------------------- */}

            <div>
                <h1 className='text-3xl font-bold'>
                    {activeSubscription
                        ? 'Upgrade Your Subscription'
                        : 'Subscription Plans'}
                </h1>

                <p className='text-muted-foreground mt-2'>
                    {activeSubscription
                        ? 'Switch to another plan anytime.'
                        : 'Choose the best plan for your advertising needs.'}
                </p>
            </div>

            {/* -------------------------------------------------------------------------- */
            /*                                   PLANS                                    */
            /* -------------------------------------------------------------------------- */}

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
                {subscriptions
                    ?.filter((plan) => plan.is_active)
                    ?.map((plan) => {
                        const isCurrentPlan =
                            activeSubscription?.subscription_id === plan.id


                        return (
                            <Card
                                key={plan.id}
                                className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${isCurrentPlan
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : ''
                                    }`}
                            >
                                {isCurrentPlan && (
                                    <Badge className='absolute right-4 top-4'>
                                        Current Plan
                                    </Badge>
                                )}

                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between'>
                                        <h2 className='text-2xl font-bold'>
                                            {plan.name}
                                        </h2>

                                        <Badge variant='secondary'>
                                            {plan.duration_days} Days
                                        </Badge>
                                    </div>

                                    <div>
                                        <h3 className='text-4xl font-black'>
                                            {plan.price} {plan.currency}
                                        </h3>
                                    </div>

                                    <p className='text-sm text-muted-foreground'>
                                        {plan.description ||
                                            'No description available'}
                                    </p>

                                    <div className='space-y-3 pt-4'>
                                        <div className='flex items-center gap-2 text-sm'>
                                            <CheckCircle2 className='h-4 w-4' />

                                            <span>
                                                {
                                                    plan.video_upload_limit
                                                }{' '}
                                                Video Uploads
                                            </span>
                                        </div>

                                        <div className='flex items-center gap-2 text-sm'>
                                            <CheckCircle2 className='h-4 w-4' />

                                            <span>
                                                Max Duration:{' '}
                                                {plan.max_video_duration_seconds
                                                    ? `${Math.floor(
                                                        plan.max_video_duration_seconds /
                                                        60,
                                                    )} Minutes`
                                                    : 'Unlimited'}
                                            </span>
                                        </div>
                                    </div>

                                    <Dialog
                                        open={open}
                                        onOpenChange={setOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button
                                                disabled={
                                                    isCurrentPlan
                                                }
                                                className='mt-6 w-full rounded-2xl'
                                                onClick={() =>
                                                    setSelectedPlan(plan)
                                                }
                                            >
                                                {isCurrentPlan
                                                    ? 'Current Plan'
                                                    : activeSubscription
                                                        ? 'Upgrade Plan'
                                                        : 'Subscribe Now'}
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent className='rounded-3xl sm:max-w-lg'>
                                            <DialogHeader>
                                                <DialogTitle className='text-2xl'>
                                                    {activeSubscription
                                                        ? 'Confirm Plan Upgrade'
                                                        : 'Confirm Subscription'}
                                                </DialogTitle>
                                            </DialogHeader>

                                            {selectedPlan && (
                                                <div className='space-y-6'>
                                                    <div className='rounded-2xl border p-5'>
                                                        <div className='flex items-center justify-between'>
                                                            <div>
                                                                <h3 className='text-xl font-bold'>
                                                                    {
                                                                        selectedPlan.name
                                                                    }
                                                                </h3>

                                                                <p className='text-muted-foreground text-sm'>
                                                                    {
                                                                        selectedPlan.description
                                                                    }
                                                                </p>
                                                            </div>

                                                            <Badge>
                                                                {
                                                                    selectedPlan.duration_days
                                                                }{' '}
                                                                Days
                                                            </Badge>
                                                        </div>

                                                        <div className='mt-4'>
                                                            <h2 className='text-3xl font-black'>
                                                                {
                                                                    selectedPlan.price
                                                                }{' '}
                                                                {
                                                                    selectedPlan.currency
                                                                }
                                                            </h2>
                                                        </div>
                                                    </div>

                                                    <div className='space-y-3 rounded-2xl bg-muted/40 p-4'>
                                                        <div className='flex items-center justify-between text-sm'>
                                                            <span>
                                                                Video Upload
                                                                Limit
                                                            </span>

                                                            <span className='font-semibold'>
                                                                {
                                                                    selectedPlan.video_upload_limit
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className='flex items-center justify-between text-sm'>
                                                            <span>
                                                                Maximum Video
                                                                Duration
                                                            </span>

                                                            <span className='font-semibold'>
                                                                {selectedPlan.max_video_duration_seconds
                                                                    ? `${Math.floor(
                                                                        selectedPlan.max_video_duration_seconds /
                                                                        60,
                                                                    )} Minutes`
                                                                    : 'Unlimited'}
                                                            </span>
                                                        </div>
                                                    </div>



                                                    <Button
                                                        disabled={
                                                            subscribeMutation.isPending
                                                        }
                                                        onClick={
                                                            handleSubscribe
                                                        }
                                                        className='w-full rounded-2xl'
                                                    >
                                                        {subscribeMutation.isPending ? (
                                                            <>
                                                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                                Processing...
                                                            </>
                                                        ) : activeSubscription ? (
                                                            'Upgrade Subscription'
                                                        ) : (
                                                            'Confirm Subscription'
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </Card>
                        )
                    })}
            </div>
        </div>
    )
}