// Admin access control
// Only these emails can access /admin routes. More can be added without a
// code change through the ADMIN_EMAILS env var (comma-separated).

const ADMIN_EMAILS = [
  'itsinjamul@gmail.com',
]

function adminList(): string[] {
  const extra = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return Array.from(new Set([...ADMIN_EMAILS.map((e) => e.toLowerCase()), ...extra]))
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return adminList().includes(email.toLowerCase())
}
