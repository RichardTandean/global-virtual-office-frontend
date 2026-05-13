import { requireRole } from "@/lib/auth-helpers"
import { PageHeader } from "@/components/shell/page-header"
import { WeeklyReportPanel } from "./weekly-report-panel"

export default async function AdminReportsPage() {
  await requireRole("Admin")

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Laporan Mingguan"
        description="Ringkasan jam kerja dan task selesai per editor, per minggu."
      />
      <WeeklyReportPanel />
    </div>
  )
}
