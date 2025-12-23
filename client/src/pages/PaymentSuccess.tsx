import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useSearch, useLocation } from "wouter";
import { useEffect, useState } from "react";

import { toast } from "sonner";
import {
  CheckCircle,
  Loader2,
  Package,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function PaymentSuccess() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const orderId = params.get("orderId");
  const token = params.get("token"); // PayPal token
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const { data: order, refetch: refetchOrder } = trpc.orders.get.useQuery(
    { id: parseInt(orderId!) },
    { enabled: isAuthenticated && !!orderId }
  );

  const { data: payment } = trpc.payments.getByOrderId.useQuery(
    { orderId: parseInt(orderId!) },
    { enabled: isAuthenticated && !!orderId }
  );

  const captureMutation = trpc.payments.capture.useMutation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/auth");
    }
  }, [authLoading, isAuthenticated]);

  // Capture payment when returning from PayPal
  useEffect(() => {
    const capturePayment = async () => {
      if (payment?.paypal_order_id && payment.status === "pending" && !isCapturing && !captureComplete) {
        setIsCapturing(true);
        try {
          const result = await captureMutation.mutateAsync({
            paypalOrderId: payment.paypal_order_id,
          });

          if (result.success) {
            setCaptureComplete(true);
            await refetchOrder();
            toast.success("Payment completed successfully!");
          } else {
            setCaptureError("Payment capture failed. Please contact support.");
          }
        } catch (error: any) {
          setCaptureError(error.message || "Payment capture failed");
        }
        setIsCapturing(false);
      } else if (payment?.status === "completed") {
        setCaptureComplete(true);
      }
    };

    capturePayment();
  }, [payment]);

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

      <main className="flex-1 pt-24 pb-12 flex items-center">
        <div className="container max-w-lg">
          <Card className="text-center">
            <CardContent className="p-8">
              {isCapturing ? (
                <>
                  <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-6" />
                  <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
                  <p className="text-muted-foreground">
                    Please wait while we confirm your payment...
                  </p>
                </>
              ) : captureError ? (
                <>
                  <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Payment Issue</h1>
                  <p className="text-muted-foreground mb-6">{captureError}</p>
                  <Link href="/support">
                    <Button variant="outline">Contact Support</Button>
                  </Link>
                </>
              ) : captureComplete || order?.status === "paid" ? (
                <>
                  <div className="w-20 h-20 mx-auto rounded-full gradient-bg flex items-center justify-center mb-6 scale-in">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2 fade-in">Payment Successful!</h1>
                  <p className="text-muted-foreground mb-6 fade-in">
                    Thank you for your order. We've received your payment and will start
                    processing your 3D print right away.
                  </p>

                  {order && (
                    <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <Package className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Order Details</span>
                      </div>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Order Number</dt>
                          <dd className="font-medium">{order.order_number}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Total Paid</dt>
                          <dd className="font-medium">${order.total_price_usd}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Estimated Delivery</dt>
                          <dd className="font-medium">7-14 business days</dd>
                        </div>
                      </dl>
                    </div>
                  )}

                  <div className="space-y-3">
                    {order && (
                      <Link href={`/orders/${order.id}`}>
                        <Button className="w-full btn-apple">
                          View Order Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                    <Link href="/orders">
                      <Button variant="outline" className="w-full">
                        View All Orders
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-6" />
                  <h1 className="text-2xl font-bold mb-2">Loading...</h1>
                  <p className="text-muted-foreground">
                    Please wait while we load your order details...
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
