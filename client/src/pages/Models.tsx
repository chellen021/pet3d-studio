import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

import {
  Box,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  ShoppingCart,
  Eye,
} from "lucide-react";

export default function Models() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: models, isLoading } = trpc.models.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/auth");
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="badge-success">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      case "processing":
        return (
          <span className="badge-warning">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
      case "pending":
        return (
          <span className="badge-info">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="badge-error">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My 3D Models</h1>
              <p className="text-muted-foreground">
                View and manage your generated 3D pet models.
              </p>
            </div>
            <Link href="/upload">
              <Button className="btn-apple">
                <Plus className="h-4 w-4 mr-2" />
                Create New Model
              </Button>
            </Link>
          </div>

          {models?.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Box className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No models yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload a pet photo to create your first 3D model.
                </p>
                <Link href="/upload">
                  <Button className="btn-apple">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Pet Photo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models?.map((model) => (
                <Card key={model.id} className="card-hover overflow-hidden">
                  <div className="aspect-square bg-muted relative">
                    {model.preview_url ? (
                      <img
                        src={model.preview_url}
                        alt={`Model ${model.id}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Box className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(model.status)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Model #{model.id}</h3>
                      <span className="text-sm text-muted-foreground">
                        {new Date(model.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/models/${model.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      {model.status === "completed" && (
                        <>
                          {model.glb_url && (
                            <a href={model.glb_url} download className="flex-1">
                              <Button variant="outline" className="w-full" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </a>
                          )}
                          <Link href={`/checkout/${model.id}`} className="flex-1">
                            <Button className="w-full gradient-bg text-white" size="sm">
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Print
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
