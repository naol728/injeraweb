import { spinWheel } from '@/api/game'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import confetti from "canvas-confetti"

type Props = {
    labels: string[]
    colors: string[]
    prizes: number[]
    game_id: string
}

export default function SpinWheel({ labels, colors, prizes, game_id }: Props) {
    const [rotation, setRotation] = useState(0)
    const [spinning, setSpinning] = useState(false)
    const [result, setResult] = useState<any>(null)

    const segmentAngle = 360 / labels.length

    const gradient = labels
        .map((_, i) => {
            const start = i * segmentAngle
            const end = start + segmentAngle
            return `${colors[i]} ${start}deg ${end}deg`
        })
        .join(', ')

    const { mutate, isPending } = useMutation({
        mutationFn: spinWheel,

        onSuccess: (res) => {
            const winnerIndex = res.segment_index

            const extraSpins = 6 * 360
            const targetAngle =
                360 - (winnerIndex * segmentAngle + segmentAngle / 2)

            setRotation(prev => prev + extraSpins + targetAngle)

            setTimeout(() => {
                setSpinning(false)
                setResult(res)

                if (res.is_winner) {
                    confetti({
                        particleCount: 200,
                        spread: 120,
                        origin: { y: 0.6 },
                    })
                }
            }, 4000)
        },

        onError: () => {
            setSpinning(false)
        }
    })

    const spin = () => {
        if (spinning) return
        setSpinning(true)
        setResult(null)
        mutate({ game_id })
    }

    return (
        <div className="flex flex-col items-center gap-6 w-full">

            {/* POINTER (TOP CENTER) */}
            <div className="relative z-20">
                <div className="w-0 h-0 
                    border-l-[14px] border-r-[14px] border-b-[24px]
                    border-l-transparent border-r-transparent border-b-primary drop-shadow" />
            </div>

            {/* WHEEL CONTAINER */}
            <div className="relative flex items-center justify-center">

                {/* Glow */}
                <div className="absolute w-[320px] h-[320px] md:w-[380px] md:h-[380px] 
                    bg-primary/10 blur-2xl rounded-full" />

                {/* WHEEL */}
                <div
                    onClick={spin}
                    className="relative 
                        w-[280px] h-[280px] 
                        md:w-[340px] md:h-[340px] 
                        rounded-full border-[6px] border-gray-800 shadow-2xl cursor-pointer"
                    style={{
                        background: `conic-gradient(${gradient})`,
                        transform: `rotate(${rotation}deg)`,
                        transition: spinning
                            ? 'transform 4s cubic-bezier(0.22, 1, 0.36, 1)'
                            : 'none'
                    }}
                >

                    {/* CENTER HUB */}
                    <div className="absolute w-16 h-16 bg-white rounded-full border-4 border-gray-800
                        top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        flex items-center justify-center font-bold shadow">
                        GO
                    </div>

                    {/* LABELS */}
                    {labels.map((label, i) => {
                        const angle = i * segmentAngle + segmentAngle / 2
                        return (
                            <div
                                key={i}
                                className="absolute w-full h-full flex items-center justify-center text-white text-[10px] md:text-xs font-semibold"
                                style={{ transform: `rotate(${angle}deg)` }}
                            >
                                <div
                                    style={{
                                        transform: `translateY(-120px) rotate(-${angle}deg)`
                                    }}
                                >
                                    {label}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ACTION BUTTON */}
            <Button
                onClick={spin}
                disabled={spinning || isPending}
                size="lg"
                className="w-full max-w-xs"
            >
                {spinning ? "Spinning..." : "Spin Now"}
            </Button>

            {/* RESULT CARD */}
            <Dialog open={!!result} onOpenChange={() => setResult(null)}>
                <DialogContent className="text-center space-y-4  animate-[scaleIn_0.3s_ease]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            {result?.is_winner ? "🎉 YOU WON!" : "😢 TRY AGAIN"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="text-lg font-semibold">
                        {result?.message}
                    </div>

                    <div className="text-muted-foreground">
                        {result?.reward_name}
                    </div>

                    <div className="text-2xl font-bold">
                        {result?.reward_value}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}