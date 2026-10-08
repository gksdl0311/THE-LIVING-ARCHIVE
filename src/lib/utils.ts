export function assetUrl(path: string): string {
  return /^(https?:|data:|blob:)/.test(path) ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

export function formatDate(date: string, language: 'en' | 'ko' = 'en'): string {
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parsed)
}
