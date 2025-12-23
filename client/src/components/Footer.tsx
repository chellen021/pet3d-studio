import { Link } from "wouter";
import { Box, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="gradient-bg flex h-9 w-9 items-center justify-center rounded-xl">
                <Box className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold gradient-text">Pet3D Studio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transform your beloved pet photos into stunning 3D printed figurines with AI-powered technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-foreground transition-colors">
                  Create Model
                </Link>
              </li>
              <li>
                <Link href="/models" className="hover:text-foreground transition-colors">
                  My Models
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/support" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-foreground transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                support@pet3d.studio
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Live Chat Support
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pet3D Studio. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
