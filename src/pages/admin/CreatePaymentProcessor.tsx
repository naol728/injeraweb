import { createPaymentProcessor } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const createPaymentProcessorSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(50, "Username is too long"),

        email: z
            .string()
            .email("Please enter a valid email address"),

        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password is too long"),

        confirmPassword: z
            .string()
            .min(6, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

type CreatePaymentProcessorFormData = z.infer<
    typeof createPaymentProcessorSchema
>

export default function CreatePaymentProcessor() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreatePaymentProcessorFormData>({
        resolver: zodResolver(createPaymentProcessorSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })
    const queryClient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationKey: ['createPaymentProcessor'],
        mutationFn: createPaymentProcessor,

        onSuccess: () => {
            toast.success("Payment processor created successfully")
            queryClient.invalidateQueries({ queryKey: ["fetchusers"] })
            reset()
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to create payment processor"
            )
        },
    })

    const onSubmit = (data: CreatePaymentProcessorFormData) => {
        mutate({
            username: data.username,
            email: data.email,
            password: data.password,
        })
    }

    return (
        <div className="max-w-md space-y-6 rounded-xl border p-6">
            <div>
                <h2 className="text-2xl font-bold">
                    Create Payment Processor
                </h2>

                <p className="text-sm text-muted-foreground">
                    Fill in the information below
                </p>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
            >
                <div className="space-y-2">
                    <Label htmlFor="username">
                        Username
                    </Label>

                    <Input
                        id="username"
                        placeholder="Enter username"
                        {...register("username")}
                    />

                    {errors.username && (
                        <p className="text-sm text-red-500">
                            {errors.username.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">
                        Email
                    </Label>

                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        {...register("email")}
                    />

                    {errors.email && (
                        <p className="text-sm text-red-500">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">
                        Password
                    </Label>

                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        {...register("password")}
                    />

                    {errors.password && (
                        <p className="text-sm text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                        Confirm Password
                    </Label>

                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        {...register("confirmPassword")}
                    />

                    {errors.confirmPassword && (
                        <p className="text-sm text-red-500">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        "Create Payment Processor"
                    )}
                </Button>
            </form>
        </div>
    )
}