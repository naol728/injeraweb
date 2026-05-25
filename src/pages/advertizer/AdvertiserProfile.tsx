import { fetchadvertiserownprofile } from '@/api/profile'
import { updateadveriserprofile } from '@/api/profile'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
    Edit, Save, X, Camera, Mail, Phone, Globe,
    MapPin, Building, Briefcase, DollarSign,
    Eye, Calendar, CheckCircle, Clock, TrendingUp,
    Users, Shield, CreditCard, Upload, Trash2,
    User, Link2, AlertCircle, CheckCheck, Award
} from 'lucide-react'
import { cn } from '@/lib/utils'

// shadcn/ui components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AdvertiserProfile() {
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState<any>({})
    const [activeTab, setActiveTab] = useState('overview')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string>('')
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>('')
    const [coverImagePreview, setCoverImagePreview] = useState<string>('')

    const logoInputRef = useRef<HTMLInputElement>(null)
    const profilePictureInputRef = useRef<HTMLInputElement>(null)
    const coverImageInputRef = useRef<HTMLInputElement>(null)

    // Fetch profile data
    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["fetchadvertiserownprofile"],
        queryFn: fetchadvertiserownprofile,
    })

    // Update profile mutation
    const updateMutation = useMutation({
        mutationFn: updateadveriserprofile,
        onSuccess: (response) => {
            toast.success('Profile updated successfully', {
                description: 'Your changes have been saved.',
                icon: <CheckCheck className="w-4 h-4" />,
            })
            queryClient.invalidateQueries({ queryKey: ["fetchadvertiserownprofile"] })
            setIsEditing(false)
            setLogoFile(null)
            setProfilePictureFile(null)
            setCoverImageFile(null)
            setLogoPreview('')
            setProfilePicturePreview('')
            setCoverImagePreview('')
        },
        onError: (error: any) => {
            toast.error('Update failed', {
                description: error?.message || 'Please try again later.',
                icon: <AlertCircle className="w-4 h-4" />,
            })
        }
    })

    // Initialize edit data when data loads
    useEffect(() => {
        if (data) {
            setEditData(data)
        }
    }, [data])

    const handleInputChange = (field: string, value: any) => {
        setEditData((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleFileSelect = (type: 'logo' | 'profile_picture' | 'cover_image', file: File) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const preview = reader.result as string
            if (type === 'logo') { setLogoFile(file); setLogoPreview(preview) }
            if (type === 'profile_picture') { setProfilePictureFile(file); setProfilePicturePreview(preview) }
            if (type === 'cover_image') { setCoverImageFile(file); setCoverImagePreview(preview) }
        }
        reader.readAsDataURL(file)
    }

    const removeImage = (type: 'logo' | 'profile_picture' | 'cover_image') => {
        if (type === 'logo') { setLogoFile(null); setLogoPreview(''); if (logoInputRef.current) logoInputRef.current.value = '' }
        if (type === 'profile_picture') { setProfilePictureFile(null); setProfilePicturePreview(''); if (profilePictureInputRef.current) profilePictureInputRef.current.value = '' }
        if (type === 'cover_image') { setCoverImageFile(null); setCoverImagePreview(''); if (coverImageInputRef.current) coverImageInputRef.current.value = '' }
    }

    const handleSave = async () => {
        try {
            const formData = new FormData()
            Object.entries(editData).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (!['logo', 'profile_picture', 'cover_image'].includes(key)) {
                        formData.append(key, value.toString())
                    }
                }
            })
            if (logoFile) formData.append('logo', logoFile)
            if (profilePictureFile) formData.append('profile_picture', profilePictureFile)
            if (coverImageFile) formData.append('cover_image', coverImageFile)
            await updateMutation.mutateAsync({ data: formData })
        } catch (error) {
            console.error('Error saving profile:', error)
        }
    }

    const handleCancel = () => {
        if (data) setEditData(data)
        setLogoFile(null); setProfilePictureFile(null); setCoverImageFile(null)
        setLogoPreview(''); setProfilePicturePreview(''); setCoverImagePreview('')
        if (logoInputRef.current) logoInputRef.current.value = ''
        if (profilePictureInputRef.current) profilePictureInputRef.current.value = ''
        if (coverImageInputRef.current) coverImageInputRef.current.value = ''
        setIsEditing(false)
    }

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(amount))
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
    }

    const calculateProfileCompletion = () => {
        if (!data) return 0
        const fields = [
            data.company_name && data.company_name !== 'Pending',
            data.business_email,
            data.phone_number && data.phone_number !== 'Pending',
            data.website,
            data.logo,
            data.profile_picture,
            data.cover_image,
            data.description,
            data.country && data.country !== 'Pending',
            data.city && data.city !== 'Pending',
            data.address,
        ]
        const completed = fields.filter(Boolean).length
        return Math.round((completed / fields.length) * 100)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-72" />
                            </div>
                            <Skeleton className="h-10 w-28" />
                        </div>
                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <Skeleton className="h-64 w-full rounded-xl" />
                                <Skeleton className="h-96 w-full rounded-xl" />
                            </div>
                            <div className="space-y-6">
                                <Skeleton className="h-48 w-full rounded-xl" />
                                <Skeleton className="h-64 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <div className="mx-auto p-3 bg-destructive/10 rounded-full w-fit mb-4">
                            <AlertCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <CardTitle>Unable to load profile</CardTitle>
                        <CardDescription>{error?.message || 'Please check your connection and try again.'}</CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Button onClick={() => refetch()} variant="outline">Retry</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    const profileCompletion = calculateProfileCompletion()
    const isPremium = data.subscription_plan !== 'free'
    const isActive = data.is_active

    const getImageUrl = (imagePath: string | null) => {
        if (!imagePath) return ''
        if (imagePath.startsWith('http')) return imagePath
        return `${import.meta.env.VITE_PHOTO_BASE}${imagePath}`
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Advertiser Profile</h1>
                            <p className="text-muted-foreground mt-1">Manage your account, business details, and preferences</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant={isActive ? "default" : "secondary"} className="gap-1.5 px-3 py-1">
                                {isActive ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {!isEditing && (
                                <Button onClick={() => setIsEditing(true)} className="gap-2 shadow-sm">
                                    <Edit className="w-4 h-4" />
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Profile Completion Card */}
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                                <div>
                                    <h3 className="font-semibold">Profile Strength</h3>
                                    <p className="text-sm text-muted-foreground">Complete your profile to maximize visibility</p>
                                </div>
                                <Badge variant={profileCompletion === 100 ? "default" : "outline"} className="w-fit">
                                    {profileCompletion}% Complete
                                </Badge>
                            </div>
                            <Progress value={profileCompletion} className="h-2" />
                            {profileCompletion < 100 && (
                                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Add missing information to improve your profile
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tabs Navigation */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid grid-cols-3 w-full max-w-md">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="business">Business</TabsTrigger>
                        </TabsList>

                        {/* OVERVIEW TAB */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Stats Grid - Left 2 columns */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <Card>
                                            <CardContent className="p-5">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Total Ads</p>
                                                        <p className="text-3xl font-bold mt-1">{data.total_ads_uploaded || 0}</p>
                                                    </div>
                                                    <div className="p-2.5 bg-primary/10 rounded-xl">
                                                        <Briefcase className="w-5 h-5 text-primary" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-5">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                                                        <p className="text-3xl font-bold mt-1">{(data.total_ad_views || 0).toLocaleString()}</p>
                                                    </div>
                                                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                                        <Eye className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-5">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                                                        <p className="text-3xl font-bold mt-1">{formatCurrency(data.total_spent || '0')}</p>
                                                    </div>
                                                    <div className="p-2.5 bg-amber-500/10 rounded-xl">
                                                        <DollarSign className="w-5 h-5 text-amber-500" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Account Details */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg">Account Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-muted rounded-lg mt-0.5"><Shield className="w-4 h-4 text-muted-foreground" /></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Subscription</p>
                                                        <Badge variant={isPremium ? "default" : "secondary"} className="mt-1">
                                                            {data.subscription_plan || 'Free'}
                                                        </Badge>
                                                        {!data.subscription_active && <p className="text-xs text-muted-foreground mt-1">Inactive</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-muted rounded-lg mt-0.5"><Mail className="w-4 h-4 text-muted-foreground" /></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Email Status</p>
                                                        <Badge variant={data.email_verified_at ? "default" : "outline"} className="mt-1 gap-1">
                                                            {data.email_verified_at ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                            {data.email_verified_at ? 'Verified' : 'Pending'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-muted rounded-lg mt-0.5"><Calendar className="w-4 h-4 text-muted-foreground" /></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                                                        <p className="text-sm font-medium mt-1">{formatDate(data.user_created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-muted rounded-lg mt-0.5"><Clock className="w-4 h-4 text-muted-foreground" /></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                                        <p className="text-sm font-medium mt-1">{formatDate(data.user_updated_at)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column - Company Snapshot */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg">Company Snapshot</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-16 w-16 border-2 shadow-sm">
                                                    <AvatarImage src={getImageUrl(data.logo)} alt={data.company_name} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                                        {data.company_name?.charAt(0) || 'C'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-lg">{data.company_name}</p>
                                                    <p className="text-sm text-muted-foreground">{data.industry || 'Advertising'}</p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{data.city && data.city !== 'Pending' ? `${data.city}, ${data.country}` : 'Location not set'}</span>
                                                </div>
                                                {data.website && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Globe className="w-4 h-4" />
                                                        <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                                            {data.website.replace(/^https?:\/\//, '')}
                                                        </a>
                                                    </div>
                                                )}
                                                {data.business_email && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Mail className="w-4 h-4" />
                                                        <span>{data.business_email}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {data.description && (
                                                <>
                                                    <Separator />
                                                    <div>
                                                        <p className="text-sm font-medium mb-1">About</p>
                                                        <p className="text-sm text-muted-foreground line-clamp-3">{data.description}</p>
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* PROFILE TAB */}
                        <TabsContent value="profile" className="space-y-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <CardTitle>Personal & Visual Identity</CardTitle>
                                        <CardDescription>Manage your profile images and personal details</CardDescription>
                                    </div>
                                    {!isEditing && (
                                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                                            <Edit className="w-4 h-4" /> Edit
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {/* Images Section */}
                                    <div className="grid md:grid-cols-3 gap-8">
                                        {/* Profile Picture */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium">Profile Picture</Label>
                                            <div className="flex flex-col items-center gap-3">
                                                <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                                                    <AvatarImage src={profilePicturePreview || getImageUrl(data.profile_picture)} />
                                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-2xl">
                                                        <User className="w-8 h-8 text-primary" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                {isEditing && (
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => profilePictureInputRef.current?.click()} className="gap-1">
                                                            <Camera className="w-3.5 h-3.5" /> Change
                                                        </Button>
                                                        {(profilePicturePreview || data.profile_picture) && (
                                                            <Button variant="ghost" size="sm" onClick={() => removeImage('profile_picture')} className="gap-1 text-destructive">
                                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                                <input type="file" ref={profilePictureInputRef} accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect('profile_picture', e.target.files[0])} className="hidden" />
                                            </div>
                                        </div>
                                        {/* Company Logo */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium">Company Logo</Label>
                                            <div className="flex flex-col items-center gap-3">
                                                <Avatar className="h-28 w-28 border-4 border-background shadow-md bg-white">
                                                    <AvatarImage src={logoPreview || getImageUrl(data.logo)} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-2xl font-bold text-primary">
                                                        {data.company_name?.charAt(0) || 'C'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {isEditing && (
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} className="gap-1">
                                                            <Camera className="w-3.5 h-3.5" /> Change
                                                        </Button>
                                                        {(logoPreview || data.logo) && (
                                                            <Button variant="ghost" size="sm" onClick={() => removeImage('logo')} className="gap-1 text-destructive">
                                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                                <input type="file" ref={logoInputRef} accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect('logo', e.target.files[0])} className="hidden" />
                                            </div>
                                        </div>
                                        {/* Cover Image */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium">Cover Image</Label>
                                            <div className="relative h-28 w-full rounded-lg overflow-hidden border bg-muted/30">
                                                <img src={coverImagePreview || getImageUrl(data.cover_image)} alt="Cover" className="w-full h-full object-cover" />
                                            </div>
                                            {isEditing && (
                                                <div className="flex gap-2 justify-center">
                                                    <Button variant="outline" size="sm" onClick={() => coverImageInputRef.current?.click()} className="gap-1">
                                                        <Camera className="w-3.5 h-3.5" /> Change
                                                    </Button>
                                                    {(coverImagePreview || data.cover_image) && (
                                                        <Button variant="ghost" size="sm" onClick={() => removeImage('cover_image')} className="gap-1 text-destructive">
                                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                            <input type="file" ref={coverImageInputRef} accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect('cover_image', e.target.files[0])} className="hidden" />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Contact & Basic Info */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Username</Label>
                                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 text-sm">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <span>{data.username}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email Address</Label>
                                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 text-sm">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    <span>{data.email}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Phone Number</Label>
                                                {isEditing ? (
                                                    <Input value={editData.phone_number || ''} onChange={(e) => handleInputChange('phone_number', e.target.value)} />
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 text-sm">
                                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                                        <span>{data.phone_number}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Company Name</Label>
                                                {isEditing ? (
                                                    <Input value={editData.company_name || ''} onChange={(e) => handleInputChange('company_name', e.target.value)} />
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 text-sm">
                                                        <Building className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-medium">{data.company_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Business Email</Label>
                                                {isEditing ? (
                                                    <Input type="email" value={editData.business_email || ''} onChange={(e) => handleInputChange('business_email', e.target.value)} />
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 text-sm">
                                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                                        <span>{data.business_email || 'Not set'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label>Company Description</Label>
                                        {isEditing ? (
                                            <Textarea value={editData.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Describe your company..." className="min-h-[100px]" />
                                        ) : (
                                            <div className="p-3 rounded-lg border bg-muted/30 text-sm">
                                                {data.description || 'No description provided'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Edit Actions */}
                                    <AnimatePresence>
                                        {isEditing && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex justify-end gap-3 pt-4 border-t">
                                                <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>Cancel</Button>
                                                <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
                                                    {updateMutation.isPending ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Save Changes
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* BUSINESS TAB */}
                        <TabsContent value="business" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Business Location & Online Presence</CardTitle>
                                    <CardDescription>Update your business address, location, and website</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Country</Label>
                                                {isEditing ? (
                                                    <Select value={editData.country || ''} onValueChange={(val) => handleInputChange('country', val)}>
                                                        <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Ethiopia">Ethiopia</SelectItem><SelectItem value="Kenya">Kenya</SelectItem>
                                                            <SelectItem value="Nigeria">Nigeria</SelectItem><SelectItem value="South Africa">South Africa</SelectItem>
                                                            <SelectItem value="United States">United States</SelectItem><SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30">
                                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                                        <span>{data.country}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>City</Label>
                                                {isEditing ? (
                                                    <Input value={editData.city || ''} onChange={(e) => handleInputChange('city', e.target.value)} />
                                                ) : (
                                                    <div className="px-3 py-2 rounded-lg border bg-muted/30">{data.city}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Address</Label>
                                                {isEditing ? (
                                                    <Input value={editData.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} />
                                                ) : (
                                                    <div className="px-3 py-2 rounded-lg border bg-muted/30">{data.address || 'Not specified'}</div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Website</Label>
                                                {isEditing ? (
                                                    <Input type="url" value={editData.website || ''} onChange={(e) => handleInputChange('website', e.target.value)} placeholder="https://" />
                                                ) : data.website ? (
                                                    <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                                                        <Globe className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-primary hover:underline">{data.website.replace(/^https?:\/\//, '')}</span>
                                                        <Link2 className="w-3 h-3 ml-auto text-muted-foreground" />
                                                    </a>
                                                ) : (
                                                    <div className="px-3 py-2 rounded-lg border bg-muted/30 text-muted-foreground">Not set</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isEditing && activeTab === 'business' && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex justify-end gap-3 pt-4 border-t">
                                                <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>Cancel</Button>
                                                <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
                                                    {updateMutation.isPending ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Save Changes
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </div>
    )
}