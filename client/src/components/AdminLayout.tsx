import { Link, useLocation } from "wouter";
import { Package, Trophy, ShoppingCart, Ticket, Settings, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
    });
  };

  const navItems = [
    { icon: Package, label: "Manage Packages", href: "/admin/packages" },
    { icon: Trophy, label: "Manage Rankings", href: "/admin/rankings" },
    { icon: ShoppingCart, label: "Manage Orders", href: "/admin/orders" },
    { icon: Ticket, label: "Manage Coupons", href: "/admin/coupons" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-zinc-950 border-r border-yellow-500/20 transition-all duration-300 z-50 ${
          sidebarOpen ? "w-64" : "w-0 -translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Header */}
          <div className="p-6 border-b border-yellow-500/20">
            <h1 className="text-2xl font-bebas tracking-wider text-yellow-400">
              ADMIN PANEL
            </h1>
            <p className="text-xs text-zinc-500 mt-1">AECOIN Store Management</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    data-testid={`link-admin-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                        : "text-zinc-400 hover:bg-yellow-500/10 hover:text-yellow-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-rajdhani font-medium">{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-yellow-500/20">
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 rounded-lg mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-400 font-bold text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                <p className="text-xs text-zinc-500">Administrator</p>
              </div>
            </div>
            <Button
              data-testid="button-logout"
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Mobile Toggle */}
        <button
          data-testid="button-toggle-sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-40 lg:hidden bg-zinc-900 border border-yellow-500/30 text-yellow-400 p-2 rounded-lg hover:bg-yellow-500/10"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Content Area */}
        <main className="min-h-screen p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
