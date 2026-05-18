import { requireRole } from "@/lib/auth-helpers"
import { getTranslations } from "next-intl/server"
import { PageHeader } from "@/components/shell/page-header"
import { WeeklyReportPanel } from "./weekly-report-panel"

export default async function AdminReportsPage() {
  await requireRole("Admin")
  const t = await getTranslations()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("reports.eyebrow")}
        title={t("reports.title")}
        description={t("reports.desc")}
      />
      <WeeklyReportPanel />
    </div>
  )
}
