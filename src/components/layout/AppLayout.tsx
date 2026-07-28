import { Link, NavLink, Outlet } from "react-router-dom"
import {
  Bell,
  PackageSearch,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "상품", icon: ShoppingBag },
  { to: "/search", label: "검색", icon: Search },
  { to: "/profile", label: "프로필", icon: UserRound },
]

export function AppLayout() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-neutral-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-neutral-200 px-5">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-8 items-center justify-center rounded-md bg-neutral-950 text-white">
              <PackageSearch className="size-4" />
            </span>
            Dear
          </Link>
        </div>

        <nav className="space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950",
                  isActive && "bg-neutral-950 text-white hover:bg-neutral-950 hover:text-white"
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <span className="flex size-8 items-center justify-center rounded-md bg-neutral-950 text-white">
                <PackageSearch className="size-4" />
              </span>
              <span className="font-semibold">Dear</span>
            </div>
            <div className="hidden text-sm text-neutral-500 lg:block">
              Gateway API 기반 커머스 클라이언트
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="알림">
                <Bell className="size-4" />
              </Button>
              <Button asChild size="sm">
                <Link to="/login">
                  <UserRound className="size-4" />
                  로그인
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-56px)] p-4 pb-20 lg:p-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid h-16 grid-cols-3 border-t border-neutral-200 bg-white lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium text-neutral-500",
                isActive && "text-neutral-950"
              )
            }
          >
            <item.icon className="size-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
