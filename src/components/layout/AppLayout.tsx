import { Link, Outlet } from "react-router-dom"
import { Search, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="text-xl font-semibold tracking-[0]">
            Dear
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <Search className="size-4" />
                Search
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/login">
                <UserRound className="size-4" />
                Login
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
