import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Crown, Trophy, Upload, Plus, Edit, Trash2 } from "lucide-react";

interface PlayerRanking {
  id: string;
  userId: string;
  playerName: string;
  stars: number;
  rank: number;
  imageUrl: string | null;
  crownType: string | null;
}

const rankingSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  playerName: z.string().min(1, "Player name is required"),
  stars: z.coerce.number().min(0, "Stars must be 0 or more"),
  rank: z.coerce.number().min(1, "Rank must be at least 1").max(10, "Maximum rank is 10"),
  imageUrl: z.string().optional().nullable(),
  crownType: z.string().optional().nullable(),
});

type RankingFormData = z.infer<typeof rankingSchema>;

const crownTypes = [
  { value: "gold", label: "Gold Crown", color: "text-yellow-400" },
  { value: "silver", label: "Silver Crown", color: "text-gray-400" },
  { value: "bronze", label: "Bronze Crown", color: "text-orange-600" },
  { value: "diamond", label: "Diamond Crown", color: "text-cyan-400" },
  { value: "ruby", label: "Ruby Crown", color: "text-red-500" },
];

export default function AdminRankings() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRanking, setEditingRanking] = useState<PlayerRanking | null>(null);

  const { data: rankings, isLoading } = useQuery<PlayerRanking[]>({
    queryKey: ["/api/rankings"],
  });

  const form = useForm<RankingFormData>({
    resolver: zodResolver(rankingSchema),
    defaultValues: {
      userId: "",
      playerName: "",
      stars: 0,
      rank: 1,
      imageUrl: null,
      crownType: "none",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RankingFormData) => {
      return apiRequest("POST", "/api/admin/rankings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rankings"] });
      toast({
        title: "Ranking Created",
        description: "Player ranking has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ranking.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: RankingFormData }) => {
      return apiRequest("PATCH", `/api/admin/rankings/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rankings"] });
      toast({
        title: "Ranking Updated",
        description: "Player ranking has been updated successfully.",
      });
      setIsDialogOpen(false);
      setEditingRanking(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ranking.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/rankings/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rankings"] });
      toast({
        title: "Ranking Deleted",
        description: "Player ranking has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete ranking.",
        variant: "destructive",
      });
    },
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-zinc-900 border-yellow-500/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bebas text-yellow-400 mb-4">ACCESS DENIED</h2>
            <p className="text-zinc-400">Administrator access required</p>
            <Button
              onClick={() => navigate("/")}
              className="mt-4"
              data-testid="button-home"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = (ranking: PlayerRanking) => {
    setEditingRanking(ranking);
    form.reset({
      userId: ranking.userId,
      playerName: ranking.playerName,
      stars: ranking.stars,
      rank: ranking.rank,
      imageUrl: ranking.imageUrl,
      crownType: ranking.crownType || "none",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRanking(null);
    form.reset();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue("imageUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: RankingFormData) => {
    const submitData = {
      ...data,
      crownType: data.crownType === "none" ? null : data.crownType,
    };
    
    if (editingRanking) {
      updateMutation.mutate({ userId: editingRanking.userId, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400 border-yellow-500/50";
    if (rank === 2) return "text-gray-400 border-gray-500/50";
    if (rank === 3) return "text-orange-400 border-orange-500/50";
    return "text-zinc-400 border-zinc-700";
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bebas text-yellow-400 mb-2">
              RANKINGS MANAGEMENT
            </h1>
            <p className="text-zinc-400">Manage player leaderboard (Maximum 10 players)</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-yellow-400 text-black hover:bg-yellow-500"
                disabled={(rankings?.length || 0) >= 10 && !editingRanking}
                data-testid="button-create-ranking"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-yellow-500/20 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bebas text-yellow-400">
                  {editingRanking ? "EDIT PLAYER RANKING" : "ADD PLAYER RANKING"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="unique-user-id"
                            className="bg-black border-zinc-700"
                            disabled={!!editingRanking}
                            data-testid="input-userId"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="playerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter player name"
                            className="bg-black border-zinc-700"
                            data-testid="input-playerName"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stars"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stars (Achievement Points)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="0"
                            className="bg-black border-zinc-700"
                            data-testid="input-stars"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rank Position (1-10)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            max="10"
                            placeholder="1"
                            className="bg-black border-zinc-700"
                            data-testid="input-rank"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player Image (Optional)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="bg-black border-zinc-700"
                              data-testid="input-image"
                            />
                            {field.value && (
                              <img
                                src={field.value}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border border-yellow-500/20"
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="crownType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crown Type (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-black border-zinc-700" data-testid="select-crownType">
                              <SelectValue placeholder="Select crown type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-yellow-500/20">
                            <SelectItem value="none">No Crown</SelectItem>
                            {crownTypes.map((crown) => (
                              <SelectItem key={crown.value} value={crown.value}>
                                <span className={crown.color}>{crown.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingRanking
                        ? "Update"
                        : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-zinc-900 border-yellow-500/20">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4 animate-pulse" />
                <p className="text-zinc-400">Loading rankings...</p>
              </div>
            ) : rankings && rankings.length > 0 ? (
              <div className="grid gap-4">
                {rankings.map((ranking) => (
                  <Card
                    key={ranking.id}
                    className={`bg-black border ${getRankColor(ranking.rank)} hover-elevate`}
                    data-testid={`card-ranking-${ranking.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`text-6xl font-bebas ${getRankColor(ranking.rank)}`}>
                          #{ranking.rank}
                        </div>
                        {ranking.imageUrl ? (
                          <img
                            src={ranking.imageUrl}
                            alt={ranking.playerName}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-yellow-500/20"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-zinc-800 rounded-lg flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-zinc-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bebas text-white flex items-center gap-2">
                            {ranking.playerName}
                            {ranking.crownType && (
                              <Crown
                                className={`w-6 h-6 ${
                                  crownTypes.find((c) => c.value === ranking.crownType)?.color
                                }`}
                              />
                            )}
                          </h3>
                          <p className="text-zinc-400">
                            User ID: <span className="text-yellow-400 font-mono text-sm">{ranking.userId}</span>
                          </p>
                          <p className="text-zinc-400 mt-1">
                            <Trophy className="w-4 h-4 inline mr-1 text-yellow-400" />
                            {ranking.stars.toLocaleString()} stars
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                            onClick={() => handleEdit(ranking)}
                            data-testid={`button-edit-${ranking.id}`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to delete ${ranking.playerName}?`
                                )
                              ) {
                                deleteMutation.mutate(ranking.userId);
                              }
                            }}
                            data-testid={`button-delete-${ranking.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">No player rankings yet</p>
                <p className="text-zinc-500 text-sm">
                  Click "Add Player" to create your first ranking
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
