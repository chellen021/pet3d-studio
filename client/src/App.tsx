import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Models from "./pages/Models";
import ModelDetail from "./pages/ModelDetail";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Support from "./pages/Support";
import Pricing from "./pages/Pricing";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/login" component={Auth} />
      <Route path="/signup" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/upload" component={Upload} />
      <Route path="/models" component={Models} />
      <Route path="/models/:id" component={ModelDetail} />
      <Route path="/orders" component={Orders} />
      <Route path="/orders/:id" component={OrderDetail} />
      <Route path="/checkout/:modelId" component={Checkout} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/support" component={Support} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
