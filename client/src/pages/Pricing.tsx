import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import {
  Check,
  ArrowRight,
  Loader2,
  Box,
  Sparkles,
  Shield,
  Truck,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const { data: printSizes, isLoading } = trpc.printSizes.list.useQuery();

  const features = [
    { icon: Sparkles, text: "AI-powered 3D model generation" },
    { icon: Box, text: "Premium PLA material printing" },
    { icon: Truck, text: "Free worldwide shipping" },
    { icon: Shield, text: "100% satisfaction guarantee" },
    { icon: Clock, text: "7-14 day delivery" },
  ];

  const popularSize = printSizes?.find((s) => s.name === "Medium");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              <Sparkles className="h-4 w-4" />
              Simple, Transparent Pricing
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Choose Your Perfect Size
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              From desk decorations to statement pieces, we have the perfect size for every pet lover.
              All prices include free worldwide shipping.
            </motion.p>
          </div>

          {/* Pricing Cards */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {printSizes?.map((size, index) => {
                const isPopular = size.id === popularSize?.id;
                return (
                  <motion.div
                    key={size.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card
                      className={`relative h-full ${
                        isPopular
                          ? "border-primary shadow-lg shadow-primary/20"
                          : "card-hover"
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="gradient-bg text-white text-xs font-medium px-3 py-1 rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold mb-1">{size.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {size.dimensions}
                          </p>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-bold gradient-text">
                              ${size.price_usd}
                            </span>
                            <span className="text-muted-foreground">USD</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground text-center mb-6">
                          {size.description}
                        </p>

                        <ul className="space-y-3 mb-6">
                          <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            Premium PLA material
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            High-detail printing
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            Free worldwide shipping
                          </li>
                          <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            Satisfaction guarantee
                          </li>
                        </ul>

                        {isAuthenticated ? (
                          <Link href="/upload">
                            <Button
                              className={`w-full ${
                                isPopular ? "btn-apple" : ""
                              }`}
                              variant={isPopular ? "default" : "outline"}
                            >
                              Get Started
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        ) : (
                          <a href={getLoginUrl()}>
                            <Button
                              className={`w-full ${
                                isPopular ? "btn-apple" : ""
                              }`}
                              variant={isPopular ? "default" : "outline"}
                            >
                              Get Started
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Features */}
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Everything Included
              </h2>
              <p className="text-muted-foreground">
                No hidden fees. Every order includes these features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="card-hover">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Is the 3D model generation free?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! Creating your 3D model is completely free. You only pay when you decide to order a physical print.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">What if I'm not satisfied?</h3>
                  <p className="text-sm text-muted-foreground">
                    We offer a 100% satisfaction guarantee. If you're not happy with your 3D model preview, you don't have to order.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">How long does shipping take?</h3>
                  <p className="text-sm text-muted-foreground">
                    We offer free worldwide shipping. Delivery typically takes 7-14 business days depending on your location.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">What material is used?</h3>
                  <p className="text-sm text-muted-foreground">
                    We use premium PLA (Polylactic Acid) material, which is durable, eco-friendly, and produces highly detailed prints.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Create Your Pet's 3D Model?
            </h2>
            <p className="text-muted-foreground mb-6">
              Start for free and only pay when you're ready to print.
            </p>
            {isAuthenticated ? (
              <Link href="/upload">
                <Button className="btn-apple text-lg px-8 py-6">
                  Start Creating
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="btn-apple text-lg px-8 py-6">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
