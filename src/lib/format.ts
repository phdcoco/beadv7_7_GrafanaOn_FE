export function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value)
}

export function formatDate(value: string | null) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value))
}
