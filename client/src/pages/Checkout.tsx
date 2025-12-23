import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";

import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Box,
  CreditCard,
  Truck,
  Check,
} from "lucide-react";

export default function Checkout() {
  const { modelId } = useParams<{ modelId: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shipping form state
  const [shippingName, setShippingName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [notes, setNotes] = useState("");

  const { data: model, isLoading: modelLoading } = trpc.models.get.useQuery(
    { id: parseInt(modelId!) },
    { enabled: isAuthenticated && !!modelId }
  );

  const { data: printSizes, isLoading: sizesLoading } = trpc.printSizes.list.useQuery();

  const createOrderMutation = trpc.orders.create.useMutation();
  const createPaymentMutation = trpc.payments.create.useMutation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/auth");
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (printSizes && printSizes.length > 0 && !selectedSize) {
      setSelectedSize(printSizes[0].id);
    }
  }, [printSizes, selectedSize]);

  const selectedPrintSize = printSizes?.find((s) => s.id === selectedSize);
  const totalPrice = selectedPrintSize
    ? Number(selectedPrintSize.price_usd) * quantity
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSize || !model) {
      toast.error("Please select a print size");
      return;
    }

    if (!shippingName || !shippingAddress || !shippingCity || !shippingCountry || !shippingPostalCode) {
      toast.error("Please fill in all required shipping fields");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create order
      const order = await createOrderMutation.mutateAsync({
        model3dId: model.id,
        printSizeId: selectedSize,
        quantity,
        shippingName,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingCountry,
        shippingPostalCode,
        shippingPhone,
        notes,
      });

      // Create PayPal payment
      const payment = await createPaymentMutation.mutateAsync({
        orderId: order.id,
        returnUrl: `${window.location.origin}/payment/success?orderId=${order.id}`,
        cancelUrl: `${window.location.origin}/orders/${order.id}`,
      });

      if (payment.approvalUrl) {
        // Redirect to PayPal
        window.location.href = payment.approvalUrl;
      } else {
        toast.error("Failed to create payment. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create order");
      setIsSubmitting(false);
    }
  };

  if (authLoading || modelLoading || sizesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !model) {
    return null;
  }

  if (model.status !== "completed") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-12">
          <div className="container max-w-2xl text-center">
            <Box className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Model Not Ready</h1>
            <p className="text-muted-foreground mb-6">
              This model is still being generated. Please wait until it's complete before ordering a print.
            </p>
            <Link href={`/models/${model.id}`}>
              <Button>View Model Status</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-5xl">
          {/* Back button */}
          <Link href={`/models/${model.id}`}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Model
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-8">Order 3D Print</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Options */}
              <div className="lg:col-span-2 space-y-6">
                {/* Print Size Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Box className="h-5 w-5" />
                      Select Print Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={selectedSize?.toString()}
                      onValueChange={(v) => setSelectedSize(parseInt(v))}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {printSizes?.map((size) => (
                          <div key={size.id}>
                            <RadioGroupItem
                              value={size.id.toString()}
                              id={`size-${size.id}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`size-${size.id}`}
                              className="flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">{size.name}</span>
                                <span className="text-lg font-bold gradient-text">
                                  ${size.price_usd}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {size.dimensions} • {size.description}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Quantity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quantity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="123 Main St, Apt 4"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          placeholder="NY"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          value={shippingCountry}
                          onChange={(e) => setShippingCountry(e.target.value)}
                          placeholder="United States"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="postal">Postal Code *</Label>
                        <Input
                          id="postal"
                          value={shippingPostalCode}
                          onChange={(e) => setShippingPostalCode(e.target.value)}
                          placeholder="10001"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special instructions..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Model Preview */}
                    <div className="aspect-square rounded-xl bg-muted overflow-hidden">
                      {model.preview_url ? (
                        <img
                          src={model.preview_url}
                          alt="Model preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Box className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    {/* Summary Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model</span>
                        <span className="font-medium">#{model.id}</span>
                      </div>
                      {selectedPrintSize && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size</span>
                          <span className="font-medium">{selectedPrintSize.name}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium">{quantity}</span>
                      </div>
                      {selectedPrintSize && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unit Price</span>
                          <span className="font-medium">${selectedPrintSize.price_usd}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-2xl font-bold gradient-text">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Free shipping worldwide
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        7-14 day delivery
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Premium PLA material
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full btn-apple text-lg py-6"
                      disabled={isSubmitting || !selectedSize}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Pay with PayPal
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Secure payment powered by PayPal
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
