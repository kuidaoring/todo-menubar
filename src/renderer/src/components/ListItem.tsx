import { formatDate } from '@renderer/formatDate'
import { Task } from '@renderer/types'
import { getRouteApi, Link } from '@tanstack/react-router'
import { isBefore } from 'date-fns/isBefore'
import { startOfToday } from 'date-fns/startOfToday'

type Props = {
  task: Task
  onChange: () => void
  diableLink?: boolean
  children?: React.ReactNode
}

const routeApi = getRouteApi('/tasks')

function ListItem({ task, onChange, diableLink, children }: Props) {
  const { filter } = routeApi.useSearch()

  const iconElements: JSX.Element[] = []
  if (filter !== 'today' && task.isToday) {
    iconElements.push(<span key={`${task.id}-today`}>⚡ 今日の予定</span>)
  }
  if (task.dueDate) {
    const dueDateColorClass = isBefore(task.dueDate, startOfToday()) ? 'text-red-500' : ''
    iconElements.push(
      <span key={`${task.id}-dueDate`} className={dueDateColorClass}>
        🗓 {formatDate(task.dueDate)}{' '}
      </span>
    )
  }
  if (true) {
    iconElements.push(<span key={`${task.id}-repeat`}>🔁</span>)
  }
  if (task.memo && task.memo.trim().length > 0) {
    iconElements.push(<span key={`${task.id}-memo`}>📝</span>)
  }
  if (task.steps && task.steps.length > 0) {
    const completedTaskCount = task.steps.filter((step) => step.completed).length
    const totalTaskCount = task.steps.length
    const icon = completedTaskCount === totalTaskCount ? '✅' : '🚗'
    iconElements.push(
      <span key={`${task.id}-sub`}>
        {icon} {completedTaskCount}/{totalTaskCount}
      </span>
    )
  }

  return (
    <div
      className="group flex items-center p-3  rounded-lg text-sm  hover:bg-gray-100  bg-white has-[a.active]:bg-gray-100"
      key={task.id}
    >
      <input
        type="checkbox"
        className="w-4 border-gray-300 rounded mt-0.5 text-blue-600 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
        checked={task.completed}
        onChange={onChange}
      />
      <Link
        to="/tasks/$taskId"
        params={{ taskId: task.id }}
        search={{ filter: filter }}
        className="w-full ms-3 group-has-[:checked]:text-gray-300"
        disabled={diableLink}
      >
        <span className="group-has-[:checked]:line-through">{task.title}</span>
        <div className="text-xs text-gray-500 group-has-[:checked]:text-gray-300">
          {iconElements
            .reduce<JSX.Element[]>((prev, curr, index) => {
              return [
                ...prev,
                <span key={`sep-${index}`} className="px-1.5">
                  •
                </span>,
                curr
              ]
            }, [])
            .slice(1)}
        </div>
      </Link>
      {children}
    </div>
  )
}

export default ListItem
