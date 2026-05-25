import React, { useState } from "react"
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Withdrawalrequest, type WithdrawalMethod } from "@/api/wallet"
import { toast } from "sonner"

export default function WithdrawRequest() {
    const [form, setForm] = useState({
        amount: "",
        withdrawal_method: "" as WithdrawalMethod | "",
        account_number: "",
        account_name: "",
    })
    const queryclient = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationFn: Withdrawalrequest,
        mutationKey: ["Withdrawalrequest"],
        onSuccess: (data) => {
            toast.success(data.message)
            queryclient.invalidateQueries({ queryKey: ["getWalletBalance"] })
        },
        onError: (error: any) => {
            toast.error(error?.message || "Something went wrong")
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.withdrawal_method) {
            toast.error("Select a withdrawal method")
            return
        }

        mutate({
            amount: Number(form.amount),
            withdrawal_method: form.withdrawal_method,
            account_number: form.account_number,
            account_name: form.account_name,
        })
    }

    return (
        <div className="space-y-4">
            <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                    Enter your withdrawal details below.
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3">

                {/* Amount */}
                <Input
                    type="number"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                    }
                    required
                />

                {/* Method */}
                <Select
                    onValueChange={(value: WithdrawalMethod) =>
                        setForm({ ...form, withdrawal_method: value })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="telebirr">Telebirr</SelectItem>
                        <SelectItem value="mpesa">Mpesa</SelectItem>
                        <SelectItem value="cbe_wallet">CBE Wallet</SelectItem>
                        <SelectItem value="cbe">CBE Bank</SelectItem>
                        <SelectItem value="awash_bank">Awash Bank</SelectItem>
                        <SelectItem value="dashen_bank">Dashen Bank</SelectItem>
                        <SelectItem value="boa">Bank of Abyssinia</SelectItem>
                    </SelectContent>
                </Select>

                {/* Account Number */}
                <Input
                    placeholder="Account Number / Phone"
                    value={form.account_number}
                    onChange={(e) =>
                        setForm({ ...form, account_number: e.target.value })
                    }
                    required
                />

                {/* Account Name */}
                <Input
                    placeholder="Account Name"
                    value={form.account_name}
                    onChange={(e) =>
                        setForm({ ...form, account_name: e.target.value })
                    }
                    required
                />

                {/* Submit */}
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending}
                >
                    {isPending ? "Processing..." : "Submit Withdrawal"}
                </Button>
            </form>
        </div>
    )
}