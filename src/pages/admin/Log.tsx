import { fetchRewards, fetchVariables, updateVariable, updateReward } from "@/api/variables";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Log() {
    const queryClient = useQueryClient();

    // ================= VARIABLES =================
    const { data: variables, isLoading } = useQuery({
        queryFn: fetchVariables,
        queryKey: ["variables"],
    });

    const { mutate: updateVar, isPending: varUpdating } = useMutation({
        mutationFn: updateVariable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["variables"] });
            toast.success("Variable updated ✅");
            setEditingId(null);
        },
        onError: () => toast.error("Update failed ❌"),
    });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ point: "", value: "", type: "" });

    const startEdit = (item: any) => {
        setEditingId(item.id);
        setForm(item);
    };

    // ================= REWARDS =================
    const { data: rewards } = useQuery({
        queryFn: fetchRewards,
        queryKey: ["rewards"],
    });

    const { mutate: updateRewardMutate, isPending: rewardUpdating } = useMutation({
        mutationFn: updateReward,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rewards"] });
            toast.success("Reward updated ✅");
            setEditingRewardId(null);
        },
        onError: () => toast.error("Update failed ❌"),
    });

    const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
    const [rewardForm, setRewardForm] = useState({
        name: "",
        description: "",
        probability: 0,
        type: "",
        value: 0,
        is_active: true,
    });

    const startRewardEdit = (item: any) => {
        setEditingRewardId(item.id);
        setRewardForm(item);
    };

    if (isLoading) return <p className="p-6">Loading...</p>;

    return (
        <div className="p-6 space-y-8">

            {/* VARIABLES */}
            <Card>
                <CardHeader>
                    <CardTitle>System Variables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {variables?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between border rounded-xl p-4">
                            {editingId === item.id ? (
                                <div className="flex gap-2">
                                    <Input value={form.point} onChange={(e) => setForm({ ...form, point: e.target.value })} />
                                    <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                                    <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
                                    <Button onClick={() => updateVar({ id: item.id, data: { ...form, value: Number(form.value) } })}>
                                        {varUpdating ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <p className="font-semibold">{item.point}</p>
                                        <p className="text-sm text-muted-foreground">Value: {item.value}</p>
                                    </div>
                                    <Button variant="outline" onClick={() => startEdit(item)}>Edit</Button>
                                </>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* REWARDS */}
            <Card>
                <CardHeader>
                    <CardTitle>Rewards System</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {rewards?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between border rounded-xl p-4">

                            {editingRewardId === item.id ? (
                                <div className="flex flex-wrap gap-2">
                                    <Input value={rewardForm.name} onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })} />
                                    <Input value={rewardForm.description} onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })} />
                                    <Input type="number" value={rewardForm.probability} onChange={(e) => setRewardForm({ ...rewardForm, probability: Number(e.target.value) })} />

                                    <select
                                        value={rewardForm.type}
                                        onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value })}
                                        className="border rounded px-2"
                                    >
                                        <option value="money">Money</option>
                                        <option value="point">Point</option>
                                        <option value="trial">Trial</option>
                                        <option value="lose">Lose</option>
                                    </select>

                                    <Input type="number" value={rewardForm.value} onChange={(e) => setRewardForm({ ...rewardForm, value: Number(e.target.value) })} />

                                    <Button onClick={() => updateRewardMutate({ id: item.id, data: rewardForm })}>
                                        {rewardUpdating ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge>{item.type}</Badge>
                                            <Badge variant="secondary">{item.value}</Badge>
                                            <Badge variant="outline">{item.probability}%</Badge>
                                        </div>
                                    </div>

                                    <Button variant="outline" onClick={() => startRewardEdit(item)}>
                                        Edit
                                    </Button>
                                </>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}