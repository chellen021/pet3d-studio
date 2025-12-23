import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";

import { toast } from "sonner";
import {
  Box,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  ShoppingCart,
  Trash2,
  RefreshCw,
} from "lucide-react";
import ModelViewer from "@/components/ModelViewer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isPolling, setIsPolling] = useState(false);

  const { data: model, isLoading, refetch } = trpc.models.get.useQuery(
    { id: parseInt(id!) },
    { enabled: isAuthenticated && !!id }
  );

  const { refetch: checkStatus } = trpc.models.checkStatus.useQuery(
    { id: parseInt(id!) },
    { enabled: false }
  );
  const deleteMutation = trpc.models.delete.useMutation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/auth");
    }
  }, [authLoading, isAuthenticated]);

  // Auto-poll for processing models
  useEffect(() => {
    if (model?.status === "processing" || model?.status === "pending") {
      const interval = setInterval(async () => {
        setIsPolling(true);
        try {
          await checkStatus();
          await refetch();
        } catch (error) {
          console.error("Status check failed:", error);
        }
        setIsPolling(false);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [model?.status, id]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: parseInt(id!) });
      toast.success("Model deleted successfully");
      setLocation("/models");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete model");
    }
  };

  const handleManualRefresh = async () => {
    setIsPolling(true);
    try {
      await checkStatus();
      await refetch();
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to refresh status");
    }
    setIsPolling(false);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !model) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="badge-success text-base px-4 py-2">
            <CheckCircle className="h-4 w-4" />
            Completed
          </span>
        );
      case "processing":
        return (
          <span className="badge-warning text-base px-4 py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing
          </span>
        );
      case "pending":
        return (
          <span className="badge-info text-base px-4 py-2">
            <Clock className="h-4 w-4" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="badge-error text-base px-4 py-2">
            <AlertCircle className="h-4 w-4" />
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
        <div className="container max-w-5xl">
          {/* Back button */}
          <Link href="/models">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Models
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 3D Model Viewer */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-muted relative">
                  {model.status === "completed" && model.glb_url ? (
                    <ModelViewer
                      src={model.glb_url}
                      alt="3D Pet Model"
                      autoRotate
                      cameraControls
                      shadowIntensity="1"
                    />
                  ) : model.preview_url ? (
                    <img
                      src={model.preview_url}
                      alt={`Model ${model.id}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      {model.status === "processing" || model.status === "pending" ? (
                        <>
                          <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                          <p className="text-muted-foreground">Generating 3D model...</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            This may take 2-5 minutes
                          </p>
                        </>
                      ) : (
                        <Box className="h-16 w-16 text-muted-foreground/50" />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Model Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold">Model #{model.id}</h1>
                  {getStatusBadge(model.status)}
                </div>
                <p className="text-muted-foreground">
                  Created on {new Date(model.created_at).toLocaleDateString()} at{" "}
                  {new Date(model.created_at).toLocaleTimeString()}
                </p>
              </div>

              {/* Status Info */}
              {(model.status === "processing" || model.status === "pending") && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      <div>
                        <p className="font-medium text-primary">Model is being generated</p>
                        <p className="text-sm text-muted-foreground">
                          Please wait while our AI creates your 3D model. This typically takes 2-5 minutes.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={handleManualRefresh}
                      disabled={isPolling}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isPolling ? "animate-spin" : ""}`} />
                      Refresh Status
                    </Button>
                  </CardContent>
                </Card>
              )}

              {model.status === "failed" && (
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">Generation Failed</p>
                        <p className="text-sm text-muted-foreground">
                          {model.error_message || "An error occurred during model generation. Please try again with a different photo."}
                        </p>
                      </div>
                    </div>
                    <Link href="/upload">
                      <Button variant="outline" size="sm" className="mt-3">
                        Try Again
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              {model.status === "completed" && (
                <div className="space-y-3">
                  <Link href={`/checkout/${model.id}`}>
                    <Button className="w-full btn-apple text-lg py-6">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Order 3D Print
                    </Button>
                  </Link>
                  {model.glb_url && (
                    <a href={model.glb_url} download className="block">
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download GLB File
                      </Button>
                    </a>
                  )}
                </div>
              )}

              {/* Delete */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Model
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this model?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The 3D model and all associated data will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Model Details */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Model Details</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Model ID</dt>
                      <dd className="font-medium">{model.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium capitalize">{model.status}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Job ID</dt>
                      <dd className="font-medium font-mono text-xs">{model.job_id || "N/A"}</dd>
                    </div>
                    {model.completed_at && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Completed</dt>
                        <dd className="font-medium">
                          {new Date(model.completed_at).toLocaleString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

