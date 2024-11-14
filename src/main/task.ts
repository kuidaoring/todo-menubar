import {
  addMonths,
  getMonth,
  lastDayOfMonth,
  nextDay,
  setDate,
  startOfToday,
  startOfTomorrow,
  startOfYesterday
} from 'date-fns'
import crypt from 'crypto'

export type Task = {
  id: string
  title: string
  completed: boolean
  isToday: boolean
  dueDate?: Date | null
  memo?: string | null
  steps?: Step[]
  createdAt: Date
  repeat?: Repeat
  repeatCreated: boolean
}

export type Step = {
  id: string
  title: string
  completed: boolean
}

export type Repeat = RepeatWeekly | RepeatMonthly | RepeatNone

type RepeatWeekly = {
  type: 'weekly'
  dayOfWeeks: DayOfWeek[]
}

export const SUNDAY = { number: 0, label: '日' } as const
export const MONDAY = { number: 1, label: '月' } as const
export const TUESDAY = { number: 2, label: '火' } as const
export const WEDNESDAY = { number: 3, label: '水' } as const
export const THURSDAY = { number: 4, label: '木' } as const
export const FRIDAY = { number: 5, label: '金' } as const
export const SATURDAY = { number: 6, label: '土' } as const

type DayOfWeek =
  | typeof SUNDAY
  | typeof MONDAY
  | typeof TUESDAY
  | typeof WEDNESDAY
  | typeof THURSDAY
  | typeof FRIDAY
  | typeof SATURDAY

export const DAY_OF_WEEK_MAP = {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY
} as const
export const DAY_OF_WEEKS = [
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY
] as const

type RepeatMonthly = {
  type: 'monthly'
  dayOfMonth: number
}

type RepeatNone = {
  type: 'none'
}

export const REPEAT_NONE: RepeatNone = {
  type: 'none'
}

export const REPEAT_DAILY: RepeatWeekly = {
  type: 'weekly',
  dayOfWeeks: [SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY]
}

export const REPEAT_WEEKDAYS: RepeatWeekly = {
  type: 'weekly',
  dayOfWeeks: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY]
}

const tasks: Task[] = []

createTask({
  title: 'task 1',
  completed: false,
  isToday: true,
  memo: 'memoA',
  steps: [
    { id: crypt.randomUUID(), title: 'step1', completed: false },
    { id: crypt.randomUUID(), title: 'step2', completed: true }
  ],
  createdAt: new Date('2023-12-31')
})
createTask({
  title: 'task 1',
  completed: false,
  isToday: true,
  memo: 'memoA',
  steps: [
    { id: crypt.randomUUID(), title: 'step1', completed: false },
    { id: crypt.randomUUID(), title: 'step2', completed: true }
  ],
  createdAt: new Date('2023-12-31')
})
createTask({
  title: 'task 2',
  completed: true,
  isToday: true,
  memo: 'memoB',
  createdAt: new Date(),
  repeat: {
    type: 'none'
  }
})
createTask({
  title: 'task 3',
  completed: false,
  isToday: true,
  createdAt: new Date(),
  repeat: REPEAT_DAILY
})
createTask({
  title: 'task 4',
  completed: true,
  isToday: true,
  createdAt: new Date(),
  repeat: REPEAT_WEEKDAYS
})
createTask({
  title: 'task 5',
  completed: false,
  isToday: false,
  createdAt: new Date(),
  repeat: {
    type: 'weekly',
    dayOfWeeks: [SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY]
  }
})
createTask({
  title: 'task 6',
  completed: true,
  isToday: false,
  dueDate: startOfYesterday(),
  createdAt: new Date(),
  repeat: {
    type: 'monthly',
    dayOfMonth: 10
  }
})
createTask({
  title: 'task 7',
  completed: false,
  isToday: false,
  dueDate: startOfTomorrow(),
  createdAt: new Date()
})
createTask({
  title: 'task 8',
  completed: true,
  isToday: false,
  dueDate: startOfToday(),
  createdAt: new Date()
})
createTask({
  title: 'task 9',
  completed: false,
  isToday: false,
  dueDate: new Date('2024-01-01'),
  createdAt: new Date()
})

export async function getTask(id: string): Promise<Task | null> {
  return tasks.find((task) => task.id === id) || null
}

export async function getTasks(filter: string): Promise<Task[]> {
  if (filter === 'today') {
    return tasks.filter((task) => task.isToday)
  }
  if (filter === 'planned') {
    return tasks.filter((task) => task.dueDate)
  }
  if (filter === 'notToday') {
    return tasks.filter((task) => !task.isToday && !task.completed)
  }
  return tasks
}

export async function addTask(title: string, isToday: boolean): Promise<Task> {
  return createTask({ title, isToday })
}

