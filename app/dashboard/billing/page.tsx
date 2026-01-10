import { Suspense } from "react"
import { BillingContent } from "./billing-content"
import { Loader2 } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <BillingContent />
    </Suspense>
  )
}
