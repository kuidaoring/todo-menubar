import ListItem from '@renderer/components/ListItem'
import type { SearchFilterOptions } from '@renderer/types'
import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useRef } from 'react'

type SearchParams = {
  filter: SearchFilterOptions
}

const TITLE_MAP = {
  today: '⚡ 今日のタスク',
  all: '🚀 全てのタスク',
  planned: '🗓 期限付きのタスク'
} as const

function buildGetTaskQueryOptions(filter: SearchFilterOptions) {
  return queryOptions({
    queryKey: ['tasks', { filter: filter }],
    queryFn: async () => window.api.getTasks(filter)
  })
}

export const Route = createFileRoute('/tasks')({
  validateSearch: (search): SearchParams => {
    return {
      filter: (search.filter as SearchFilterOptions) || 'all'
    }
  },
  component: Index,
  loaderDeps: ({ search: { filter } }) => {
    return { filter }
  },
  loader: ({ context: { queryClient }, deps: { filter } }) => {
    queryClient.ensureQueryData(buildGetTaskQueryOptions(filter))
  }
})

function Index() {
  const { filter } = Route.useSearch()
  const query = useSuspenseQuery(buildGetTaskQueryOptions(filter))
  const { queryClient } = Route.useRouteContext()

  const formRef = useRef<HTMLFormElement>(null)

  const addTaskMutation = useMutation({
    mutationFn: (title: string) => {
      return window.api.addTask(title, filter === 'today')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { filter: filter }]
      })
      formRef.current?.reset()
    }
  })
  const toggleCompletedMutation = useMutation({
    mutationFn: window.api.toggleCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { filter: filter }]
      })
    }
  })

  const notCompletedTasks = query.data?.filter((task) => !task.completed)
  const completedTasks = query.data?.filter((task) => task.completed)

  return (
    <>
      <div className="flex flex-col grow h-[calc(100dvh-1.5rem)]">
        <h2 className="p-2 text-xl">{TITLE_MAP[filter]}</h2>
        <div className="p-1 flex-1 overflow-scroll">
          {notCompletedTasks.map((task) => {
            return (
              <div key={task.id} className="my-1">
                <ListItem
                  task={task}
                  onChange={() => {
                    toggleCompletedMutation.mutate(task.id)
                  }}
                />
              </div>
            )
          })}
          {completedTasks.length > 0 && (
            <h3 className="p-2 text-md border-b border-gray-50">✅ 完了済み</h3>
          )}
          {completedTasks.map((task) => {
            return (
              <div key={task.id} className="my-1">
                <ListItem
                  task={task}
                  onChange={() => {
                    toggleCompletedMutation.mutate(task.id)
                  }}
                />
              </div>
            )
          })}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            const title = formData.get('title') as string
            if (title.match(/^\s*$/)) {
              return
            }
            addTaskMutation.mutate(title)
          }}
          ref={formRef}
        >
          <div className="relative m-2 rounded-lg">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <button className="text-gray-500">➕</button>
            </div>
            <input
              type="text"
              name="title"
              className="block w-full text-sm rounded-lg border border-gray-200 py-1.5 pl-10 pr-5 ring-inset ring-gray-200 placeholder:text-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="タスクの追加"
            />
          </div>
        </form>
      </div>
      <Outlet />
    </>
  )
}
