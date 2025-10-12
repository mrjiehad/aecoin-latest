import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Image as ImageIcon, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface GalleryImage {
  id: string;
  imageUrl: string;
  category: string;
  title: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  "Vehicles",
  "Properties",
  "Weapons",
  "Heists",
  "Business",
  "Racing",
  "Territory",
  "Lifestyle",
];

const gallerySchema = z.object({
  imageUrl: z.string().min(1, "Image is required"),
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  displayOrder: z.coerce.number().min(0, "Display order must be 0 or more"),
  isActive: z.boolean().default(true),
});

type GalleryFormData = z.infer<typeof gallerySchema>;

export default function AdminGallery() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  const { data: images, isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/admin/gallery"],
  });

  const form = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      imageUrl: "",
      category: "Vehicles",
      title: "",
      description: "",
      displayOrder: 0,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: GalleryFormData) => {
      return apiRequest("POST", "/api/admin/gallery", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Gallery Image Created",
        description: "Image has been added to gallery successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create gallery image.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GalleryFormData }) => {
      return apiRequest("PATCH", `/api/admin/gallery/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Gallery Image Updated",
        description: "Image has been updated successfully.",
      });
      setIsDialogOpen(false);
      setEditingImage(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update gallery image.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/gallery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Gallery Image Deleted",
        description: "Image has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete gallery image.",
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
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    form.reset({
      imageUrl: image.imageUrl,
      category: image.category,
      title: image.title,
      description: image.description || "",
      displayOrder: image.displayOrder,
      isActive: image.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingImage(null);
    form.reset();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
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

  const onSubmit = (data: GalleryFormData) => {
    if (editingImage) {
      updateMutation.mutate({ id: editingImage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bebas text-yellow-400 mb-2">
              GALLERY MANAGEMENT
            </h1>
            <p className="text-zinc-400">Manage homepage gallery images and categories</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-yellow-400 text-black hover:bg-yellow-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-yellow-500/20 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bebas text-yellow-400">
                  {editingImage ? "EDIT GALLERY IMAGE" : "ADD GALLERY IMAGE"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="bg-black border-zinc-700"
                            />
                            {field.value && (
                              <img
                                src={field.value}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg border border-yellow-500/20"
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>Max 5MB. Recommended: 800x600px</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-black border-zinc-700">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-yellow-500/20">
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Luxury Supercars"
                            className="bg-black border-zinc-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Brief description..."
                            className="bg-black border-zinc-700"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            placeholder="0"
                            className="bg-black border-zinc-700"
                          />
                        </FormControl>
                        <FormDescription>Lower numbers appear first</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-5 h-5 rounded border-zinc-700 bg-black"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Active (Show on homepage)</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingImage
                        ? "Update"
                        : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
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
                <ImageIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4 animate-pulse" />
                <p className="text-zinc-400">Loading gallery...</p>
              </div>
            ) : images && images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <Card
                    key={image.id}
                    className="bg-black border border-yellow-500/20 hover-elevate overflow-hidden"
                  >
                    <div className="relative aspect-[4/3]">
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                      {!image.isActive && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <EyeOff className="w-12 h-12 text-zinc-500" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded">
                          {image.category}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bebas text-white">{image.title}</h3>
                          {image.description && (
                            <p className="text-sm text-zinc-400 line-clamp-2">{image.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-zinc-500">Order: {image.displayOrder}</span>
                            {image.isActive ? (
                              <Eye className="w-4 h-4 text-green-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-zinc-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                          onClick={() => handleEdit(image)}
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
                                `Are you sure you want to delete "${image.title}"?`
                              )
                            ) {
                              deleteMutation.mutate(image.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">No gallery images yet</p>
                <p className="text-zinc-500 text-sm">
                  Click "Add Image" to create your first gallery image
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
