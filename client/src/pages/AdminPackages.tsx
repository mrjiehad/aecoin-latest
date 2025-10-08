import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Edit, Trash2, Package as PackageIcon, Upload } from "lucide-react";

interface Package {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string | null;
  aecoinAmount: number;
  codesPerPackage: number;
  featured: boolean;
  imageUrl: string | null;
}

const packageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional().nullable(),
  aecoinAmount: z.coerce.number().min(1, "AECOIN amount must be at least 1"),
  codesPerPackage: z.coerce.number().min(1, "At least 1 code required").default(1),
  featured: z.boolean().default(false),
  imageUrl: z.string().optional().nullable(),
});

type PackageFormData = z.infer<typeof packageSchema>;

export default function AdminPackages() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  const { data: packages, isLoading } = useQuery<Package[]>({
    queryKey: ["/api/packages"],
  });

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: null,
      aecoinAmount: 0,
      codesPerPackage: 1,
      featured: false,
      imageUrl: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PackageFormData) => {
      return apiRequest("POST", "/api/admin/packages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({
        title: "Package Created",
        description: "The package has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create package.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PackageFormData }) => {
      return apiRequest("PATCH", `/api/admin/packages/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({
        title: "Package Updated",
        description: "The package has been updated successfully.",
      });
      setIsDialogOpen(false);
      setEditingPackage(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update package.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/packages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({
        title: "Package Deleted",
        description: "The package has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete package.",
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

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    form.reset({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      aecoinAmount: pkg.aecoinAmount,
      codesPerPackage: pkg.codesPerPackage,
      featured: pkg.featured,
      imageUrl: pkg.imageUrl,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPackage(null);
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

  const onSubmit = (data: PackageFormData) => {
    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, data });
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
              PACKAGE MANAGEMENT
            </h1>
            <p className="text-zinc-400">Create and manage AECOIN packages</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-yellow-400 text-black hover:bg-yellow-500"
                data-testid="button-create-package"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Package
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-yellow-500/20 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bebas text-yellow-400">
                  {editingPackage ? "EDIT PACKAGE" : "CREATE PACKAGE"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-black border-zinc-700"
                            placeholder="e.g., Starter Pack"
                            data-testid="input-name"
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="bg-black border-zinc-700"
                            placeholder="Package description..."
                            rows={3}
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="aecoinAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AECOIN Amount</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              className="bg-black border-zinc-700"
                              placeholder="e.g., 50000"
                              data-testid="input-aecoin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="codesPerPackage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Codes Per Package</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              className="bg-black border-zinc-700"
                              placeholder="1"
                              data-testid="input-codes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Price (RM)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              className="bg-black border-zinc-700"
                              placeholder="e.g., 15.00"
                              data-testid="input-price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price (RM) - Optional</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              type="number"
                              step="0.01"
                              className="bg-black border-zinc-700"
                              placeholder="e.g., 20.00"
                              data-testid="input-original-price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Image (Optional)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="bg-black border-zinc-700"
                                data-testid="input-image"
                              />
                              <Upload className="w-5 h-5 text-zinc-400" />
                            </div>
                            {field.value && (
                              <img
                                src={field.value}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded border border-zinc-700"
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
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between border border-zinc-800 rounded-lg p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Featured Package</FormLabel>
                          <div className="text-sm text-zinc-400">
                            Highlight this package on the homepage
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-featured"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-submit-package"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingPackage
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
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
              </div>
            ) : packages && packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className="bg-black border-zinc-800 hover-elevate"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {pkg.imageUrl && (
                          <img
                            src={pkg.imageUrl}
                            alt={pkg.name}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bebas text-yellow-400">
                              {pkg.name}
                            </h3>
                            {pkg.featured && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 mt-1">
                                FEATURED
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-3xl font-bold text-white">
                            {pkg.aecoinAmount.toLocaleString()}
                            <span className="text-sm text-yellow-400 ml-1">AECOIN</span>
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-yellow-400">
                              RM {pkg.price}
                            </p>
                            {pkg.originalPrice && (
                              <p className="text-lg text-zinc-500 line-through">
                                RM {pkg.originalPrice}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-zinc-400">{pkg.description}</p>
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                            onClick={() => handleEdit(pkg)}
                            data-testid={`button-edit-${pkg.id}`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this package?"
                                )
                              ) {
                                deleteMutation.mutate(pkg.id);
                              }
                            }}
                            data-testid={`button-delete-${pkg.id}`}
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
                <PackageIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400">No packages found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
