import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";

import {
  Upload,
  Box,
  Package,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function Dashboard() {
  const { profile, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [redirecting, setRedirecting] = useState(false);

  const { data: models, isLoading: modelsLoading } = trpc.models.list.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
  });

  const { data: orders, isLoading: ordersLoading } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
  });

  // Handle redirect in useEffect to avoid render-phase navigation
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setRedirecting(true);
      setLocation("/auth");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading while redirecting to auth
  if (!isAuthenticated || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Models",
      value: models?.length || 0,
      icon: Box,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Completed",
      value: models?.filter((m) => m.status === "completed").length || 0,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Processing",
      value: models?.filter((m) => m.status === "processing").length || 0,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Orders",
      value: orders?.length || 0,
      icon: Package,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const recentModels = models?.slice(0, 3) || [];
  const recentOrders = orders?.slice(0, 3) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, <span className="gradient-text">{profile?.name || "User"}</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your 3D models and orders from your dashboard.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/upload">
              <Card className="card-hover cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="gradient-bg p-3 rounded-xl">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Upload New Photo</h3>
                    <p className="text-sm text-muted-foreground">Create a new 3D model</p>
                  </div>
                  <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/models">
              <Card className="card-hover cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-blue-500/10 p-3 rounded-xl">
                    <Box className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">View Models</h3>
                    <p className="text-sm text-muted-foreground">Browse your 3D models</p>
                  </div>
                  <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/orders">
              <Card className="card-hover cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-purple-500/10 p-3 rounded-xl">
                    <Package className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">My Orders</h3>
                    <p className="text-sm text-muted-foreground">Track your orders</p>
                  </div>
                  <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Models */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Models</CardTitle>
                <Link href="/models">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {modelsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentModels.length === 0 ? (
                  <div className="text-center py-8">
                    <Box className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">No models yet</p>
                    <Link href="/upload">
                      <Button variant="link" className="mt-2">
                        Create your first model
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentModels.map((model) => (
                      <Link key={model.id} href={`/models/${model.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Box className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">Model #{model.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(model.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            {model.status === "completed" && (
                              <span className="badge-success">
                                <CheckCircle className="h-3 w-3" />
                                Completed
                              </span>
                            )}
                            {model.status === "processing" && (
                              <span className="badge-warning">
                                <Clock className="h-3 w-3" />
                                Processing
                              </span>
                            )}
                            {model.status === "failed" && (
                              <span className="badge-error">
                                <AlertCircle className="h-3 w-3" />
                                Failed
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <Link href="/orders">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a model first to place an order
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <Link key={order.id} href={`/orders/${order.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              ${order.total_price_usd}
                            </p>
                          </div>
                          <div>
                            {order.status === "paid" && (
                              <span className="badge-success">Paid</span>
                            )}
                            {order.status === "pending" && (
                              <span className="badge-warning">Pending</span>
                            )}
                            {order.status === "processing" && (
                              <span className="badge-info">Processing</span>
                            )}
                            {order.status === "shipped" && (
                              <span className="badge-info">Shipped</span>
                            )}
                            {order.status === "delivered" && (
                              <span className="badge-success">Delivered</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
