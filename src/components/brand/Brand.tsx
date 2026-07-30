import { cn } from "@/lib/utils"

type BrandWordmarkProps = {
  className?: string
}

export function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        "relative inline-block font-mono text-2xl font-black leading-none text-neutral-950",
        className
      )}
      aria-label="D:EAR"
    >
      D:EAR
      <PixelDeer className="absolute -right-[0.1em] -top-[0.18em] h-[0.68em] w-[0.78em]" />
    </span>
  )
}

function PixelDeer({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 16"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d="M3 0h2v2h1V0h2v4h2v2h4V5h2v2h2v4h-2v-1h-1v6h-2v-5h-3v5H8v-5H6V9H3V8H1V7H0V5h2V3h1V0Z" />
    </svg>
  )
}

export function SplashLogo() {
  return (
    <div className="splash-logo" role="img" aria-label="D:EAR 앱 로고">
      <img src="/dear-splash.png" alt="" />
    </div>
  )
}
