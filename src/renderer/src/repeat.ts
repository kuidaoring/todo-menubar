import { Repeat } from './types'

export function isMonthly(repeat?: Repeat) {
  return repeat?.type === 'monthly'
}
export function isWeekly(repeat?: Repeat) {
  return repeat?.type === 'weekly' && !isEveryday(repeat) && !isWeekdays(repeat)
}
export function isEveryday(repeat?: Repeat) {
  return repeat?.type === 'weekly' && repeat.dayOfWeeks.length === 7
}
export function isWeekdays(repeat?: Repeat) {
  return (
    repeat?.type === 'weekly' &&
    repeat.dayOfWeeks.length === 5 &&
    repeat.dayOfWeeks.every((day) => day.number !== 0 && day.number !== 6)
  )
}

export function hasRepeat(repeat?: Repeat) {
  return repeat?.type === 'monthly' || repeat?.type === 'weekly'
}

export function formatRepeat(repeat?: Repeat) {
  if (!repeat || repeat.type === 'none') {
    return 'なし'
  } else if (isEveryday(repeat)) {
    return '毎日'
  } else if (isWeekdays(repeat)) {
    return '平日'
  } else if (isWeekly(repeat) && repeat.type === 'weekly') {
    return `毎週 ${repeat.dayOfWeeks.map((day) => day.label).join('・')}`
  } else if (isMonthly(repeat)) {
    return `毎月 ${repeat.dayOfMonth}日`
  } else {
    return 'なし'
  }
}
