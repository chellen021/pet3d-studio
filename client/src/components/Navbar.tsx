import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  Package,
  Image,
  Box,
  MessageCircle,
  Home,
  DollarSign,
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, profile, isAuthenticated, signOut, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/pricing", label: "Pricing", icon: DollarSign },
    { href: "/support", label: "Support", icon: MessageCircle },
  ];

  const userLinks = [
    { href: "/upload", label: "Upload", icon: Image },
    { href: "/models", label: "My Models", icon: Box },
    { href: "/orders", label: "Orders", icon: Package },
  ];

  const isActive = (path: string) => location === path;

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-border/50">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="gradient-bg flex h-9 w-9 items-center justify-center rounded-xl">
              <Box className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold gradient-text">Pet3D Studio</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={`gap-2 ${isActive(link.href) ? "bg-accent" : ""}`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
            {isAuthenticated && userLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={`gap-2 ${isActive(link.href) ? "bg-accent" : ""}`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* User menu / Login */}
            {loading ? (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="gradient-bg flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-medium">
                      {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/models" className="flex items-center gap-2 cursor-pointer">
                      <Box className="h-4 w-4" />
                      My Models
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                      <Package className="h-4 w-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="btn-apple text-sm px-4 py-2">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-2 ${isActive(link.href) ? "bg-accent" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <div className="h-px bg-border my-2" />
                  {userLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start gap-2 ${isActive(link.href) ? "bg-accent" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </>
              )}
              {!isAuthenticated && (
                <>
                  <div className="h-px bg-border my-2" />
                  <Link href="/auth">
                    <Button
                      className="w-full btn-apple"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
