import { Badge } from '@/components/ui/Badge'
import { RENTAL_STATUS_LABELS } from '@/lib/constants'

interface RentalStatusBadgeProps {
  status: string
}

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  approved: 'info',
  rejected: 'danger',
  active: 'success',
  returned: 'default',
  cancelled: 'default',
}

export function RentalStatusBadge({ status }: RentalStatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status] ?? 'default'}>
      {RENTAL_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
