import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ActionButton } from './VideoCard';
import { Copy, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export default function ShareDialog({ v }: { v: { video_url: string } }) {
    return (
        <Dialog>
            <DialogTrigger>
                <ActionButton icon={<Share2 />} label="Share" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share to your friends?</DialogTitle>

                    <DialogHeader>
                        Copy the link and send to your friends

                    </DialogHeader>
                    <DialogDescription>
                        <div className="flex flex-col gap-3">
                            <label className="text-sm text-muted-foreground">Shareable link</label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={v.video_url}
                                    className="flex-1 rounded-md border border-muted/30 bg-muted/10 px-3 py-2 text-sm text-foreground"
                                />
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        const url = v.video_url || "";
                                        if (navigator.clipboard?.writeText) {
                                            navigator.clipboard
                                                .writeText(url)
                                                .then(() => toast.success("Link copied to clipboard"))
                                                .catch(() => {
                                                    const ta = document.createElement("textarea");
                                                    ta.value = url;
                                                    document.body.appendChild(ta);
                                                    ta.select();
                                                    document.execCommand("copy");
                                                    document.body.removeChild(ta);
                                                    toast.error("Link copied to clipboard");
                                                });
                                        } else {
                                            const ta = document.createElement("textarea");
                                            ta.value = url;
                                            document.body.appendChild(ta);
                                            ta.select();
                                            document.execCommand("copy");
                                            document.body.removeChild(ta);
                                            alert("Link copied to clipboard");
                                        }
                                    }}
                                >
                                    <Copy />
                                </Button>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
