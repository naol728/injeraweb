import { fetchusers, blockUser, unblockUser, assignrole } from '@/api/admin';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    Shield,
    ShieldAlert,
    User,
    UserCheck,
    Ban,
    CheckCircle,
    Mail,
    Calendar,
    Filter,
    Search,
    Download,
    RefreshCw,
    Eye,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { type UserType } from '@/types/models/user';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import CreatePaymentProcessor from './CreatePaymentProcessor';


export default function Users() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["fetchusers", currentPage, pageSize],
        queryFn: () => fetchusers({ page: currentPage, limit: pageSize }),
    });
    const { mutate: assignRoleMutate, isPending } = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: string }) =>
            assignrole({ userId, role }),
        mutationKey: ["assignrole"],
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ["fetchusers"] });

        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const blockMutation = useMutation({
        mutationFn: blockUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fetchusers"] });
            toast.success("User blocked successfully");
            setBlockDialogOpen(false);
            setSelectedUser(null);
        },
        onError: () => {
            toast.error("Failed to block user");
        },
    });

    const unblockMutation = useMutation({
        mutationFn: unblockUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fetchusers"] });
            toast.success("User unblocked successfully");
        },
        onError: () => {
            toast.error("Failed to unblock user");
        },
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'admin':
                return <Shield className="h-3.5 w-3.5" />;
            case 'advertiser':
                return <ShieldAlert className="h-3.5 w-3.5" />;
            default:
                return <User className="h-3.5 w-3.5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'admin':
                return 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100';
            case 'advertiser':
                return 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100';
            default:
                return 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'admin':
                return 'Admin';
            case 'advertiser':
                return 'Advertiser';
            case 'payment_processor':
                return "Payment Processor";
            default:
                return 'User';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not verified';
        return format(new Date(dateString), 'PP');
    };

    const formatCreatedDate = (dateString: string) => {
        return format(new Date(dateString), 'PPp');
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInHours < 168) {
            return `${Math.floor(diffInHours / 24)}d ago`;
        }
        return format(date, 'MMM dd');
    };

    const handleBlock = (user: UserType) => {
        setSelectedUser(user);
        setBlockDialogOpen(true);
    };

    const confirmBlock = () => {
        console.log(selectedUser)
        if (selectedUser) {
            blockMutation.mutate({ userid: selectedUser.id });
        }
    };

    const handleUnblock = (userId: string) => {
        unblockMutation.mutate({ userid: userId });
    };

    // Filter users based on search and filters
    const filteredUsers = React.useMemo(() => {
        if (!data?.dashboard?.lists?.all_users?.data) return [];

        return data.dashboard.lists.all_users.data.filter((user: UserType) => {
            const matchesSearch =
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && !user.is_blocking) ||
                (statusFilter === 'blocked' && user.is_blocking);

            const matchesType = typeFilter === 'all' || user.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [data, searchTerm, statusFilter, typeFilter]);

    const users = data?.dashboard?.lists?.all_users?.data || [];
    const pagination = data?.dashboard?.lists?.all_users;

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
                    <p className="text-muted-foreground">Manage all user accounts and permissions</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-7 w-12" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-48 mt-2" />
                            </div>
                            <Skeleton className="h-9 w-24" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border">
                            <div className="p-4 border-b">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Skeleton className="h-10 w-full sm:w-64" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-10 w-32" />
                                        <Skeleton className="h-10 w-32" />
                                    </div>
                                </div>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {[...Array(6)].map((_, i) => (
                                            <TableHead key={i}>
                                                <Skeleton className="h-4 w-20" />
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            {[...Array(6)].map((_, j) => (
                                                <TableCell key={j}>
                                                    <Skeleton className="h-4 w-full" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <h3 className="font-semibold text-destructive">Error loading users</h3>
                    </div>
                    <p className="mt-2 text-sm text-destructive">{error.message}</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
                        <p className="text-muted-foreground">Manage all user accounts and permissions</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.dashboard?.summary?.total_all_users || 0}</div>
                        <p className="text-xs text-muted-foreground">All registered users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.dashboard?.summary?.total_regular_users || 0}</div>
                        <p className="text-xs text-muted-foreground">Standard platform users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Advertisers</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.dashboard?.summary?.total_advertisers || 0}</div>
                        <p className="text-xs text-muted-foreground">Business accounts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admins</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter((u: UserType) => u.type === 'admin').length}
                        </div>
                        <p className="text-xs text-muted-foreground">System administrators</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>User Accounts</CardTitle>
                            <CardDescription>
                                View and manage all user accounts in the system
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">

                            <Dialog>
                                <DialogTrigger><Button variant="outline" size="sm">Create Payment Processor                            </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <CreatePaymentProcessor />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users by name or email..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="User Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="user">Users</SelectItem>
                                        <SelectItem value="advertiser">Advertisers</SelectItem>
                                        <SelectItem value="admin">Admins</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="blocked">Blocked</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div>
                                Showing <span className="font-medium">{filteredUsers.length}</span> of{' '}
                                <span className="font-medium">{pagination?.total || 0}</span> users
                            </div>
                            <div className="flex items-center gap-2">
                                <span>Rows per page:</span>
                                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                                    <SelectTrigger className="w-[70px]">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">User</TableHead>
                                    <TableHead className="w-[100px]">Type</TableHead>
                                    <TableHead className="w-[100px]">Status</TableHead>
                                    <TableHead className="w-[150px]">Verification</TableHead>
                                    <TableHead className="w-[180px]">Joined</TableHead>
                                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <User className="h-12 w-12 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">No users found</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Try adjusting your search or filters
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user: UserType) => (
                                        <TableRow key={user.id} className="group hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                            <span className="font-semibold text-primary">
                                                                {user.username.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium">{user.username}</div>
                                                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 ${getTypeColor(user.type)}`}
                                                >
                                                    {getTypeIcon(user.type)}
                                                    {getTypeLabel(user.type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={user.is_blocking ? "destructive" : "default"}
                                                    className="gap-1.5 px-2.5 py-1"
                                                >
                                                    {user.is_blocking ? (
                                                        <>
                                                            <Ban className="h-3 w-3" />
                                                            Blocked
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-3 w-3" />
                                                            Active
                                                        </>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {user.email_verified_at ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">Verified</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatDate(user.email_verified_at)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-gray-300" />
                                                            <span className="text-sm text-muted-foreground">Pending</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{formatCreatedDate(user.created_at)}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {getRelativeTime(user.created_at)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />

                                                        {/* 🔥 Assign Role */}
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                Assign Role
                                                            </DropdownMenuSubTrigger>

                                                            <DropdownMenuSubContent>
                                                                {["admin", "payment_processor"].map((role) => (
                                                                    <DropdownMenuItem
                                                                        key={role}
                                                                        onClick={() =>
                                                                            assignRoleMutate({ userId: user.id, role })
                                                                        }
                                                                        disabled={isPending}
                                                                    >
                                                                        {role}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>

                                                        <DropdownMenuSeparator />

                                                        {!user.is_blocking ? (
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleBlock(user)}
                                                            >
                                                                <Ban className="h-4 w-4 mr-2" />
                                                                Block User
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                className="text-green-600 focus:text-green-600"
                                                                onClick={() => handleUnblock(user.id)}
                                                            >
                                                                <UserCheck className="h-4 w-4 mr-2" />
                                                                Unblock User
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total > 0 && (
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                Showing{' '}
                                <span className="font-medium">{pagination.from}</span> to{' '}
                                <span className="font-medium">{pagination.to}</span> of{' '}
                                <span className="font-medium">{pagination.total}</span> users
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium">Page {currentPage} of {pagination.last_page}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.min(pagination.last_page, currentPage + 1))}
                                    disabled={currentPage === pagination.last_page}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(pagination.last_page)}
                                    disabled={currentPage === pagination.last_page}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Block User Dialog */}
            <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Ban className="h-5 w-5 text-destructive" />
                            Block User
                        </DialogTitle>
                        <DialogDescription>
                            This action will prevent the user from accessing the platform.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                    <span className="font-semibold text-destructive text-lg">
                                        {selectedUser.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-medium">{selectedUser.username}</h4>
                                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label>Reason for blocking (optional)</Label>
                                <Input placeholder="Enter reason..." />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBlockDialogOpen(false)}
                            disabled={blockMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmBlock}
                            disabled={blockMutation.isPending}
                        >
                            {blockMutation.isPending ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Blocking...
                                </>
                            ) : (
                                'Confirm Block'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}