import {
  DeletePaymnetProcessor,
  PaymnetProcessorslist,
  updatePaymnetProcessor,
} from "@/api/admin";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

type Processor = {
  id: string;
  username: string;
  email: string;
  created_at: string;
};

export default function PaymentProcessor() {
  const queryClient = useQueryClient();

  const [selectedProcessor, setSelectedProcessor] =
    useState<Processor | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryFn: PaymnetProcessorslist,
    queryKey: ["PaymnetProcessorslist"],
  });

  const processors = data?.data?.data || [];

  // DELETE MUTATION
  const deleteMutation = useMutation({
    mutationFn: DeletePaymnetProcessor,
    onSuccess: () => {
      toast.success("Payment processor deleted successfully");

      queryClient.invalidateQueries({
        queryKey: ["PaymnetProcessorslist"],
      });
    },
    onError: () => {
      toast.error("Failed to delete payment processor");
    },
  });

  // UPDATE MUTATION
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        username: string;
        email: string;
      };
    }) => updatePaymnetProcessor(id, payload),

    onSuccess: () => {
      toast.success("Payment processor updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["PaymnetProcessorslist"],
      });

      setSelectedProcessor(null);
    },

    onError: () => {
      toast.error("Failed to update payment processor");
    },
  });

  const handleEdit = (processor: Processor) => {
    setSelectedProcessor(processor);
    setUsername(processor.username);
    setEmail(processor.email);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="animate-spin size-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center mt-10">
        Failed to load payment processors
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-2xl text-extrabold mb-2">Paymnet Processors</div>
      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {processors.length > 0 ? (
              processors.map((processor: Processor) => (
                <TableRow key={processor.id}>
                  <TableCell>{processor.username}</TableCell>

                  <TableCell>{processor.email}</TableCell>

                  <TableCell>
                    {new Date(processor.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="flex justify-end gap-2">
                    {/* UPDATE */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(processor)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Update Payment Processor
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Username
                            </label>

                            <Input
                              value={username}
                              onChange={(e) =>
                                setUsername(e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Email
                            </label>

                            <Input
                              value={email}
                              onChange={(e) =>
                                setEmail(e.target.value)
                              }
                            />
                          </div>

                          <Button
                            className="w-full"
                            disabled={updateMutation.isPending}
                            onClick={() => {
                              if (!selectedProcessor) return;

                              updateMutation.mutate({
                                id: selectedProcessor.id,
                                payload: {
                                  username,
                                  email,
                                },
                              });
                            }}
                          >
                            {updateMutation.isPending ? (
                              <Loader2 className="animate-spin size-4" />
                            ) : (
                              "Update"
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* DELETE */}
                    <Button
                      size="icon"
                      variant="destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() =>
                        deleteMutation.mutate(processor.id)
                      }
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="animate-spin size-4" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10"
                >
                  No payment processors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}