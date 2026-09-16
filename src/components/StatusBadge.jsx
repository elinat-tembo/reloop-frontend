import { STATUS_BADGE_CLASSES } from '../utils/swapStatus'

function StatusBadge({ status }) {
  const className = STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.expired

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${className}`}
    >
      {status}
    </span>
  )
}

export default StatusBadge
