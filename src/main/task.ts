import { startOfToday, startOfTomorrow, startOfYesterday } from 'date-fns'
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
}

export type Step = {
  id: string
  title: string
  completed: boolean
}

const tasks: Task[] = [
  {
    id: crypt.randomUUID(),
    title: 'task 1',
    completed: false,
    isToday: true,
    memo: 'memoA',
    steps: [
      { id: crypt.randomUUID(), title: 'step1', completed: false },
      { id: crypt.randomUUID(), title: 'step2', completed: true }
    ],
    createdAt: new Date('2023-12-31')
  },
  {
    id: crypt.randomUUID(),
    title: 'task 2',
    completed: true,
    isToday: true,
    memo: 'memoB',
    createdAt: new Date()
  },
  {
    id: crypt.randomUUID(),
    title: 'task 3',
    completed: false,
    isToday: true,
    createdAt: new Date()
  },
  {
    id: crypt.randomUUID(),
    title: 'task 4',
    completed: true,
    isToday: true,
    createdAt: new Date()
  },
  {
    id: crypt.randomUUID(),
    title: 'task 5',
    completed: false,
    isToday: false,
    createdAt: new Date()
  },
  {
    id: crypt.randomUUID(),
    title: 'task 6',
    completed: true,
    isToday: false,
    dueDate: startOfYesterday(),
    createdAt: new Date()
  },
  {
    id: crypt.randomUUID(),
    title: 'task 7',
    completed: false,
    isToday: false,
    dueDate: startOfTomorrow(),
    createdAt: new Date()
  },
  {
    id: crypt.randomUUID(),
    title: 'task 8',
    completed: true,
    isToday: false,
    dueDate: startOfToday(),
    createdAt: new Date()
  },
  {
    id: crypt.randomUUID(),
    title: 'task 9',
    completed: false,
    isToday: false,
    dueDate: new Date('2024-01-01'),
    createdAt: new Date()
  }
]

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
  const task: Task = {
    id: crypt.randomUUID(),
    title,
    completed: false,
    isToday,
    createdAt: new Date()
  }
  tasks.unshift(task)
  return task
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
