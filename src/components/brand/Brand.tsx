import { cn } from "@/lib/utils"

type BrandWordmarkProps = {
  className?: string
}

export function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        "font-mono text-2xl font-black leading-none text-neutral-950",
        className
      )}
      aria-label="D:EAR"
    >
      D:EAR
    </span>
  )
}

export function SplashLogo() {
  return (
    <div className="splash-logo" role="img" aria-label="D:EAR 앱 로고">
      <img src="/dear.png" alt="" />
    </div>
  )
}
