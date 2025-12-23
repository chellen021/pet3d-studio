import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  Upload as UploadIcon,
  Image,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function Upload() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = trpc.petImages.upload.useMutation();
  const generateMutation = trpc.models.generate.useMutation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/auth");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const validateImage = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "Please upload a JPG, PNG, or WEBP image.";
    }
    if (file.size > 8 * 1024 * 1024) {
      return "Image must be less than 8MB.";
    }
    return null;
  };

  const processFile = useCallback((file: File) => {
    const error = validateImage(file);
    if (error) {
      toast.error(error);
      return;
    }

    setFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Convert to base64
    const base64Reader = new FileReader();
    base64Reader.onload = (e) => {
      const result = e.target?.result as string;
      // Remove data:image/xxx;base64, prefix
      const base64 = result.split(",")[1];
      setImageBase64(base64);
    };
    base64Reader.readAsDataURL(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setImageBase64(null);
  };

  const handleSubmit = async () => {
    if (!file || !imageBase64) return;

    try {
      setUploading(true);

      // Upload image
      const uploadResult = await uploadMutation.mutateAsync({
        imageBase64,
        fileName: file.name,
        mimeType: file.type,
      });

      toast.success("Image uploaded successfully!");
      setUploading(false);
      setGenerating(true);

      // Generate 3D model
      const generateResult = await generateMutation.mutateAsync({
        petImageId: uploadResult.id,
      });

      toast.success("3D model generation started! Redirecting to model page...");
      setLocation(`/models/${generateResult.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to process image");
      setUploading(false);
      setGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Upload Your Pet Photo
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload a clear photo of your pet and we'll transform it into a stunning 3D model
            </p>
          </div>

          {/* Tips */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-medium mb-1">Tips for best results:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use a clear, well-lit photo with your pet as the main subject</li>
                    <li>• Front or 3/4 angle views work best</li>
                    <li>• Avoid blurry or heavily filtered images</li>
                    <li>• Supported formats: JPG, PNG, WEBP (max 8MB)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Area */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <UploadIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium mb-1">
                        Drag and drop your pet photo here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <span>
                          <Image className="h-4 w-4 mr-2" />
                          Select Image
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Preview */}
                  <div className="relative aspect-square max-w-md mx-auto rounded-xl overflow-hidden bg-muted">
                    {preview && (
                      <img
                        src={preview}
                        alt="Pet preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={clearFile}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
                      disabled={uploading || generating}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* File Info */}
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>{file.name}</span>
                    <span>•</span>
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>

                  {/* Status */}
                  {(uploading || generating) && (
                    <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-primary/5">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="font-medium">
                        {uploading ? "Uploading image..." : "Generating 3D model..."}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={clearFile}
                      disabled={uploading || generating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={uploading || generating}
                      className="btn-apple"
                    >
                      {uploading || generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Generate 3D Model
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Process Steps */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: "Upload Photo",
                description: "Select a clear photo of your pet",
              },
              {
                step: 2,
                title: "AI Processing",
                description: "Our AI creates a detailed 3D model",
              },
              {
                step: 3,
                title: "Preview & Order",
                description: "View your model and order a print",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
