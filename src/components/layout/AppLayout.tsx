import { Link, NavLink, Outlet } from "react-router-dom"
import { PackageSearch, Search, ShoppingBag, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "상품", icon: ShoppingBag },
  { to: "/search", label: "검색", icon: Search },
  { to: "/profile", label: "프로필", icon: UserRound },
]

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold tracking-[0]">
            <span className="flex size-8 items-center justify-center rounded-md bg-neutral-950 text-white">
              <PackageSearch className="size-4" />
            </span>
            Dear
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-neutral-100",
                    isActive && "bg-neutral-100"
                  )
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
            <Button asChild size="sm">
              <Link to="/login">
                <UserRound className="size-4" />
                로그인
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  )
}
