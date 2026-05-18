"use client"

import { usePathname, useRouter } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { routing } from "@/i18n/routing"

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  id: "Indonesia",
  ko: "한국어",
}

const LOCALE_FLAGS: Record<string, string> = {
  en: "🇬🇧",
  id: "🇮🇩",
  ko: "🇰🇷",
}

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function switchTo(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale })
    fetch("/api/me/locale", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    }).catch(() => {})
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-xs text-ink-muted hover:text-ink hover:bg-elevated transition-colors",
          className,
        )}
      >
        <Globe className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchTo(loc)}
            className={cn(
              "gap-2 text-[12px]",
              loc === locale && "font-semibold bg-accent/50",
            )}
          >
            <span className="text-sm">{LOCALE_FLAGS[loc]}</span>
            <span>{LOCALE_LABELS[loc]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
