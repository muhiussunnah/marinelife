import {
  Anchor, CircuitBoard, Cog, Droplets, Fan, Flame, Gauge, Hammer, LifeBuoy, Package, Radar, ShipWheel,
  Snowflake, Wrench, Zap, type LucideIcon,
} from 'lucide-react'
import { CATEGORY_BY_SLUG, type CategoryIcon as IconName } from '@/lib/listings-meta'

const ICONS: Record<IconName, LucideIcon> = {
  Cog, Zap, Fan, Droplets, Gauge, Flame, Anchor, Radar, CircuitBoard, ShipWheel, Wrench, LifeBuoy, Snowflake, Hammer, Package,
}

export default function CategoryIcon({ slug, className, style }: { slug: string; className?: string; style?: React.CSSProperties }) {
  const Icon = ICONS[CATEGORY_BY_SLUG[slug]?.icon ?? 'Package'] ?? Package
  return <Icon className={className} style={style} aria-hidden="true" />
}
