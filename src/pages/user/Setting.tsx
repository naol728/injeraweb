import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store/hook'
import { logout } from '@/store/slices/authSlice'
import { fetchuserprofile, updateUserProfile } from '@/api/profile'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    User, Mail, Phone, Calendar, MapPin, Edit2, Save, X, Globe,
    Wallet, Trophy, Eye, MessageSquare, Share2, Check, Lock,
    Bell, Shield, CreditCard, LogOut, AlertTriangle, Camera,
    Linkedin, Twitter, Instagram, Facebook, Clock, Award
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import WithdrawHistory from './WithdrawHistory'
import { getWalletBalance } from "@/api/wallet"
export default function Setting() {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const [isEditing, setIsEditing] = useState(false)
    const [editedData, setEditedData] = useState<any>({})
    const { data: balance } = useQuery({
        queryKey: ["getWalletBalance"],
        queryFn: getWalletBalance,
        refetchInterval: 2000
    })
    // Fetch user profile
    const { data: profileData, isLoading, error } = useQuery({
        queryKey: ["fetchuserprofile"],
        queryFn: fetchuserprofile,
    })

    // Update user profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: updateUserProfile,
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey: ["fetchuserprofile"] });
            const previousData = queryClient.getQueryData(["fetchuserprofile"]);

            queryClient.setQueryData(["fetchuserprofile"], (old: any) => ({
                ...old,
                profile: {
                    ...old?.profile,
                    ...newData,
                    profile_picture: newData.profile_picture instanceof File
                        ? editedData.profile_picture_preview
                        : newData.profile_picture
                }
            }));

            return { previousData };
        },
        onError: (err, newData, context) => {
            queryClient.setQueryData(["fetchuserprofile"], context?.previousData);
            const errorMessage = err instanceof Error ? err.message : "Failed to update profile. Please try again.";
            toast.error("Update failed", { description: errorMessage });
        },
        onSuccess: () => {
            toast.success("Profile updated", { description: "Your profile has been updated successfully." });
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ["fetchuserprofile"] });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["fetchuserprofile"] });
        },
    });

    useEffect(() => {
        return () => {
            if (editedData.profile_picture_preview) {
                URL.revokeObjectURL(editedData.profile_picture_preview);
            }
        };
    }, [editedData.profile_picture_preview]);

    useEffect(() => {
        if (profileData?.profile) {
            setEditedData(profileData.profile)
        }
    }, [profileData])

    const handleInputChange = (field: string, value: string) => {
        setEditedData((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleSave = () => {
        const updatePayload: Record<string, any> = {};

        Object.entries(editedData).forEach(([key, value]) => {
            if (['profile_picture_preview'].includes(key)) return;
            if (['id', 'user_id', 'created_at', 'updated_at', 'last_active_at'].includes(key)) return;

            if (key === 'profile_picture' && value instanceof File) {
                updatePayload[key] = value;
                return;
            }

            const originalValue = profileData?.profile?.[key];
            if (value !== originalValue) {
                updatePayload[key] = value;
            }
        });

        if (Object.keys(updatePayload).length === 0) {
            toast.info("No changes detected", { description: "Make some changes before saving." });
            return;
        }

        updateProfileMutation.mutate(updatePayload, {
            onSuccess: () => {
                setEditedData(prev => {
                    const newData = { ...prev };
                    delete newData.profile_picture_preview;
                    return newData;
                });
            }
        });
    };

    const handleCancel = () => {
        setEditedData(profileData?.profile || {})
        setIsEditing(false)
    }

    const handleLogout = () => {
        toast.info("Logging out...", { description: "You will be redirected to the login page." })
        dispatch(logout())
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            })
        } catch {
            return 'Invalid date'
        }
    }

    const getInitials = () => {
        const firstName = editedData?.first_name || ''
        const lastName = editedData?.last_name || ''
        if (firstName || lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
        return 'U'
    }

    if (isLoading) {
        return <SettingsSkeleton />
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
                <Card className="max-w-md mx-4 text-center">
                    <CardContent className="pt-8 pb-6">
                        <div className="mb-4 p-3 bg-destructive/10 rounded-full w-fit mx-auto">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Failed to Load Profile</h3>
                        <p className="text-muted-foreground text-sm mb-4">Unable to fetch your profile information</p>
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const profile = profileData?.profile || {}

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-sm">
                <div className="container mx-auto px-4 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                                Profile Settings
                            </h1>
                            <p className="text-muted-foreground text-sm mt-0.5">
                                Manage your account preferences and personal information
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancel}
                                        disabled={updateProfileMutation.isPending}
                                        className="hover:bg-muted/50"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={updateProfileMutation.isPending}
                                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                    className="border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-4 space-y-5">
                        {/* Profile Card */}
                        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
                            <div className="relative h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                            <CardContent className="pt-0 px-6 pb-6">
                                <div className="relative flex flex-col items-center -mt-12">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24 lg:h-28 lg:w-28 border-4 border-background shadow-xl ring-2 ring-primary/20">
                                            <AvatarImage
                                                src={editedData.profile_picture_preview || `${import.meta.env.VITE_PHOTO_BASE}${profile.profile_picture}` || ''}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                                                {getInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {isEditing && (
                                            <div className="absolute -bottom-2 -right-2 p-1.5 bg-primary rounded-full shadow-lg">
                                                <Camera className="h-3 w-3 text-primary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center mt-3 space-y-1">
                                        <h2 className="text-xl font-bold">
                                            {editedData.first_name || editedData.last_name
                                                ? `${editedData.first_name || ''} ${editedData.last_name || ''}`.trim()
                                                : 'Anonymous User'
                                            }
                                        </h2>
                                        <p className="text-muted-foreground text-xs font-mono">
                                            ID: {profile.user_id?.slice(0, 8)}...
                                        </p>
                                        <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary border-primary/20">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Member since {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator className="my-5" />

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-2 rounded-lg bg-muted/30">
                                        <p className="text-2xl font-bold text-primary">
                                            ${parseFloat(balance?.data?.balance || '0').toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Money Balance</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-muted/30">
                                        <p className="text-2xl font-bold text-amber-500">
                                            {parseFloat(profile.points_balance || '0').toFixed(0)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Points Balance</p>
                                    </div>
                                </div>

                                <Separator className="my-5" />

                                {/* Status */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            Account Status
                                        </span>
                                        <Badge variant={profile.is_active ? "default" : "secondary"} className="gap-1">
                                            {profile.is_active ? (
                                                <>
                                                    <Check className="h-3 w-3" />
                                                    Active
                                                </>
                                            ) : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-8 space-y-5">
                        <Tabs defaultValue="personal" className="w-full">
                            <TabsList className="grid grid-cols-4 w-full bg-muted/50 p-1 rounded-xl">
                                <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    Personal Info
                                </TabsTrigger>
                                <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    Account
                                </TabsTrigger>
                                <TabsTrigger value="withdraw" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    Withdrawals
                                </TabsTrigger>
                                <TabsTrigger value="privacy" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    Privacy
                                </TabsTrigger>
                            </TabsList>

                            {/* Personal Info Tab */}
                            <TabsContent value="personal" className="space-y-5 mt-6">
                                <Card className="border-0 shadow-lg">
                                    <CardHeader className="pb-4 border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-primary" />
                                            Personal Information
                                        </CardTitle>
                                        <CardDescription>Update your personal details and contact information</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    value={editedData.first_name || ''}
                                                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                                                    disabled={!isEditing}
                                                    placeholder="Enter your first name"
                                                    className={!isEditing ? "bg-muted/30" : ""}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    value={editedData.last_name || ''}
                                                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                                                    disabled={!isEditing}
                                                    placeholder="Enter your last name"
                                                    className={!isEditing ? "bg-muted/30" : ""}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                value={editedData.bio || ''}
                                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="Tell others about yourself..."
                                                rows={3}
                                                className={!isEditing ? "bg-muted/30 resize-none" : "resize-none"}
                                            />
                                            <p className="text-xs text-muted-foreground">Brief description for your profile</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={editedData.phone_number || ''}
                                                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                                    disabled={!isEditing}
                                                    placeholder="+1 (555) 123-4567"
                                                    className={!isEditing ? "bg-muted/30" : ""}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="dob" className="text-sm font-medium">Date of Birth</Label>
                                                <Input
                                                    id="dob"
                                                    type="date"
                                                    value={editedData.date_of_birth || ''}
                                                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                                    disabled={!isEditing}
                                                    className={!isEditing ? "bg-muted/30" : ""}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                                                <Input
                                                    id="gender"
                                                    value={editedData.gender || ''}
                                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                                    disabled={!isEditing}
                                                    placeholder="Prefer not to say"
                                                    className={!isEditing ? "bg-muted/30" : ""}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="profilePicture" className="text-sm font-medium">Profile Picture</Label>
                                                <Input
                                                    id="profilePicture"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            if (file.size > 5 * 1024 * 1024) {
                                                                toast.error("File too large", { description: "Profile picture must be less than 5MB." });
                                                                return;
                                                            }
                                                            if (!file.type.startsWith('image/')) {
                                                                toast.error("Invalid file type", { description: "Please upload an image file." });
                                                                return;
                                                            }
                                                            handleInputChange('profile_picture', file);
                                                            const previewUrl = URL.createObjectURL(file);
                                                            setEditedData(prev => ({ ...prev, profile_picture_preview: previewUrl }));
                                                        }
                                                    }}
                                                    disabled={!isEditing}
                                                    className="cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-lg">
                                    <CardHeader className="pb-4 border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            Location
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                                                <Input
                                                    id="country"
                                                    value={editedData.country || ''}
                                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                                    disabled={!isEditing}
                                                    placeholder="Enter your country"
                                                    className={!isEditing ? "bg-muted/30" : ""}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="city" className="text-sm font-medium">City</Label>
                                                <Input
                                                    id="city"
                                                    value={editedData.city || ''}
                                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                                    disabled={!isEditing}
                                                    placeholder="Enter your city"
                                                    className={!isEditing ? "bg-muted/30" : ""}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                                            <Input
                                                id="address"
                                                value={editedData.address || ''}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="Enter your full address"
                                                className={!isEditing ? "bg-muted/30" : ""}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Account Tab */}
                            <TabsContent value="account" className="space-y-5 mt-6">
                                <Card className="border-0 shadow-lg">
                                    <CardHeader className="pb-4 border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5 text-primary" />
                                            Preferences
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="favoriteCategories" className="text-sm font-medium">Favorite Categories</Label>
                                            <Input
                                                id="favoriteCategories"
                                                value={editedData.favorite_categories || ''}
                                                onChange={(e) => handleInputChange('favorite_categories', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="Enter your favorite categories (comma separated)"
                                                className={!isEditing ? "bg-muted/30" : ""}
                                            />
                                            <p className="text-xs text-muted-foreground">Used to personalize your experience</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="paymentMethods" className="text-sm font-medium">Payment Methods</Label>
                                            <Input
                                                id="paymentMethods"
                                                value={editedData.payment_methods || ''}
                                                onChange={(e) => handleInputChange('payment_methods', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="Enter your payment methods"
                                                className={!isEditing ? "bg-muted/30" : ""}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                                <WithdrawHistory />
                            </TabsContent>

                            {/* Withdraw Tab */}
                            <TabsContent value="withdraw" className="space-y-5 mt-6">
                                <WithdrawHistory />
                            </TabsContent>

                            {/* Privacy Tab */}
                            <TabsContent value="privacy" className="space-y-5 mt-6">
                                <Card className="border-0 shadow-lg">
                                    <CardHeader className="pb-4 border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-primary" />
                                            Account Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <LogOut className="h-4 w-4 text-destructive" />
                                                        <p className="font-semibold text-destructive">Logout</p>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Sign out of your account</p>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm("Are you sure you want to logout?")) {
                                                            handleLogout();
                                                        }
                                                    }}
                                                    className="shadow-sm"
                                                >
                                                    Logout
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-lg">
                                    <CardHeader className="pb-4 border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-primary" />
                                            Session Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between py-2 border-b">
                                                <span className="text-sm font-medium text-muted-foreground">Account Created</span>
                                                <span className="text-sm font-medium">{formatDate(profile.created_at)}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-2 border-b">
                                                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                                                <span className="text-sm font-medium">{formatDate(profile.updated_at)}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm font-medium text-muted-foreground">Last Active</span>
                                                <span className="text-sm font-medium">{profile.last_active_at ? formatDate(profile.last_active_at) : 'Never'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Skeleton Loader Component
function SettingsSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-4 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-9 w-32" />
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    <div className="lg:col-span-4 space-y-5">
                        <Skeleton className="h-[400px] rounded-xl" />
                        <Skeleton className="h-[200px] rounded-xl" />
                    </div>
                    <div className="lg:col-span-8 space-y-5">
                        <Skeleton className="h-[500px] rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}