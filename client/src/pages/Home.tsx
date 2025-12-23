import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import {
  ArrowRight,
  Upload,
  Box,
  Truck,
  Star,
  Shield,
  Clock,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Upload,
      title: "Upload Photo",
      description: "Simply upload a clear photo of your beloved pet from any angle.",
    },
    {
      icon: Sparkles,
      title: "AI Generation",
      description: "Our advanced AI transforms your photo into a detailed 3D model in minutes.",
    },
    {
      icon: Box,
      title: "3D Printing",
      description: "Choose your preferred size and we'll print your pet in high-quality material.",
    },
    {
      icon: Truck,
      title: "Delivery",
      description: "Receive your unique pet figurine delivered safely to your doorstep.",
    },
  ];

  const benefits = [
    { icon: Shield, text: "100% Satisfaction Guarantee" },
    { icon: Clock, text: "Fast 7-14 Day Delivery" },
    { icon: Star, text: "Premium Quality Materials" },
    { icon: CheckCircle, text: "Secure Payment via PayPal" },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      text: "The 3D model of my golden retriever is absolutely stunning! It captures every detail perfectly.",
      rating: 5,
    },
    {
      name: "James K.",
      text: "Amazing quality and fast delivery. My cat figurine is now proudly displayed on my desk!",
      rating: 5,
    },
    {
      name: "Emily R.",
      text: "What a wonderful way to memorialize my beloved pet. The craftsmanship is exceptional.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 animated-gradient opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                AI-Powered 3D Pet Modeling
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              Turn Your Pet Into a{" "}
              <span className="gradient-text">3D Masterpiece</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Upload a photo of your beloved pet and watch as our AI transforms it into a stunning 3D printed figurine. 
              A perfect keepsake to cherish forever.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {isAuthenticated ? (
                <Link href="/upload">
                  <Button className="btn-apple text-lg px-8 py-6">
                    Create Your Model
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
              <Link href="/pricing">
                <Button variant="outline" className="text-lg px-8 py-6 rounded-full">
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              <div>
                <div className="text-3xl md:text-4xl font-bold gradient-text">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold gradient-text">50K+</div>
                <div className="text-sm text-muted-foreground">Models Created</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold gradient-text">4.9</div>
                <div className="text-sm text-muted-foreground">Star Rating</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Creating your pet's 3D figurine is simple and takes just a few minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-hover text-center"
              >
                <div className="gradient-bg w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-sm text-primary font-medium mb-2">Step {index + 1}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose <span className="gradient-text">Pet3D Studio</span>?
              </h2>
              <p className="text-muted-foreground mb-8">
                We combine cutting-edge AI technology with premium 3D printing to create 
                the most lifelike pet figurines. Every detail of your beloved companion 
                is captured with precision and care.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit.text} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <Box className="h-32 w-32 text-primary/50" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-2xl blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground">
              Join thousands of happy pet owners who've immortalized their furry friends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-hover"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="gradient-bg rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Create Your Pet's 3D Model?
              </h2>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                Start with a free 3D model generation. Only pay when you're ready to print!
              </p>
              {isAuthenticated ? (
                <Link href="/upload">
                  <Button className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-full">
                    Start Creating Now
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-full">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
