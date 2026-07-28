import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import {
  Bell,
  HandCoins,
  Home,
  Search,
  ShoppingBag,
  UserRound,
  Zap,
} from "lucide-react"
import { BrandWordmark, SplashLogo } from "@/components/brand/Brand"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "홈", icon: Home, end: true },
  { to: "/immediate", label: "즉시구매", icon: Zap },
  { to: "/offers", label: "오퍼구매", icon: HandCoins },
  { to: "/profile", label: "마이페이지", icon: UserRound },
]

export function AppLayout() {
  const { pathname } = useLocation()
  const [showSplash, setShowSplash] = useState(
    () => sessionStorage.getItem("dear-splash-seen") !== "true"
  )
  const isProductDetail = pathname.startsWith("/products/")

  useEffect(() => {
    if (!showSplash) {
      return
    }

    const timer = window.setTimeout(() => {
      setShowSplash(false)
      sessionStorage.setItem("dear-splash-seen", "true")
    }, 1400)

    return () => window.clearTimeout(timer)
  }, [showSplash])

  return (
    <div className="min-h-screen bg-[#f3f3f1] text-neutral-950">
      {showSplash && (
        <div className="fixed inset-0 z-[100] flex animate-[splashOut_300ms_ease-in_1100ms_forwards] flex-col items-center justify-center bg-black text-white">
          <SplashLogo />
          <p className="mt-4 text-sm font-semibold">상품이 가진 이야기를 만나다</p>
        </div>
      )}

      <div className="mx-auto min-h-screen max-w-[1180px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)]">
        {!isProductDetail && (
          <header className="sticky top-0 z-30 border-b border-neutral-100 bg-white/96 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-5 md:h-[72px] md:px-8">
              <Link to="/" aria-label="D:EAR 홈">
                <BrandWordmark className="text-[26px] md:text-[30px]" />
              </Link>

              <nav className="hidden items-center gap-1 md:flex">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "group flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950",
                        isActive && "bg-neutral-950 text-white hover:bg-neutral-950 hover:text-white"
                      )
                    }
                  >
                    <item.icon className="size-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 group-active:scale-95" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="flex items-center gap-1">
                <Link
                  to="/search"
                  className="group flex size-10 items-center justify-center rounded-full transition-colors hover:bg-neutral-100"
                  aria-label="상품 검색"
                >
                  <Search className="size-6 stroke-[1.8] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-105" />
                </Link>
                <button
                  type="button"
                  className="group flex size-10 items-center justify-center rounded-full transition-colors hover:bg-neutral-100"
                  aria-label="알림"
                >
                  <Bell className="size-6 stroke-[1.8] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:rotate-6" />
                </button>
              </div>
            </div>
          </header>
        )}

        <main className={cn("min-h-screen", !isProductDetail && "pb-20 md:pb-0")}>
          <Outlet />
        </main>
      </div>

      {!isProductDetail && (
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto grid h-[72px] max-w-[680px] grid-cols-4 border-t border-neutral-200 bg-white/96 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "group relative flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-neutral-400",
                  isActive && "text-neutral-950"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md transition-transform duration-200 ease-out group-hover:-translate-y-1 group-active:scale-95",
                      isActive && "bg-[#58c8bd]/20"
                    )}
                  >
                    {item.to === "/immediate" ? (
                      <Zap
                        className={cn(
                          "size-6",
                          isActive && "fill-[#ffd448] text-neutral-950"
                        )}
                      />
                    ) : item.to === "/offers" ? (
                      <ShoppingBag
                        className={cn(
                          "size-6",
                          isActive && "fill-[#ef7469] text-neutral-950"
                        )}
                      />
                    ) : (
                      <item.icon className="size-6" />
                    )}
                  </span>
                  <span className="truncate px-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
