import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useParams, useLocation } from "wouter";
import { useEffect } from "react";

import {
  Package,
  ArrowLeft,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  AlertCircle,
  Loader2,
  MapPin,
  Box,
} from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: order, isLoading } = trpc.orders.get.useQuery(
    { id: parseInt(id!) },
    { enabled: isAuthenticated && !!id }
  );

  const { data: payment } = trpc.payments.getByOrderId.useQuery(
    { orderId: parseInt(id!) },
    { enabled: isAuthenticated && !!id }
  );

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

  if (!isAuthenticated || !order) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="badge-warning text-base px-4 py-2">
            <Clock className="h-4 w-4" />
            Pending Payment
          </span>
        );
      case "paid":
        return (
          <span className="badge-success text-base px-4 py-2">
            <CreditCard className="h-4 w-4" />
            Paid
          </span>
        );
      case "processing":
        return (
          <span className="badge-info text-base px-4 py-2">
            <Package className="h-4 w-4" />
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="badge-info text-base px-4 py-2">
            <Truck className="h-4 w-4" />
            Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="badge-success text-base px-4 py-2">
            <CheckCircle className="h-4 w-4" />
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="badge-error text-base px-4 py-2">
            <AlertCircle className="h-4 w-4" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const orderTimeline = [
    { status: "pending", label: "Order Placed", icon: Package },
    { status: "paid", label: "Payment Received", icon: CreditCard },
    { status: "processing", label: "Printing", icon: Box },
    { status: "shipped", label: "Shipped", icon: Truck },
    { status: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const currentStatusIndex = orderTimeline.findIndex((t) => t.status === order.status);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-4xl">
          {/* Back button */}
          <Link href="/orders">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>

          {/* Order Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{order.order_number}</h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString()} at{" "}
                {new Date(order.created_at).toLocaleTimeString()}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>

          {/* Order Timeline */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Order Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between relative">
                {/* Progress line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-border">
                  <div
                    className="h-full gradient-bg transition-all duration-500"
                    style={{
                      width: `${(currentStatusIndex / (orderTimeline.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {orderTimeline.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={step.status} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted
                            ? "gradient-bg text-white"
                            : "bg-muted text-muted-foreground"
                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`text-xs mt-2 text-center ${
                          isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Order Number</dt>
                    <dd className="font-medium">{order.order_number}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Model ID</dt>
                    <dd className="font-medium">#{order.model_3d_id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Quantity</dt>
                    <dd className="font-medium">{order.quantity}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Unit Price</dt>
                    <dd className="font-medium">${order.unit_price_usd}</dd>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-bold text-lg">${order.total_price_usd}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shipping_name}</p>
                  <p className="text-muted-foreground">{order.shipping_address}</p>
                  <p className="text-muted-foreground">
                    {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                  </p>
                  <p className="text-muted-foreground">{order.shipping_country}</p>
                  {order.shipping_phone && (
                    <p className="text-muted-foreground mt-2">Phone: {order.shipping_phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payment ? (
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium capitalize">{payment.status}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Amount</dt>
                      <dd className="font-medium">${payment.amount_usd}</dd>
                    </div>
                    {payment.payer_email && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">PayPal Email</dt>
                        <dd className="font-medium">{payment.payer_email}</dd>
                      </div>
                    )}
                    {payment.paypal_capture_id && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Transaction ID</dt>
                        <dd className="font-medium font-mono text-xs">{payment.paypal_capture_id}</dd>
                      </div>
                    )}
                  </dl>
                ) : order.status === "pending" ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">Payment not yet completed</p>
                    <Button className="btn-apple" onClick={() => setLocation(`/checkout/${order.model_3d_id}`)}>
                      Complete Payment
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No payment information available</p>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* View Model */}
          <div className="mt-6">
            <Link href={`/models/${order.model_3d_id}`}>
              <Button variant="outline" className="w-full">
                <Box className="h-4 w-4 mr-2" />
                View 3D Model
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
