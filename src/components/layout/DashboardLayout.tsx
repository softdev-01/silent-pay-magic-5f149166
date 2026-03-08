import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, CreditCard, FileText, Settings, Users, BarChart3,
  Wallet, ShieldCheck, Menu, X, LogOut, ChevronDown, Zap, ShoppingCart, Package, Bell
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@/lib/types";

const navItems: Record<UserRole, { label: string; path: string; icon: ReactNode }[]> = {
  customer: [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Services", path: "/services", icon: <Zap className="h-4 w-4" /> },
    { label: "My Orders", path: "/customer/orders", icon: <ShoppingCart className="h-4 w-4" /> },
    { label: "Invoices", path: "/customer/invoices", icon: <FileText className="h-4 w-4" /> },
    { label: "My Wallet", path: "/wallet", icon: <Wallet className="h-4 w-4" /> },
    { label: "Payment History", path: "/payments", icon: <CreditCard className="h-4 w-4" /> },
    { label: "Settings", path: "/settings", icon: <Settings className="h-4 w-4" /> },
  ],
  provider: [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Orders", path: "/provider/orders", icon: <Package className="h-4 w-4" /> },
    { label: "Invoices", path: "/invoices", icon: <FileText className="h-4 w-4" /> },
    { label: "Services", path: "/services", icon: <Zap className="h-4 w-4" /> },
    { label: "Payments", path: "/payments", icon: <CreditCard className="h-4 w-4" /> },
    { label: "Received Payments", path: "/provider/payments", icon: <Bell className="h-4 w-4" /> },
    { label: "Customer Analytics", path: "/provider/analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Settings", path: "/settings", icon: <Settings className="h-4 w-4" /> },
  ],
  admin: [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Users", path: "/admin/users", icon: <Users className="h-4 w-4" /> },
    { label: "Transactions", path: "/admin/transactions", icon: <CreditCard className="h-4 w-4" /> },
    { label: "Analytics", path: "/admin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Security", path: "/admin/security", icon: <ShieldCheck className="h-4 w-4" /> },
  ],
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const items = navItems[user.role];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">InvisiPay</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-sidebar-accent">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => { switchRole("customer"); navigate("/dashboard"); }}>
                Switch to Customer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { switchRole("provider"); navigate("/dashboard"); }}>
                Switch to Provider
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { switchRole("admin"); navigate("/dashboard"); }}>
                Switch to Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6 lg:px-8">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-semibold capitalize">
            {items.find((i) => i.path === location.pathname)?.label ?? "Dashboard"}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
