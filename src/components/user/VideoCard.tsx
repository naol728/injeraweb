import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    MessageCircle,
    Search,
    BookmarkPlus,
    ExternalLink,
    ShoppingCart,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AdVideo } from "@/types/models/adVideo";
import { AdvertiserHoverCard } from "./AdvertiserHoverCard";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import ShareDialog from "./ShareDialog";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { addVidoeFinshed } from "@/api/feed";
import Comment from "./Comment";
import { createOrder } from "@/api/order";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

interface VideoCardProps {
    v: AdVideo;
    index: number;
    activeIndex: number;
}

export function VideoCard({
    v,
    index,
    activeIndex,
}: VideoCardProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [quantity, setQuantity] = useState(1);

    const variant = v.product_variant?.[0];

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (index === activeIndex) {
            video.play().catch(() => { });
        } else {
            video.pause();
            video.currentTime = 0;
        }
    }, [index, activeIndex]);

    const handleVideoFinish = async () => {
        await addVidoeFinshed(v.id);
    };

    const { mutate, isPending } = useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
            toast.success("Order created successfully");
        },
        onError: () => {
            toast.error("Failed to create order");
        },
    });

    const handleCreateOrder = () => {
        if (!variant) return;

        mutate({
            video_id: v.id,
            quantity,
        });
    };

    return (
        <div
            className={cn(
                "relative h-screen w-full sm:w-[40%] mx-auto flex items-center justify-center snap-center"
            )}
        >
            <motion.div
                initial={{ opacity: 0.7, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative h-full w-full rounded-2xl overflow-hidden shadow-xl"
            >
                {/* Video */}
                <video
                    ref={videoRef}
                    src={v.video_url}
                    className="h-full w-full object-cover"
                    playsInline
                    onEnded={handleVideoFinish}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/70 z-10" />

                {/* Top */}
                <div className="absolute top-5 left-5 right-5 flex items-start justify-between z-20">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-3 mt-3"
                        >
                            <Link to={`/injera/profile/${v.advertiser.id}`}>
                                <Avatar className="ring-2 ring-white/80 shadow">
                                    <AvatarImage
                                        src={v.advertiser.avatar}
                                    />
                                    <AvatarFallback>
                                        {v.advertiser.username
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>

                            <AdvertiserHoverCard v={v} />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link
                            to="/injera/search"
                            className="p-2 rounded-full bg-white/20 backdrop-blur-md shadow hover:bg-white/30 transition"
                        >
                            <Search className="w-5 h-5 text-white" />
                        </Link>
                    </motion.div>
                </div>

                {/* Bottom Info */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="absolute bottom-20 left-5 max-w-[80%] text-white z-20"
                >
                    <h2 className="text-lg font-semibold drop-shadow-md">
                        {v.title}
                    </h2>

                    <p className="text-xs text-gray-200 drop-shadow">
                        {v.tags.map((tag) => tag.name).join(" · ")}
                    </p>

                    {variant && (
                        <div className="mt-3 bg-white/20 backdrop-blur-md rounded-xl p-3">
                            <p className="text-sm font-semibold">
                                ${variant.price}
                            </p>

                            <p className="text-xs text-gray-200">
                                {variant.location}
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Actions */}
                <div className="absolute right-5 bottom-28 flex flex-col gap-6 items-center z-20">

                    <Sheet>
                        <SheetTrigger>
                            <ActionButton
                                icon={<MessageCircle />}
                                label="Comments"
                            />
                        </SheetTrigger>

                        <SheetContent>
                            <Comment v={v} />
                        </SheetContent>
                    </Sheet>

                    {/* ORDER BUTTON */}
                    {variant && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <div>
                                    <ActionButton
                                        icon={<ShoppingCart />}
                                        label="Order"
                                    />
                                </div>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Create Order
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Quantity</Label>

                                        <Input
                                            type="number"
                                            min={1}
                                            value={quantity}
                                            onChange={(e) =>
                                                setQuantity(
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="rounded-xl border p-4">
                                        <div className="flex justify-between text-sm">
                                            <span>Price</span>
                                            <span>
                                                ${variant.price}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm mt-2">
                                            <span>Quantity</span>
                                            <span>{quantity}</span>
                                        </div>

                                        <div className="flex justify-between font-semibold mt-4">
                                            <span>Total</span>
                                            <span>
                                                $
                                                {variant.price *
                                                    quantity}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        onClick={handleCreateOrder}
                                        disabled={isPending}
                                        className="w-full"
                                    >
                                        {isPending
                                            ? "Processing..."
                                            : "Confirm Order"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    <ActionButton
                        icon={<BookmarkPlus />}
                        label="Save"
                    />

                    <ShareDialog v={v} />

                    <ActionButton
                        icon={<ExternalLink />}
                        label="Visit"
                    />
                </div>
            </motion.div>
        </div>
    );
}

export function ActionButton({
    icon,
    label,
}: {
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
        >
            <Button
                size="icon"
                variant="secondary"
                className="rounded-full bg-white/20 text-white shadow backdrop-blur-md hover:bg-white/30 transition"
            >
                {icon}
            </Button>

            <span className="text-xs mt-1 text-white drop-shadow">
                {label}
            </span>
        </motion.div>
    );
}