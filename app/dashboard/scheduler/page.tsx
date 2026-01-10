import { Suspense } from "react"
import { SchedulerContent } from "./scheduler-content"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"

export const dynamic = 'force-dynamic'

export default function SchedulerPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={5} columns={5} />}>
      <SchedulerContent />
    </Suspense>
  )
}
