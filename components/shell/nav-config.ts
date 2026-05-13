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

const editor: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard/editor", icon: LayoutDashboard },
      { label: "My Tasks", href: "/dashboard/editor/tasks", icon: ListChecks },
      { label: "Calendar", href: "/dashboard/editor/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Collaborate",
    items: [
      { label: "Calls", href: "/dashboard/calls", icon: Phone },
    ],
  },
  {
    label: "You",
    items: [
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        badge: "notif",
      },
    ],
  },
]

const korea: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard/korea", icon: LayoutDashboard },
      { label: "Tasks", href: "/dashboard/korea/tasks", icon: ListChecks },
      { label: "Calendar", href: "/dashboard/korea/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Collaborate",
    items: [
      { label: "Calls", href: "/dashboard/calls", icon: Phone },
    ],
  },
  {
    label: "You",
    items: [
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        badge: "notif",
      },
    ],
  },
]

const admin: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      { label: "Tasks", href: "/dashboard/korea/tasks", icon: ListChecks },
      { label: "Calendar", href: "/dashboard/admin/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Collaborate",
    items: [
      { label: "Calls", href: "/dashboard/calls", icon: Phone },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Team", href: "/dashboard/admin", icon: Users },
      { label: "Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
      { label: "Users", href: "/dashboard/admin/users", icon: UserCog },
    ],
  },
  {
    label: "You",
    items: [
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        badge: "notif",
      },
    ],
  },
]

export function navFor(role: Role): NavSection[] {
  switch (role) {
    case "Admin":
      return admin
    case "KoreaTeam":
      return korea
    default:
      return editor
  }
}

export const roleLabel: Record<Role, string> = {
  Editor: "Editor",
  KoreaTeam: "Korea Team",
  Admin: "Admin",
}

export function homeFor(role: Role): string {
  if (role === "Admin") return "/dashboard/admin"
  if (role === "KoreaTeam") return "/dashboard/korea"
  return "/dashboard/editor"
}
