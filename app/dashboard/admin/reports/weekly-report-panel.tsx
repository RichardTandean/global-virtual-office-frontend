"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Download, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

interface ReportRow {
  userId: string
  name: string
  email: string
  role: string
  totalMinutes: number
  tasksCompleted: number
  avgMinutesPerTask: number
}

type SortKey = "name" | "role" | "totalMinutes" | "tasksCompleted" | "avgMinutesPerTask"

function startOfIsoWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function formatHours(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}j ${m.toString().padStart(2, "0")}m`
}

function formatRange(weekStart: Date) {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  return `${weekStart.toLocaleDateString("id-ID", opts)} – ${end.toLocaleDateString("id-ID", { ...opts, year: "numeric" })}`
}

export function WeeklyReportPanel() {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfIsoWeek(new Date()))
  const [rows, setRows] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>("totalMinutes")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const fetchData = useCallback(async (ws: Date) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/reports/weekly?weekStart=${ws.toISOString()}`,
      )
      const data = await res.json()
      setRows(Array.isArray(data.rows) ? data.rows : [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(weekStart)
  }, [weekStart, fetchData])

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number)
    })
    return sorted
  }, [rows, sortKey, sortDir])

  function toggleSort(k: SortKey) {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(k)
      setSortDir("desc")
    }
  }

  function shiftWeek(dir: -1 | 1) {
    setWeekStart((cur) => {
      const n = new Date(cur)
      n.setDate(n.getDate() + dir * 7)
      return n
    })
  }

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.minutes += r.totalMinutes
        acc.tasks += r.tasksCompleted
        return acc
      },
      { minutes: 0, tasks: 0 },
    )
  }, [rows])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => shiftWeek(-1)}
            aria-label="Minggu sebelumnya"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div>
            <p className="font-display italic text-2xl text-ink leading-none">
              {formatRange(weekStart)}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">
              Minggu mulai{" "}
              <span className="font-mono tabular-nums">
                {weekStart.toLocaleDateString("id-ID")}
              </span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => shiftWeek(1)}
            aria-label="Minggu berikutnya"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="ml-2"
            onClick={() => setWeekStart(startOfIsoWeek(new Date()))}
          >
            Minggu ini
          </Button>
        </div>

        <a
          href={`/api/reports/weekly.csv?weekStart=${weekStart.toISOString()}`}
          className="inline-flex items-center gap-1.5 h-8 rounded-sm border border-line bg-surface px-3 text-[12px] font-medium text-ink hover:bg-elevated transition-colors"
        >
          <Download className="size-4" />
          Export CSV
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Total editor" value={rows.length.toString()} />
        <StatTile label="Total jam" value={formatHours(totals.minutes)} />
        <StatTile label="Total task selesai" value={totals.tasks.toString()} />
        <StatTile
          label="Rata-rata jam / editor"
          value={
            rows.length > 0
              ? formatHours(Math.round(totals.minutes / rows.length))
              : "—"
          }
        />
      </div>

      <div className="rounded-md border border-line bg-surface overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-sm bg-subtle/60 animate-pulse"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10">
            <EmptyState
              title="Belum ada data"
              description="Tidak ada laporan untuk minggu ini."
            />
          </div>
        ) : (
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-line bg-subtle/30 text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                <Th label="Editor" sortKey="name" onClick={toggleSort} active={sortKey} dir={sortDir} />
                <Th label="Role" sortKey="role" onClick={toggleSort} active={sortKey} dir={sortDir} />
                <Th
                  label="Jam"
                  sortKey="totalMinutes"
                  onClick={toggleSort}
                  active={sortKey}
                  dir={sortDir}
                  align="right"
                />
                <Th
                  label="Task selesai"
                  sortKey="tasksCompleted"
                  onClick={toggleSort}
                  active={sortKey}
                  dir={sortDir}
                  align="right"
                />
                <Th
                  label="Rata-rata / task"
                  sortKey="avgMinutesPerTask"
                  onClick={toggleSort}
                  active={sortKey}
                  dir={sortDir}
                  align="right"
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sortedRows.map((r) => (
                <tr
                  key={r.userId}
                  className="hover:bg-subtle/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-ink font-medium">{r.name}</p>
                    <p className="text-[11px] text-ink-muted">{r.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{r.role}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-ink">
                    {formatHours(r.totalMinutes)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-ink">
                    {r.tasksCompleted}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-ink-secondary">
                    {r.avgMinutesPerTask > 0
                      ? `${r.avgMinutesPerTask}m`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-surface px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </p>
      <p className="mt-2 font-display italic text-3xl text-ink leading-none">
        {value}
      </p>
    </div>
  )
}

function Th({
  label,
  sortKey,
  onClick,
  active,
  dir,
  align,
}: {
  label: string
  sortKey: SortKey
  onClick: (k: SortKey) => void
  active: SortKey
  dir: "asc" | "desc"
  align?: "left" | "right"
}) {
  const isActive = active === sortKey
  return (
    <th className={cn("px-4 py-2.5 font-medium")}>
      <button
        onClick={() => onClick(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-ink transition-colors",
          align === "right" && "ml-auto flex",
          isActive && "text-ink",
        )}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "size-3 opacity-50 transition-transform",
            isActive && "opacity-100",
            isActive && dir === "asc" && "rotate-180",
          )}
        />
      </button>
    </th>
  )
}
