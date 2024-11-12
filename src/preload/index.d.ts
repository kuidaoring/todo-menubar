import { ElectronAPI } from '@electron-toolkit/preload'
import { DAY_OF_WEEKS, Task } from '../main/task'
import {
  DAY_OF_WEEK_MAP,
  DAY_OF_WEEKS,
  REPEAT_NONE,
  REPEAT_DAILY,
  REPEAT_WEEKDAYS
} from '../main/task'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getTask: (id: string) => Promise<Task | null>
      getTasks: (filter: string) => Promise<Task[]>
      addTask: (title: string, isToday: boolean) => Promise<Task>
      deleteTask: (id: string) => void
      toggleCompleted: (id: string) => Promise<Task | null>
      toggleIsToday: (id: string) => Promise<Task | null>
      updateDueDate: (id: string, dueDate: Date | null) => Promise<Task | null>
      updateRepeat: (id: string, repeat: Repeat | null) => Promise<Task | null>
      updateMemo: (id: string, memo: string | null) => Promise<Task | null>
      updateTitle: (id: string, title: string) => Promise<Task | null>
      toggleStepCompleted: (id: string, stepId: string) => Promise<Task | null>
      addStep: (id: string, title: string) => Promise<Task | null>
      deleteStep: (id: string, stepId: string) => Promise<Task | null>
      updateStepTitle: (id: string, stepId: string, title: string) => Promise<Task | null>
    }
    constants: {
      repeat: {
        DAY_OF_WEEK_MAP: typeof DAY_OF_WEEK_MAP
        DAY_OF_WEEKS: typeof DAY_OF_WEEKS
        REPEAT_NONE: typeof REPEAT_NONE
        REPEAT_DAILY: typeof REPEAT_DAILY
        REPEAT_WEEKDAYS: typeof REPEAT_WEEKDAYS
      }
    }
  }
}
