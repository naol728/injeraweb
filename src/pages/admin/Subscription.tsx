import React, { useState } from "react";
import {
  createSubscription,
  deleteSubscription,
  getSubscriptions,
  updateSubscription,
} from "@/api/subscription";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  CreditCard,
  Calendar,
  Video,
  Clock,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";

import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";

type Subscription = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  duration_days: number;
  video_upload_limit: number;
  max_video_duration_seconds?: number;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

type SubscriptionFormData = {
  name: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  duration_days: string;
  video_upload_limit: string;
  max_video_duration_seconds: string;
  is_active: boolean;
  sort_order: string;
};

const initialFormData: SubscriptionFormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  currency: "ETB",
  duration_days: "",
  video_upload_limit: "",
  max_video_duration_seconds: "",
  is_active: true,
  sort_order: "",
};



// Usage examples:
// formatCurrency(1234.56) → "1,234.56 Br"
// formatCurrency(1234.56, "USD") → "$1,234.56"
// formatCurrency(1234.56, "EUR", "de-DE") → "€1.234,56" (German format)

export default function Subscription() {
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<SubscriptionFormData>(initialFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  /* -------------------------------------------------------------------------- */
  /*                                   QUERY                                    */
  /* -------------------------------------------------------------------------- */

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: getSubscriptions,
    staleTime: 5 * 60 * 1000,
  });

  const subscriptions = data?.data?.data || [];

  /* -------------------------------------------------------------------------- */
  /*                               MUTATIONS                                    */
  /* -------------------------------------------------------------------------- */

  const createMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      toast.success("✨ Subscription created successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setOpenCreate(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create subscription");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateSubscription(id, data),
    onSuccess: () => {
      toast.success("✅ Subscription updated successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setOpenEdit(false);
      setSelectedSubscription(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update subscription");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      toast.success("🗑️ Subscription deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete subscription");
    },
  });

  /* -------------------------------------------------------------------------- */
  /*                                  HELPERS                                   */
  /* -------------------------------------------------------------------------- */

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setFormData({
      name: subscription.name || "",
      slug: subscription.slug || "",
      description: subscription.description || "",
      price: String(subscription.price || ""),
      currency: subscription.currency || "ETB",
      duration_days: String(subscription.duration_days || ""),
      video_upload_limit: String(subscription.video_upload_limit || ""),
      max_video_duration_seconds: String(subscription.max_video_duration_seconds || ""),
      is_active: subscription.is_active,
      sort_order: String(subscription.sort_order || ""),
    });
    setOpenEdit(true);
  };

  const buildPayload = () => ({
    name: formData.name.trim(),
    slug: formData.slug.trim().toLowerCase().replace(/\s+/g, "-"),
    description: formData.description.trim(),
    price: Number(formData.price),
    currency: formData.currency,
    duration_days: Number(formData.duration_days),
    video_upload_limit: Number(formData.video_upload_limit),
    max_video_duration_seconds: formData.max_video_duration_seconds
      ? Number(formData.max_video_duration_seconds)
      : undefined,
    is_active: formData.is_active,
    sort_order: formData.sort_order ? Number(formData.sort_order) : 0,
  });

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return false;
    }
    if (!formData.price || Number(formData.price) < 0) {
      toast.error("Valid price is required");
      return false;
    }
    if (!formData.duration_days || Number(formData.duration_days) <= 0) {
      toast.error("Duration days must be greater than 0");
      return false;
    }
    if (!formData.video_upload_limit || Number(formData.video_upload_limit) < 0) {
      toast.error("Valid upload limit is required");
      return false;
    }
    return true;
  };

  const handleSubmitCreate = () => {
    if (!validateForm()) return;
    createMutation.mutate(buildPayload());
  };

  const handleSubmitUpdate = () => {
    if (!validateForm() || !selectedSubscription) return;
    updateMutation.mutate({
      id: selectedSubscription.id,
      data: buildPayload(),
    });
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId);
    }
  };

  // Calculate statistics
  const activePlans = subscriptions.filter((s: Subscription) => s.is_active).length;
  const totalRevenue = subscriptions.reduce((sum: number, s: Subscription) => {
    const price = typeof s.price === 'string' ? parseFloat(s.price) : s.price;
    return sum + price;
  }, 0);

  const avgPrice = subscriptions.length > 0 ? totalRevenue / subscriptions.length : 0;


  /* -------------------------------------------------------------------------- */
  /*                                LOADING/ERROR STATES                        */
  /* -------------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center">
        <Loader2 className="text-primary size-12 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading subscriptions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="mx-auto size-16 text-destructive" />
          <h3 className="text-destructive text-lg font-semibold">
            Failed to Load Subscriptions
          </h3>
          <p className="text-muted-foreground">
            There was an error loading the subscription data.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="container mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
            Subscription Plans
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription tiers and pricing strategies
          </p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="shadow-sm transition-all duration-200 hover:shadow-md">
              <Plus className="mr-2 size-4" />
              New Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create Subscription Plan</DialogTitle>
              <DialogDescription>
                Set up a new pricing tier for your users
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <SubscriptionForm formData={formData} setFormData={setFormData} />
            <div className="flex gap-3">
              <Button
                className="flex-1"
                disabled={createMutation.isPending}
                onClick={handleSubmitCreate}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Plan"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpenCreate(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">Total Plans</p>
                <p className="text-foreground text-2xl font-bold">{subscriptions.length}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-2">
                <CreditCard className="text-primary size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">Active Plans</p>
                <p className="text-foreground text-2xl font-bold">{activePlans}</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-2">
                <CheckCircle className="text-green-500 size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">Average Price</p>
                <p className="text-foreground text-2xl font-bold">
                  {subscriptions.length > 0 ? formatCurrency(avgPrice) : "N/A"}
                </p>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-2">
                <DollarSign className="text-purple-500 size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">Total Value</p>
                <p className="text-foreground text-2xl font-bold">
                  {subscriptions.length > 0 ? formatCurrency(totalRevenue) : "N/A"}
                </p>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-2">
                <TrendingUp className="text-amber-500 size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Plan Details</TableHead>
                <TableHead className="font-semibold">Pricing</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold">Limits</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length > 0 ? (
                subscriptions.map((subscription: Subscription) => (
                  <TableRow
                    key={subscription.id}
                    className="transition-colors duration-200 hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {subscription.name}
                          </p>
                          {subscription.sort_order !== undefined && subscription.sort_order !== 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <ArrowUpDown className="mr-1 size-3" />
                              Order {subscription.sort_order}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground font-mono text-xs">
                          {subscription.slug}
                        </p>
                        {subscription.description && (
                          <p className="text-muted-foreground line-clamp-2 text-xs">
                            {subscription.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-bold text-lg">
                          {formatCurrency(subscription.price, subscription.currency)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          per {subscription.duration_days} days
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="text-muted-foreground size-4" />
                        <span className="text-sm">{subscription.duration_days} days</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Video className="text-muted-foreground size-3.5" />
                          <span className="text-sm">{subscription.video_upload_limit} videos</span>
                        </div>
                        {subscription.max_video_duration_seconds && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="text-muted-foreground size-3.5" />
                            <span className="text-muted-foreground text-xs">
                              Max {Math.floor(subscription.max_video_duration_seconds / 60)} min
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={subscription.is_active ? "default" : "secondary"}
                        className="gap-1.5"
                      >
                        {subscription.is_active ? (
                          <CheckCircle className="size-3" />
                        ) : (
                          <XCircle className="size-3" />
                        )}
                        {subscription.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(subscription)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(subscription.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <CreditCard className="text-muted-foreground/30 size-12" />
                      <p className="text-muted-foreground">No subscription plans found</p>
                      <Button variant="outline" onClick={() => setOpenCreate(true)}>
                        <Plus className="mr-2 size-4" />
                        Create your first plan
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Modify the details of your subscription plan
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <SubscriptionForm formData={formData} setFormData={setFormData} />
          <div className="flex gap-3">
            <Button
              className="flex-1"
              disabled={updateMutation.isPending}
              onClick={handleSubmitUpdate}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpenEdit(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              className="flex-1"
              disabled={deleteMutation.isPending}
              onClick={confirmDelete}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Forever"
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteConfirmId(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              FORM COMPONENT                                */
/* -------------------------------------------------------------------------- */

