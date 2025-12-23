import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Loader2,
  Bot,
  User,
  HelpCircle,
  Package,
  CreditCard,
  Truck,
  Clock,
} from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Support() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Pet3D Studio assistant. How can I help you today? Feel free to ask about our 3D printing service, pricing, delivery, or anything else!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.chat.send.useMutation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        message: userMessage,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: response.message }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an issue. Please try again or contact us at support@pet3d.studio",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    { icon: Package, text: "How does the 3D printing process work?" },
    { icon: CreditCard, text: "What are the pricing options?" },
    { icon: Truck, text: "How long does shipping take?" },
    { icon: Clock, text: "How long does model generation take?" },
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const faqs = [
    {
      question: "What image formats are supported?",
      answer: "We support JPG, PNG, and WEBP formats. Images should be between 128-5000 pixels and under 8MB.",
    },
    {
      question: "How long does 3D model generation take?",
      answer: "Model generation typically takes 2-5 minutes depending on the complexity of the image.",
    },
    {
      question: "What materials are used for printing?",
      answer: "We use premium PLA (Polylactic Acid) material, which is durable, eco-friendly, and produces detailed prints.",
    },
    {
      question: "Can I get a refund?",
      answer: "Yes! If you're not satisfied with the 3D model preview, you can request a full refund before placing a print order.",
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we offer free worldwide shipping. Delivery typically takes 7-14 business days.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
            <p className="text-muted-foreground">
              Get instant answers from our AI assistant or browse FAQs below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Section */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    AI Support Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex gap-3 ${
                            message.role === "user" ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.role === "user"
                                ? "gradient-bg text-white"
                                : "bg-muted"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              message.role === "user"
                                ? "gradient-bg text-white"
                                : "bg-muted"
                            }`}
                          >
                            {message.role === "assistant" ? (
                              <Streamdown>{message.content}</Streamdown>
                            ) : (
                              <p className="text-sm">{message.content}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="bg-muted rounded-2xl px-4 py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Quick Questions */}
                  {messages.length <= 1 && (
                    <div className="px-4 pb-2">
                      <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                      <div className="flex flex-wrap gap-2">
                        {quickQuestions.map((q, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleQuickQuestion(q.text)}
                          >
                            <q.icon className="h-3 w-3 mr-1" />
                            {q.text}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your question..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="gradient-bg"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQs Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                        <h4 className="font-medium text-sm mb-1">{faq.question}</h4>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Need More Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Can't find what you're looking for? Contact us directly:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      <a href="mailto:support@pet3d.studio" className="text-primary hover:underline">
                        support@pet3d.studio
                      </a>
                    </p>
                    <p>
                      <span className="font-medium">Response Time:</span>{" "}
                      Within 24 hours
                    </p>
                  </div>
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
