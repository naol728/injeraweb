import React, { useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { resetPassword } from "@/api/auth"
import { cn } from "@/lib/utils"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ResetPassword() {
    const { email } = useParams()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        otp: "",
        password: "",
        confirmPassword: "",
    })
    console.log(formData)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const { mutate, isPending } = useMutation({
        mutationFn: resetPassword,
        onSuccess: (data) => {
            toast.success(data.message)
            navigate("/")
        },
        onError: (err) => {
            toast.error(err.message || "Something went wrong")
        },
    })

    // ✅ Simple validation logic (plain JS)
    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        // OTP validation
        if (!formData.otp) {
            newErrors.otp = "OTP is required"
        } else if (!/^\d+$/.test(formData.otp)) {
            newErrors.otp = "OTP must contain only numbers"
        } else if (formData.otp.length < 4) {
            newErrors.otp = "OTP must be at least 4 digits"
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required"
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password"
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!validateForm()) return

        if (!email) return toast.error("Email not found")

        mutate({
            email,
            otp: formData.otp,
            password: formData.password,
            password_confirmation: formData.confirmPassword,
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
                <Card
                    className={cn(
                        "backdrop-blur-md bg-card/80 shadow-2xl border border-border/40 rounded-2xl"
                    )}
                >
                    <CardHeader className="text-center space-y-2 pb-2">
                        <CardTitle className="text-2xl font-bold">Fill the form</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your OTP and set a new password
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <FieldGroup className="space-y-4">
                                {/* OTP */}
                                <Field>
                                    <FieldLabel htmlFor="otp">OTP</FieldLabel>
                                    <Input
                                        id="otp"
                                        name="otp"
                                        type="number"
                                        placeholder="------"
                                        required
                                        value={formData.otp}
                                        onChange={handleChange}
                                        className="h-11 text-sm"
                                    />
                                    {errors.otp && (
                                        <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
                                    )}
                                </Field>

                                {/* Password */}
                                <Field>
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="********"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="h-11 text-sm"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                    )}
                                </Field>

                                {/* Confirm Password */}
                                <Field>
                                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="********"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="h-11 text-sm"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </Field>

                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full mt-2"
                                >
                                    {isPending ? "Resetting..." : "Reset Password"}
                                </Button>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
