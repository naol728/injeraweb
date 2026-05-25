import { useState, type ChangeEvent, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation, useQuery } from "@tanstack/react-query"
import { X, Upload, DollarSign, MapPin, Tag, Video, Image as ImageIcon, Package } from "lucide-react"
import { toast } from "sonner"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { getCatagory } from "@/api/catagory"
import { postAdFeed } from "@/api/feed"
import { cn } from "@/lib/utils"

/* ---------------- TYPES ---------------- */

interface AdFormData {
    title: string
    description: string
    tag_names: string
    category_id: string
    video: File | null
    is_orderable: boolean
    price?: string
    location?: string
    images?: File[]
}

interface UploadProgress {
    fileName: string
    progress: number
}

/* ---------------- COMPONENT ---------------- */

export default function UploadAd() {
    const { data: categories } = useQuery({
        queryKey: ["getCatagory"],
        queryFn: getCatagory,
        onError: () => {
            toast.error("Failed to load categories", {
                description: "Please try again later",
            })
        }
    })

    const { mutate, isPending } = useMutation({
        mutationKey: ["postAdFeed"],
        mutationFn: postAdFeed,
        onSuccess: () => {
            toast.success("Ad Campaign Created Successfully!", {
                description: "Your ad is now live and visible to customers",
                duration: 5000,
                action: {
                    label: "View",
                    onClick: () => console.log("Navigate to ad"),
                },
            })

            // Reset form after successful upload
            setFormData({
                title: "",
                description: "",
                tag_names: "",
                category_id: "",
                video: null,
                is_orderable: false,
                price: "",
                location: "",
                images: [],
            })
            setActiveTab("basic")
        },
        onError: (error: any) => {
            toast.error("Failed to Create Ad Campaign", {
                description: error?.message || "Please check your details and try again",
                duration: 5000,
                action: {
                    label: "Retry",
                    onClick: () => {
                        // You could implement retry logic here
                        const fd = prepareFormData()
                        if (fd) {
                            mutate(fd)
                        }
                    },
                },
            })
        }
    })

    const [formdata, setFormData] = useState<AdFormData>({
        title: "",
        description: "",
        tag_names: "",
        category_id: "",
        video: null,
        is_orderable: false,
        price: "",
        location: "",
        images: [],
    })

    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
    const [activeTab, setActiveTab] = useState("basic")

    /* ---------------- HANDLERS ---------------- */

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setFormData(prev => ({ ...prev, video: file }))
        if (file) {
            simulateUploadProgress(file.name)
            toast.info("Video Upload Started", {
                description: `Uploading ${file.name}...`,
                duration: 3000,
            })
        }
    }

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : []
        setFormData(prev => ({ ...prev, images: files }))
        if (files.length > 0) {
            toast.info("Product Images Uploaded", {
                description: `${files.length} image${files.length > 1 ? 's' : ''} selected`,
                duration: 3000,
            })
        }
    }

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index),
        }))
        toast.info("Image Removed", {
            description: "Image has been removed from selection",
            duration: 2000,
        })
    }

    const simulateUploadProgress = (fileName: string) => {
        setUploadProgress({ fileName, progress: 0 })

        toast.loading(`Uploading ${fileName}...`, {
            id: "video-upload",
            duration: Infinity,
        })

        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (!prev) return null
                if (prev.progress >= 100) {
                    clearInterval(interval)
                    setTimeout(() => {
                        setUploadProgress(null)
                        toast.success("Video Upload Complete!", {
                            id: "video-upload",
                            description: "Video is ready for your ad campaign",
                            duration: 3000,
                        })
                    }, 1000)
                    return null
                }
                return { ...prev, progress: prev.progress + 10 }
            })
        }, 100)
    }

    /* ---------------- FORM PREPARATION ---------------- */

    const prepareFormData = () => {
        if (!formdata.video) {
            toast.error("Video Required", {
                description: "Please upload an ad video to continue",
            })
            return null
        }

        if (formdata.is_orderable) {
            if (!formdata.price || !formdata.location) {
                toast.error("Product Details Required", {
                    description: "Please fill all product details",
                })
                return null
            }
        }

        const fd = new FormData()

        // Ad (ALWAYS)
        fd.append("title", formdata.title)
        fd.append("description", formdata.description)
        fd.append("category_id", formdata.category_id)
        fd.append("is_orderable", formdata.is_orderable ? "1" : "0")
        fd.append("file", formdata.video)

        // Tags
        formdata.tag_names
            .split(",")
            .map(t => t.trim())
            .filter(Boolean)
            .forEach((tag, i) => {
                fd.append(`tag_names[${i}]`, tag)
            })

        // Product (ONLY IF ORDERABLE)
        if (formdata.is_orderable) {
            fd.append("price", formdata.price)
            fd.append("location", formdata.location)

            formdata.images?.forEach((img, i) => {
                fd.append(`image[${i}]`, img)
            })
        }

        return fd
    }

    /* ---------------- SUBMIT ---------------- */

    const submitForm = (e: FormEvent) => {
        e.preventDefault()

        const fd = prepareFormData()
        if (!fd) return

        // Show loading toast
        toast.loading("Creating your ad campaign...", {
            id: "ad-creation",
            duration: Infinity,
            description: "This may take a few moments",
        })

        mutate(fd, {
            onSettled: () => {
                // Dismiss the loading toast when mutation completes
                toast.dismiss("ad-creation")
            }
        })
    }

    /* ---------------- UI ---------------- */

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-bakground/20 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-6 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-3xl font-bold">Create New Ad Campaign</CardTitle>
                                    <CardDescription className="text-base mt-2">
                                        Promote your product with engaging video content
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="text-sm px-3 py-1">
                                    <Package className="w-4 h-4 mr-2" />
                                    {formdata.is_orderable ? "Product Ad" : "Brand Ad"}
                                </Badge>
                            </div>

                            {/* Progress Steps */}
                            <div className="flex items-center gap-4 mt-6">
                                {["Basic Info", "Media", "Product", "Review"].map((step, index) => (
                                    <div key={step} className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                            activeTab === step.toLowerCase().replace(" ", "-")
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                        )}>
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium">{step}</span>
                                        {index < 3 && <div className="w-8 h-px bg-muted" />}
                                    </div>
                                ))}
                            </div>
                        </CardHeader>

                        <form onSubmit={submitForm}>
                            <CardContent className="pt-8">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid grid-cols-4 mb-8">
                                        <TabsTrigger value="basic" className="data-[state=active]:bg-primary/10">
                                            <span className="hidden sm:inline">Basic Info</span>
                                            <span className="sm:hidden">Basic</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="media" className="data-[state=active]:bg-primary/10">
                                            Media
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="product"
                                            className="data-[state=active]:bg-primary/10"
                                            disabled={!formdata.is_orderable}
                                        >
                                            Product
                                        </TabsTrigger>
                                        <TabsTrigger value="review" className="data-[state=active]:bg-primary/10">
                                            Review
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Basic Info Tab */}
                                    <TabsContent value="basic" className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-sm font-medium">
                                                        <Tag className="w-4 h-4" />
                                                        Ad Title
                                                    </Label>
                                                    <Input
                                                        name="title"
                                                        value={formdata.title}
                                                        onChange={handleChange}
                                                        placeholder="Enter a compelling title for your ad"
                                                        className="h-11"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-sm font-medium">
                                                        Category
                                                    </Label>
                                                    <Select
                                                        value={formdata.category_id}
                                                        onValueChange={v =>
                                                            setFormData(prev => ({ ...prev, category_id: v }))
                                                        }
                                                    >
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories?.map((c: any) => (
                                                                <SelectItem key={c.id} value={String(c.id)}>
                                                                    {c.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-sm font-medium">
                                                        Tags
                                                    </Label>
                                                    <Input
                                                        name="tag_names"
                                                        value={formdata.tag_names}
                                                        onChange={handleChange}
                                                        placeholder="electronics, phone, sale, etc."
                                                        className="h-11"
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Separate tags with commas
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                    Description
                                                </Label>
                                                <Textarea
                                                    name="description"
                                                    value={formdata.description}
                                                    onChange={handleChange}
                                                    placeholder="Describe your product or service in detail..."
                                                    className="min-h-[160px]"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Media Tab */}
                                    <TabsContent value="media" className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                    <Video className="w-4 h-4" />
                                                    Ad Video (Required)
                                                </Label>
                                                <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-6 text-center hover:border-primary/30 transition-colors">
                                                    <Input
                                                        type="file"
                                                        accept="video/mp4,video/mov,video/avi"
                                                        required
                                                        onChange={handleVideoChange}
                                                        className="hidden"
                                                        id="video-upload"
                                                    />
                                                    <Label htmlFor="video-upload" className="cursor-pointer">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <Upload className="w-8 h-8 text-muted-foreground" />
                                                            <div>
                                                                <p className="font-medium">Click to upload video</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    MP4, MOV, AVI up to 100MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Label>
                                                </div>

                                                <AnimatePresence>
                                                    {uploadProgress && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="pt-2"
                                                        >
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span>{uploadProgress.fileName}</span>
                                                                    <span>{uploadProgress.progress}%</span>
                                                                </div>
                                                                <Progress value={uploadProgress.progress} />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {formdata.video && !uploadProgress && (
                                                    <div className="mt-2 p-3 bg-primary/5 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Video className="w-4 h-4 text-primary" />
                                                                <span className="text-sm">{formdata.video.name}</span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {(formdata.video.size / (1024 * 1024)).toFixed(2)} MB
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Product Tab */}
                                    <TabsContent value="product" className="space-y-6">
                                        <div className="space-y-4 p-4 border rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Label className="text-base font-semibold">Product Details</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Configure product information for direct sales
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formdata.is_orderable}
                                                    onCheckedChange={v => {
                                                        setFormData(prev => ({ ...prev, is_orderable: v }))
                                                        if (v) {
                                                            toast.info("Product Mode Enabled", {
                                                                description: "You can now add product details",
                                                                duration: 3000,
                                                            })
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <Separator />

                                            <AnimatePresence>
                                                {formdata.is_orderable && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-4 pt-4"
                                                    >
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                                    <DollarSign className="w-4 h-4" />
                                                                    Price (ETB)
                                                                </Label>
                                                                <Input
                                                                    name="price"
                                                                    type="number"
                                                                    value={formdata.price}
                                                                    onChange={handleChange}
                                                                    placeholder="Enter price"
                                                                    className="h-11"
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                                    <MapPin className="w-4 h-4" />
                                                                    Location
                                                                </Label>
                                                                <Input
                                                                    name="location"
                                                                    value={formdata.location}
                                                                    onChange={handleChange}
                                                                    placeholder="City, Country"
                                                                    className="h-11"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="flex items-center gap-2 text-sm font-medium">
                                                                <ImageIcon className="w-4 h-4" />
                                                                Product Images
                                                            </Label>
                                                            <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-6 text-center">
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    multiple
                                                                    onChange={handleImageChange}
                                                                    className="hidden"
                                                                    id="image-upload"
                                                                />
                                                                <Label htmlFor="image-upload" className="cursor-pointer">
                                                                    <div className="flex flex-col items-center gap-3">
                                                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                                                        <div>
                                                                            <p className="font-medium">Upload product images</p>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                JPG, PNG up to 5MB each
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </Label>
                                                            </div>

                                                            {formdata.images && formdata.images.length > 0 && (
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                                                                    {formdata.images.map((img, i) => (
                                                                        <div key={i} className="relative group">
                                                                            <div className="aspect-square rounded-lg overflow-hidden border">
                                                                                <img
                                                                                    src={URL.createObjectURL(img)}
                                                                                    alt={`Product ${i + 1}`}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                            {i === 0 && (
                                                                                <Badge className="absolute top-2 left-2 text-xs">
                                                                                    Main
                                                                                </Badge>
                                                                            )}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeImage(i)}
                                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </TabsContent>

                                    {/* Review Tab */}
                                    <TabsContent value="review" className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold">Basic Information</h3>
                                                        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Title</p>
                                                                <p className="font-medium">{formdata.title || "Not set"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Category</p>
                                                                <p className="font-medium">
                                                                    {categories?.find((c: any) => String(c.id) === formdata.category_id)?.name || "Not selected"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold">Product Settings</h3>
                                                        <div className="p-3 bg-muted/30 rounded-lg">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm">Orderable</span>
                                                                <Badge variant={formdata.is_orderable ? "default" : "outline"}>
                                                                    {formdata.is_orderable ? "Enabled" : "Disabled"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold">Media</h3>
                                                        <div className="p-3 bg-muted/30 rounded-lg">
                                                            {formdata.video ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Video className="w-4 h-4" />
                                                                    <span className="text-sm">{formdata.video.name}</span>
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">No video uploaded</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {formdata.is_orderable && (
                                                        <div className="space-y-2">
                                                            <h3 className="font-semibold">Product Details</h3>
                                                            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Price</p>
                                                                    <p className="font-medium">{formdata.price ? `ETB ${formdata.price}` : "Not set"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Location</p>
                                                                    <p className="font-medium">{formdata.location || "Not set"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Images</p>
                                                                    <p className="font-medium">{formdata.images?.length || 0} uploaded</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>

                            <CardFooter className="flex flex-col sm:flex-row gap-4 border-t pt-6">
                                <div className="flex-1 text-sm text-muted-foreground">
                                    By creating this ad, you agree to our terms and conditions.
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            const tabs = ["basic", "media", "product", "review"]
                                            const currentIndex = tabs.indexOf(activeTab)
                                            if (currentIndex > 0) {
                                                setActiveTab(tabs[currentIndex - 1])
                                            }
                                        }}
                                        disabled={activeTab === "basic"}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            const tabs = ["basic", "media", "product", "review"]
                                            const currentIndex = tabs.indexOf(activeTab)
                                            if (currentIndex < tabs.length - 1) {
                                                setActiveTab(tabs[currentIndex + 1])
                                            }
                                        }}
                                        disabled={activeTab === "review"}
                                    >
                                        Next
                                    </Button>
                                    {activeTab === "review" && (
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                            disabled={isPending}
                                        >
                                            {isPending ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                                    Publishing...
                                                </>
                                            ) : (
                                                "Publish Ad Campaign"
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}