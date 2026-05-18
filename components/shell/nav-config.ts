import {
  LayoutDashboard,
  ListChecks,
  CalendarDays,
  Users,
  BarChart3,
  Bell,
  Phone,
  UserCog,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

export type Role = "Editor" | "KoreaTeam" | "Admin"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  match?: (pathname: string) => boolean
  badge?: "notif" | null
}

export interface NavSection {
  label?: string
  items: NavItem[]
}

type TFunc = (key: string) => string

export function getNavConfig(t: TFunc, role: Role): NavSection[] {
  switch (role) {
    case "Admin":
      return [
        {
          items: [
            { label: t("nav.dashboard"), href: "/dashboard/admin", icon: LayoutDashboard },
            { label: t("nav.tasks"), href: "/dashboard/korea/tasks", icon: ListChecks },
            { label: t("nav.calendar"), href: "/dashboard/admin/calendar", icon: CalendarDays },
          ],
        },
        {
          label: t("nav.collaborate"),
          items: [
            { label: t("nav.calls"), href: "/dashboard/calls", icon: Phone },
          ],
        },
        {
          label: t("nav.admin"),
          items: [
            { label: t("nav.team"), href: "/dashboard/admin", icon: Users },
            { label: t("nav.reports"), href: "/dashboard/admin/reports", icon: BarChart3 },
            { label: t("nav.users"), href: "/dashboard/admin/users", icon: UserCog },
          ],
        },
        {
          label: t("nav.you"),
          items: [
            {
              label: t("nav.notifications"),
              href: "/dashboard/notifications",
              icon: Bell,
              badge: "notif",
            },
          ],
        },
      ]
    case "KoreaTeam":
      return [
        {
          items: [
            { label: t("nav.dashboard"), href: "/dashboard/korea", icon: LayoutDashboard },
            { label: t("nav.tasks"), href: "/dashboard/korea/tasks", icon: ListChecks },
            { label: t("nav.calendar"), href: "/dashboard/korea/calendar", icon: CalendarDays },
          ],
        },
        {
          label: t("nav.collaborate"),
          items: [
            { label: t("nav.calls"), href: "/dashboard/calls", icon: Phone },
          ],
        },
        {
          label: t("nav.you"),
          items: [
            {
              label: t("nav.notifications"),
              href: "/dashboard/notifications",
              icon: Bell,
              badge: "notif",
            },
          ],
        },
      ]
    default:
      return [
        {
          items: [
            { label: t("nav.dashboard"), href: "/dashboard/editor", icon: LayoutDashboard },
            { label: t("nav.myTasks"), href: "/dashboard/editor/tasks", icon: ListChecks },
            { label: t("nav.calendar"), href: "/dashboard/editor/calendar", icon: CalendarDays },
          ],
        },
        {
          label: t("nav.collaborate"),
          items: [
            { label: t("nav.calls"), href: "/dashboard/calls", icon: Phone },
          ],
        },
        {
          label: t("nav.you"),
          items: [
            {
              label: t("nav.notifications"),
              href: "/dashboard/notifications",
              icon: Bell,
              badge: "notif",
            },
          ],
        },
      ]
  }
}

export const ROLE_LABEL_KEYS: Record<Role, string> = {
  Editor: "roles.Editor",
  KoreaTeam: "roles.KoreaTeam",
  Admin: "roles.Admin",
}

export function homeFor(role: Role): string {
  if (role === "Admin") return "/dashboard/admin"
  if (role === "KoreaTeam") return "/dashboard/korea"
  return "/dashboard/editor"
}

export function useNavigation(role: Role) {
  const t = useTranslations()
  return {
    sections: getNavConfig(t, role),
    homeHref: homeFor(role),
    roleLabel: t(ROLE_LABEL_KEYS[role]),
  }
}