function createTask(task: {
  title: string
  completed?: boolean
  isToday?: boolean
  dueDate?: Date | null
  memo?: string | null
  steps?: Step[]
  createdAt?: Date
  repeat?: Repeat
}): Task {
  const newTask = {
    id: crypt.randomUUID(),
    isToday: task.isToday || false,
    completed: task.completed || false,
    createdAt: new Date(),
    repeatCreated: false,
    ...task
  }
  tasks.unshift(newTask)
  return newTask
}

function addRepeatNextTask(task: Task): Task | null {
  if (!task.repeat || task.repeat.type === 'none' || task.repeatCreated) {
    return null
  }

  const nextDueDate = getWeeklyNextDueDate(task) || getMonthlyNextDueDate(task)
  const repeat = structuredClone(task.repeat)
  const steps = task.steps ? structuredClone(task.steps) : []
  steps.forEach((step) => {
    step.id = crypt.randomUUID()
    step.completed = false
  })
  const nextTask = createTask({
    title: task.title,
    memo: task.memo,
    repeat,
    steps,
    dueDate: nextDueDate
  })
  task.repeatCreated = true
  return nextTask
}

function getWeeklyNextDueDate(task: Task): Date | null {
  if (!task.repeat || task.repeat.type !== 'weekly' || task.repeat.dayOfWeeks.length < 1) {
    return null
  }
  const baseDueDate = task.dueDate || new Date()
  let nextDueDateDay = task.repeat.dayOfWeeks.find(
    (dayOfWeek) => dayOfWeek.number > baseDueDate.getDay()
  )
  if (!nextDueDateDay) {
    nextDueDateDay = task.repeat.dayOfWeeks[0]
  }
  return nextDay(baseDueDate, nextDueDateDay.number)
}

function getMonthlyNextDueDate(task: Task): Date | null {
  if (!task.repeat || task.repeat.type !== 'monthly') {
    return null
  }
  const baseDueDate = task.dueDate || new Date()
  let nextDueDate = setDate(addMonths(baseDueDate, 1), task.repeat.dayOfMonth)
  if (getMonth(nextDueDate) !== getMonth(addMonths(baseDueDate, 1))) {
    nextDueDate = lastDayOfMonth(addMonths(baseDueDate, 1))
  }
  return nextDueDate
}

export async function deleteTask(id: string): Promise<void> {
  const index = tasks.findIndex((task) => task.id === id)
  if (index !== -1) {
    tasks.splice(index, 1)
  }
}

export async function toggleCompleted(id: string): Promise<Task | null> {
  const task = tasks.find((task) => task.id === id)
  if (!task) {
    return null
  }
  if (!task.completed) {
    addRepeatNextTask(task)
  }
  task.completed = !task.completed
  return task
}

export async function toggleIsToday(id: string): Promise<Task | null> {
  const task = tasks.find((task) => task.id === id)
  if (!task) {
    return null
  }
  task.isToday = !task.isToday
  return task
}

export async function updateDueDate(id: string, dueDate: Date | null): Promise<Task | null> {
  const task = tasks.find((task) => task.id === id)
  if (!task) {
    return null
  }
  task.dueDate = dueDate
  return task
}

export async function updateRepeat(id: string, repeat: Repeat | null): Promise<Task | null> {
  const task = tasks.find((task) => task.id === id)
  if (!task) {
    return null
  }
  if (!repeat) {
    repeat = REPEAT_NONE
  }
  task.repeat = repeat
  return task
}

export async function updateMemo(id: string, memo: string | null): Promise<Task | null> {
  const task = tasks.find((task) => task.id === id)
  if (!task) {
    return null
  }
  task.memo = memo
  return task
}

export async function updateTitle(id: string, title: string): Promise<Task | null> {
  const task = tasks.find((task) => task.id === id)
  if (!task) {
    return null
  }
  task.title = title
  return task
}

export async function toggleStepCompleted(taskId: string, stepId: string): Promise<Task | null> {
  const task = tasks.find((task) => task.id === taskId)
  if (!task) {
    return null
  }
  const step = task.steps?.find((step) => step.id === stepId)
  if (!step) {
    return task
  }
  step.completed = !step.completed
  return task
}

export async function addStep(taskId: string, title: string): Promise<Task | null> {
  const task = tasks.find((task) => task.id === taskId)
  if (!task) {
    return null
  }
  const step: Step = { id: crypt.randomUUID(), title, completed: false }
  if (!task.steps) {
    task.steps = []
  }
  task.steps.push(step)
  return task
}

export async function deleteStep(taskId: string, stepId: string): Promise<Task | null> {
  const task = tasks.find((task) => task.id === taskId)
  if (!task) {
    return null
  }
  if (!task.steps) {
    return null
  }
  const index = task.steps.findIndex((step) => step.id === stepId)
  if (index !== -1) {
    task.steps?.splice(index, 1)
  }
  return task
}

export async function updateStepTitle(
  taskId: string,
  stepId: string,
  title: string
): Promise<Task | null> {
  const task = tasks.find((task) => task.id === taskId)
  if (!task) {
    return null
  }
  const step = task.steps?.find((step) => step.id === stepId)
  if (!step) {
    return task
  }
  step.title = title
  return task
}
