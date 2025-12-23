import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  AlertCircle,
  Loader2,
  Eye,
  ArrowRight,
} from "lucide-react";

export default function Orders() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: orders, isLoading } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
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
      case "pending":
        return (
          <span className="badge-warning">
            <Clock className="h-3 w-3" />
            Pending Payment
          </span>
        );
      case "paid":
        return (
          <span className="badge-success">
            <CreditCard className="h-3 w-3" />
            Paid
          </span>
        );
      case "processing":
        return (
          <span className="badge-info">
            <Package className="h-3 w-3" />
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="badge-info">
            <Truck className="h-3 w-3" />
            Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="badge-success">
            <CheckCircle className="h-3 w-3" />
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="badge-error">
            <AlertCircle className="h-3 w-3" />
            Cancelled
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">
              Track and manage your 3D print orders.
            </p>
          </div>

          {orders?.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create a 3D model first, then order a print.
                </p>
                <Link href="/models">
                  <Button className="btn-apple">
                    View My Models
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders?.map((order) => (
                <Card key={order.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{order.order_number}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-medium">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-medium text-lg">${order.total_price_usd}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quantity</p>
                            <p className="font-medium">{order.quantity}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Shipping</p>
                            <p className="font-medium truncate">{order.shipping_city}, {order.shipping_country}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
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
