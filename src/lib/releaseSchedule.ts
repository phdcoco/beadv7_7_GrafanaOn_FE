const KOREA_OFFSET_IN_HOURS = 9
const RELEASE_HOUR_IN_KOREA = 20
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

export function getNextReleaseAt(now = new Date()) {
  const koreaNow = new Date(
    now.getTime() + KOREA_OFFSET_IN_HOURS * 60 * 60 * 1000
  )

  let releaseAt = Date.UTC(
    koreaNow.getUTCFullYear(),
    koreaNow.getUTCMonth(),
    koreaNow.getUTCDate(),
    RELEASE_HOUR_IN_KOREA - KOREA_OFFSET_IN_HOURS
  )

  if (now.getTime() >= releaseAt) {
    releaseAt += DAY_IN_MILLISECONDS
  }

  return new Date(releaseAt)
}

export function getReleaseCountdown(now: Date, releaseAt: Date) {
  const remaining = Math.max(0, releaseAt.getTime() - now.getTime())
  const totalSeconds = Math.floor(remaining / 1000)

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export function formatReleaseDate(releaseAt: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
  }).format(releaseAt)
}
