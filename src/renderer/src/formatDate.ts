import { format } from 'date-fns/format'
import { isThisYear } from 'date-fns/isThisYear'
import { isToday } from 'date-fns/isToday'
import { isTomorrow } from 'date-fns/isTomorrow'
import { isYesterday } from 'date-fns/isYesterday'
import { ja } from 'date-fns/locale'

export function formatDate(date: Date): string {
  return format(date, getFormatString(date), { locale: ja })
}

export function getFormatString(date: Date): string {
  if (isToday(date)) {
    return '今日'
  }
  if (isYesterday(date)) {
    return '昨日'
  }
  if (isTomorrow(date)) {
    return '明日'
  }
  if (isThisYear(date)) {
    return 'M月d日(E)'
  }
  return 'yyyy年M月d日(E)'
}
