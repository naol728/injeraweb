
export function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-3 w-3 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
                <span className="h-3 w-3 rounded-full bg-red-500 animate-bounce" />
            </div>
        </div>
    );
}

