import React, { useRef, useState } from "react"
import { useParams, useNavigate, Navigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { varifyEmail } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function VarifyEmail() {
    const navigate = useNavigate()
    const { email } = useParams<{ email: string }>()
    const [otp, setOtp] = useState(Array(6).fill(""))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const { mutate, isPending } = useMutation({
        mutationFn: varifyEmail,
        onSuccess: (data) => {
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))
            toast.success(data.message || "Email verified successfully!")
            if (data.user.type === "user") {
                navigate("/")
            }
            else if (data.user.type === "advertiser") {
                navigate("/advertiser")
            }
            else {
                navigate("/admin")
            }
        },
        onError: (err) => {
            toast.error(err.message || "Verification failed")
        },
    })

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const code = otp.join("")
        if (code.length !== 6) {
            toast.error("Please enter all 6 digits")
            return
        }
        if (email == undefined) return
        mutate({ email, otp: code })
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
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md shadow-xl rounded-2xl z-50">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to your email
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* OTP Inputs */}
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <Input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el }}
                                    disabled={isPending}
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    maxLength={1}
                                    inputMode="numeric"
                                    className={cn(
                                        "h-12 w-12 text-center text-lg font-bold tracking-widest border-2 border-muted rounded-lg",
                                        "focus:ring-2 focus:ring-primary focus:border-primary"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full mt-2" disabled={isPending}>
                            {isPending ? "Verifying..." : "Verify"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
