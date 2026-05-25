import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { registerUser } from "@/api/auth"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"

const signupSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .regex(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/, "Username must contain letters and numbers"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8, "Confirm password is required"),
        type: z.enum(["user", "advertiser"] as const, { message: "Please select account type" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })


type SignupFormValues = z.infer<typeof signupSchema>

export default function Signup() {
    const navigate = useNavigate()

    const { control, register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            type: "user",
        },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: registerUser,
        mutationKey: ["registerUser"],
        onSuccess: (data) => {
            toast.success(data.message)
            navigate(`/varify-otp/${data.user.email}`)
        },
        onError: (err) => {
            console.log(err)
            toast.error(err.message)
        },
    })

    const onSubmit = (data: SignupFormValues) => {
        mutate({
            username: data.username,
            email: data.email,
            password: data.password,
            type: data.type,
        })
    }
    const storeddata = localStorage.getItem("user")
    const user = JSON.parse(storeddata)

    if (user) {
        if (user.type === "admin") {
            return <Navigate to="/admin" replace />
        }
        if (user.type === "advertiser") {
            return <Navigate to="/advertiser" replace />
        }
        if (user.type === "user") {
            return <Navigate to="/injera" replace />
        }


    }
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-6">
            <div className="flex w-full max-w-md flex-col gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-md"
                >


                    <Card className={cn(
                        "backdrop-blur-md bg-card/80 shadow-2xl border border-border/40 rounded-2xl"
                    )}>
                        <Link to="/" className="flex items-center gap-2 self-center font-medium">
                            Injera
                        </Link>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">Create your account</CardTitle>
                            <CardDescription>
                                Enter your information below to create your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="username">User Name</FieldLabel>
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="abebe123"
                                            {...register("username")}
                                        />
                                        {errors.username && (
                                            <FieldDescription className="text-red-500">{errors.username.message}</FieldDescription>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            {...register("email")}
                                        />
                                        {errors.email && (
                                            <FieldDescription className="text-red-500">{errors.email.message}</FieldDescription>
                                        )}
                                    </Field>

                                    <Field className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
                                            <Input id="password" type="password" {...register("password")} />
                                            {errors.password && (
                                                <FieldDescription className="text-red-500">{errors.password.message}</FieldDescription>
                                            )}
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                                            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                                            {errors.confirmPassword && (
                                                <FieldDescription className="text-red-500">{errors.confirmPassword.message}</FieldDescription>
                                            )}
                                        </Field>
                                    </Field>
                                    <FieldDescription>Must be at least 8 characters long.</FieldDescription>

                                    <Field>
                                        <Controller
                                            control={control}
                                            name="type"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Are you?" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="user">User</SelectItem>
                                                        <SelectItem value="advertiser">Advertiser</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.type && (
                                            <FieldDescription className="text-red-500">{errors.type.message}</FieldDescription>
                                        )}
                                    </Field>

                                    <Field>
                                        <Button type="submit" disabled={isPending}>
                                            Create Account
                                        </Button>
                                        <FieldDescription className="text-center">
                                            Already have an account? <Link to="/">Sign in</Link>
                                        </FieldDescription>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                    <FieldDescription className="px-6 text-center">
                        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                        and <a href="#">Privacy Policy</a>.
                    </FieldDescription>
                </motion.div>
            </div >
        </div >
    )
}
