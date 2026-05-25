
import { Button } from "./ui/button"
import { Coins, Plus, User, Wallet } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getWalletBalance } from "@/api/wallet"
import { fetchUserPoints } from "@/api/feed"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import WithdrawRequest from "./WithdrawRequest"
export default function FloatingNav() {
    const { data: balance } = useQuery({
        queryKey: ["getWalletBalance"],
        queryFn: getWalletBalance,
        refetchInterval: 2000
    })
    const { data } = useQuery({
        queryKey: ["fetchUserPoints"],
        queryFn: fetchUserPoints,
        refetchInterval: 2000
    })



    return (
        <div className="fixed right-4 top-20 -translate-y-1/2 z-100 flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-xl shadow-xl px-2 py-1">
            {/* Points */}
            <Button
                size="sm"
                variant="ghost"
                className="rounded-full px-3 py-2 flex items-center gap-2 text-sm font-semibold shadow-sm"
            >
                <Coins className="w-4 h-4 text-yellow-500" />

                {data?.points}
            </Button>


            <Dialog>
                <DialogTrigger> {/* Balance */}
                    <Button

                        className="rounded-full px-3 py-2 flex items-center gap-2 text-sm font-semibold "
                    >
                        <Wallet className="w-4 h-4" />

                        {balance?.data?.balance}
                    </Button></DialogTrigger>
                <DialogContent>

                    <WithdrawRequest />
                </DialogContent>
            </Dialog>

        </div>
    )
}