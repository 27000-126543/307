import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Calendar,
  FileCheck,
  UserPlus,
  BarChart3,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "工作台", icon: LayoutDashboard, path: "/" },
  { label: "简历管理", icon: FileText, path: "/resumes" },
  { label: "岗位与筛选", icon: Briefcase, path: "/screening" },
  { label: "面试管理", icon: Calendar, path: "/interviews" },
  { label: "录用审批", icon: FileCheck, path: "/offers" },
  { label: "入职管理", icon: UserPlus, path: "/onboarding" },
  { label: "统计分析", icon: BarChart3, path: "/statistics" },
];

function BreadcrumbItem({ label }: { label: string }) {
  return <span className="text-sm text-gray-500">{label}</span>;
}

function Breadcrumb() {
  const location = useLocation();
  const current = navItems.find((item) => item.path === location.pathname);
  const label = current?.label ?? "工作台";

  return (
    <div className="flex items-center gap-1.5">
      <BreadcrumbItem label="智聘星途" />
      <span className="text-gray-400">/</span>
      <BreadcrumbItem label={label} />
    </div>
  );
}

export function SidebarNav({ collapsed }: { collapsed: boolean }) {
  return (
    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg transition-all duration-200",
              collapsed
                ? "justify-center px-2 py-2.5"
                : "px-3 py-2.5",
              isActive
                ? "bg-white/10 text-gold-400 shadow-sm"
                : "text-brand-200 hover:bg-white/5 hover:text-white"
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-5 w-5")} />
              {!collapsed && (
                <span className="truncate text-sm font-medium">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto h-2 w-2 rounded-full bg-gold-400" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? "64px" : "240px";

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <aside
        style={{ width: sidebarWidth }}
        className="flex flex-col bg-brand-900 text-white transition-all duration-300 shrink-0"
      >
        <div
          className={cn(
            "flex items-center border-b border-white/10 px-4",
            collapsed ? "justify-center py-4" : "gap-3 py-4"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-400 text-brand-900 font-bold text-sm">
            智
          </div>
          {!collapsed && (
            <span className="text-base font-semibold tracking-wide whitespace-nowrap">
              智聘星途
            </span>
          )}
        </div>

        <SidebarNav collapsed={collapsed} />

        <div className="border-t border-white/10 p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-2 py-2",
              collapsed && "justify-center"
            )}
          >
            <div className="h-8 w-8 shrink-0 rounded-full bg-brand-500 flex items-center justify-center text-sm font-medium">
              HR
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">张明远</p>
                <p className="truncate text-xs text-brand-300">人力资源部</p>
              </div>
            )}
            {!collapsed && (
              <button className="shrink-0 rounded-md p-1 text-brand-300 hover:bg-white/10 hover:text-white transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <Breadcrumb />

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索候选人、岗位..."
                className="h-8 w-56 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-400 transition-colors"
              />
            </div>

            <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            </button>

            <div className="h-6 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-sm font-medium text-white">
                张
              </div>
              <span className="text-sm font-medium text-gray-700">张明远</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed bottom-6 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md text-gray-500 hover:text-gray-700 hover:shadow-lg transition-all"
        style={{ left: collapsed ? 40 : 220 }}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
