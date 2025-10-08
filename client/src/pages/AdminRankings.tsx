import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
import { Crown, Trophy, Upload, Users } from "lucide-react";

interface PlayerRanking {
  id: string;
  userId: string;
  playerName: string;
  stars: number;
  rank: number;
  imageUrl: string | null;
  crownType: string | null;
}

const rankingImageSchema = z.object({
  imageUrl: z.string().min(1, "Image is required"),
  crownType: z.string().min(1, "Crown type is required"),
});

type RankingImageFormData = z.infer<typeof rankingImageSchema>;

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

  const form = useForm<RankingImageFormData>({
    resolver: zodResolver(rankingImageSchema),
    defaultValues: {
      imageUrl: "",
      crownType: "gold",
    },
  });

  const updateRankingMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: RankingImageFormData }) => {
      return apiRequest("PATCH", `/api/admin/rankings/${userId}/image`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rankings"] });
      toast({
        title: "Ranking Updated",
        description: "Player image and crown have been updated successfully.",
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
      imageUrl: ranking.imageUrl || "",
      crownType: ranking.crownType || "gold",
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

  const onSubmit = (data: RankingImageFormData) => {
    if (editingRanking) {
      updateRankingMutation.mutate({ userId: editingRanking.userId, data });
    }
  };

  const topRankings = rankings?.slice(0, 3) || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-8 h-8 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-7 h-7 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400 border-yellow-500/50";
    if (rank === 2) return "text-gray-400 border-gray-500/50";
    if (rank === 3) return "text-orange-400 border-orange-500/50";
    return "text-zinc-400 border-zinc-700";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-5xl font-bebas text-yellow-400 mb-2">
            RANKINGS MANAGEMENT
          </h1>
          <p className="text-zinc-400">Manage top player images and crowns</p>
        </div>

        <Card className="bg-zinc-900 border-yellow-500/20">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
              </div>
            ) : topRankings.length > 0 ? (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bebas text-yellow-400 mb-4">
                    TOP 3 PLAYERS
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    Click "Edit" to upload images and select crown types for top 3 players
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topRankings.map((ranking) => (
                    <Card
                      key={ranking.id}
                      className={`bg-black border-2 ${getRankColor(ranking.rank)}`}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getRankIcon(ranking.rank)}
                              <span className={`text-3xl font-bebas ${getRankColor(ranking.rank)}`}>
                                #{ranking.rank}
                              </span>
                            </div>
                            {ranking.crownType && (
                              <Crown 
                                className={`w-6 h-6 ${
                                  crownTypes.find(c => c.value === ranking.crownType)?.color || 'text-yellow-400'
                                }`} 
                              />
                            )}
                          </div>

                          {ranking.imageUrl ? (
                            <div className="relative">
                              <img
                                src={ranking.imageUrl}
                                alt={ranking.playerName}
                                className="w-full h-48 object-cover rounded-lg border border-zinc-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
                              <Users className="w-16 h-16 text-zinc-600" />
                            </div>
                          )}

                          <div>
                            <h3 className="text-xl font-bebas text-white">
                              {ranking.playerName}
                            </h3>
                            <p className="text-sm text-zinc-400">
                              ⭐ {ranking.stars.toLocaleString()} stars
                            </p>
                            {ranking.crownType && (
                              <p className="text-sm text-zinc-400 mt-1">
                                Crown: {crownTypes.find(c => c.value === ranking.crownType)?.label}
                              </p>
                            )}
                          </div>

                          <Button
                            className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                            onClick={() => handleEdit(ranking)}
                            data-testid={`button-edit-rank-${ranking.rank}`}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Edit Image & Crown
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400">No rankings found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-yellow-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bebas text-yellow-400">
              EDIT RANK #{editingRanking?.rank} - {editingRanking?.playerName}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="bg-black border-zinc-700"
                            data-testid="input-ranking-image"
                          />
                          <Upload className="w-5 h-5 text-zinc-400" />
                        </div>
                        {field.value && (
                          <img
                            src={field.value}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded border border-zinc-700"
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
                    <FormLabel>Crown Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-black border-zinc-700" data-testid="select-crown">
                          <SelectValue placeholder="Select a crown type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        {crownTypes.map((crown) => (
                          <SelectItem 
                            key={crown.value} 
                            value={crown.value}
                            className="text-white hover:bg-zinc-800"
                          >
                            <div className="flex items-center gap-2">
                              <Crown className={`w-4 h-4 ${crown.color}`} />
                              <span>{crown.label}</span>
                            </div>
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
                  disabled={updateRankingMutation.isPending}
                  data-testid="button-submit-ranking"
                >
                  {updateRankingMutation.isPending ? "Saving..." : "Update"}
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

      <Footer />
    </div>
  );
}
