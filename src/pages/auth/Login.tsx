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
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { login } from "@/api/auth"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function Login() {
    const navigate = useNavigate()
    const { mutate, isPending } = useMutation({
        mutationFn: login,
        mutationKey: ["login"],
        onSuccess: (data) => {
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))
            toast.success(data.message)
            if (data.user.type === "user") {
                navigate("/injera")
            }
            else if (data.user.type === "advertiser") {
                navigate("/advertiser")
            }
            else if (data.user.type === "admin") {
                navigate("/admin")
            }
            else if (data.user.type === "payment_processor") {
                navigate("/paymentprocess")
            }
            else {
                navigate("/")
            }
        },
        onError: (err) => {
            toast.error(err.message)
        }


    })
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault()
        mutate({
            password,
            login: email,
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
            <div className="w-full max-w-sm">
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

                        <CardHeader>
                            <CardTitle>Login</CardTitle>
                            <CardDescription>
                                Enter your email or username below to login to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="email">Email or UserName</FieldLabel>
                                        <Input
                                            id="email"
                                            placeholder="m@example.com"
                                            required
                                            onChange={(e) => setEmail(e.target.value)}
                                            value={email}
                                        />
                                    </Field>
                                    <Field>
                                        <div className="flex items-center">
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
                                            <Link
                                                to="/forgetpassword"
                                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                            >
                                                Forgot your password?
                                            </Link>
                                        </div>
                                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </Field>
                                    <Field>
                                        <Button type="submit" disabled={isPending}>{isPending ? "Login..." : "Login"}</Button>
                                        <FieldDescription className="text-center">
                                            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
                                        </FieldDescription>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div >
        </div >
    )
}


