import { getAllgames } from '@/api/game'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import SpinWheel from './SpinWheel'

export default function Game() {
    const { data, isLoading, error } = useQuery({
        queryFn: getAllgames,
        queryKey: ["getAllgames"]
    })

    const [selectedGame, setSelectedGame] = useState<any>(null)

    const games = data?.games || []

    if (isLoading) return <div className="p-4">Loading games...</div>
    if (error) return <div className="p-4 text-red-500">Failed to load games</div>

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-screen">

            {/* LEFT */}
            <Card className="lg:col-span-4 flex flex-col">
                <CardHeader>
                    <CardTitle>🎮 Injera Games</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                    {/* On mobile: no fixed height */}
                    <ScrollArea className="lg:h-[calc(100vh-120px)] px-3">
                        {games.map((game: any) => (
                            <div
                                key={game.id}
                                onClick={() => setSelectedGame(game)}
                                className={`p-3 mb-3 rounded-xl border cursor-pointer transition
                                ${selectedGame?.id === game.id
                                        ? 'border-blue-500 bg-blue-500 text-white shadow'
                                        : 'hover:shadow-sm'}
                                `}
                            >
                                <div className="flex justify-between items-center gap-2">
                                    <div>
                                        <div className="font-semibold text-sm sm:text-base">
                                            {game.name}
                                        </div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                            {game.description}
                                        </div>
                                    </div>
                                    <Badge className="text-xs">{game.type}</Badge>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* RIGHT */}
            <Card className="lg:col-span-8 flex flex-col items-center justify-center p-4 sm:p-6">

                {!selectedGame ? (
                    <div className="text-muted-foreground text-center text-base sm:text-lg">
                        🎯 Select a game
                    </div>
                ) : (
                    <div className="w-full max-w-xl sm:max-w-2xl">

                        {/* Header */}
                        <div className="text-center mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold">
                                {selectedGame.name}
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                {selectedGame.description}
                            </p>
                        </div>

                        {/* Game */}
                        {selectedGame.type === "spin_wheel" && (
                            <SpinWheel
                                labels={selectedGame.wheel_labels}
                                colors={selectedGame.wheel_colors}
                                prizes={selectedGame.wheel_prizes}
                                game_id={selectedGame.id}
                            />
                        )}
                    </div>
                )}
            </Card>
        </div>
    )
}