
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
    FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"
import { useMutation } from "@tanstack/react-query"
import { forgotPassword } from "@/api/auth"
import { toast } from "sonner"

export default function ForgetPassword() {
    const naviagete = useNavigate()
    const [email, setEmail] = useState("")
    const { mutate, isPending } = useMutation({
        mutationFn: forgotPassword,
        onSuccess: (data) => {
            toast.success(data.message)
            naviagete(`/resetpassword/${email}`)
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutate({
            email
        })
    }
    const user = JSON.parse(localStorage.getItem("user"))

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
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-sm"
            >
                <Card className={cn(
                    "backdrop-blur-md bg-card/80 shadow-2xl border border-border/40 rounded-2xl"
                )}>
                    <CardHeader className="text-center space-y-2 pb-2">
                        <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your email and we’ll send you a 6-digit OTP to reset your password.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <FieldGroup className="space-y-4">
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 text-sm"
                                    />
                                </Field>

                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full mt-2"
                                >
                                    Send OTP
                                </Button>

                                <FieldDescription className="text-center text-sm">
                                    Don’t have an account?{" "}
                                    <Link to="/signup" className="text-primary hover:underline">
                                        Sign up
                                    </Link>
                                </FieldDescription>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