function SubscriptionForm({
  formData,
  setFormData,
}: {
  formData: SubscriptionFormData;
  setFormData: React.Dispatch<React.SetStateAction<SubscriptionFormData>>;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2 space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold">
          Plan Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Pro Plan, Enterprise Tier"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="transition-shadow duration-200 focus:shadow-md"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug" className="text-sm font-semibold">
          Slug <span className="text-destructive">*</span>
        </Label>
        <Input
          id="slug"
          placeholder="pro-plan"
          value={formData.slug}
          onChange={(e) =>
            setFormData({
              ...formData,
              slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
            })
          }
          className="font-mono transition-shadow duration-200 focus:shadow-md"
        />
        <p className="text-muted-foreground text-xs">
          Unique identifier (auto-formatted)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order" className="text-sm font-semibold">
          Sort Order
        </Label>
        <Input
          id="sort_order"
          type="number"
          placeholder="0"
          value={formData.sort_order}
          onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
          className="transition-shadow duration-200 focus:shadow-md"
        />
      </div>

      <div className="sm:col-span-2 space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what this plan includes..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="resize-none transition-shadow duration-200 focus:shadow-md"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price" className="text-sm font-semibold">
          Price <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <DollarSign className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="pl-9 transition-shadow duration-200 focus:shadow-md"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency" className="text-sm font-semibold">
          Currency
        </Label>
        <Select
          value={formData.currency}
          onValueChange={(value) => setFormData({ ...formData, currency: value })}
        >
          <SelectTrigger className="transition-shadow duration-200 focus:shadow-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ETB">🇪🇹 ETB - Ethiopian Birr</SelectItem>
            <SelectItem value="USD">💵 USD - US Dollar</SelectItem>
            <SelectItem value="EUR">💶 EUR - Euro</SelectItem>
            <SelectItem value="GBP">💷 GBP - British Pound</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration_days" className="text-sm font-semibold">
          Duration (Days) <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Calendar className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="duration_days"
            type="number"
            placeholder="30"
            value={formData.duration_days}
            onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
            className="pl-9 transition-shadow duration-200 focus:shadow-md"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="video_upload_limit" className="text-sm font-semibold">
          Video Upload Limit <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Video className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="video_upload_limit"
            type="number"
            placeholder="100"
            value={formData.video_upload_limit}
            onChange={(e) => setFormData({ ...formData, video_upload_limit: e.target.value })}
            className="pl-9 transition-shadow duration-200 focus:shadow-md"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_video_duration_seconds" className="text-sm font-semibold">
          Max Video Duration (seconds)
        </Label>
        <div className="relative">
          <Clock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="max_video_duration_seconds"
            type="number"
            placeholder="Optional"
            value={formData.max_video_duration_seconds}
            onChange={(e) =>
              setFormData({ ...formData, max_video_duration_seconds: e.target.value })
            }
            className="pl-9 transition-shadow duration-200 focus:shadow-md"
          />
        </div>
      </div>

      <div className="sm:col-span-2 space-y-2">
        <Label className="text-sm font-semibold">Status</Label>
        <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <p className="font-medium">Active Status</p>
            <p className="text-muted-foreground text-xs">
              Enable or disable this subscription plan
            </p>
          </div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
        </div>
      </div>
    </div>
  );
}
