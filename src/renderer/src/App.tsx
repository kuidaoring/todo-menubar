import { useRef, useState } from 'react'
import ListItem from './components/ListItem'
import Sidebar from './components/Sidebar'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'

function App(): JSX.Element {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <Index />
    </QueryClientProvider>
  )
}

function Index() {
  const query = useQuery({ queryKey: ['tasks'], queryFn: window.api.getTasks })
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLFormElement>(null)
  const addTaskMutation = useMutation({
    mutationFn: window.api.addTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks']
      })
      formRef.current?.reset()
    }
  })
  const toggleCompletedMutation = useMutation({
    mutationFn: window.api.toggleCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks']
      })
    }
  })

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskID] = useState<number | null>(null)

  return (
    <div className="h-dvh flex flex-col text-gray-700 text-sm">
      <div id="appTitleBar" className="w-full h-6" />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex flex-col grow h-[calc(100dvh-1.5rem)]">
          <h2 className="p-2 text-xl ">🚀 全てのタスク</h2>
          <div className="p-1 flex-1 overflow-scroll">
            {query.data?.map((task) => {
              return (
                <div key={task.id} className="my-1">
                  <ListItem
                    title={task.title}
                    completed={task.completed}
                    selected={task.id === selectedTaskId}
                    onClick={() => {
                      setDetailOpen(true)
                      setSelectedTaskID(task.id)
                    }}
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
        <div
          className={`w-80 flex flex-col h-[calc(100dvh-1.5rem)] ${detailOpen ? 'block' : 'hidden'}`}
        >
          <div className="flex flex-row-reverse">
            <button className="pr-3" title="閉じる" onClick={() => setDetailOpen(false)}>
              ✗
            </button>
          </div>
          <div className="flex items-center group p-1">
            <input
              type="checkbox"
              className="w-4 border-gray-300 rounded mt-0.5 text-blue-600 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
              checked={query.data?.find((task) => task.id === selectedTaskId)?.completed || false}
              onChange={() => selectedTaskId && toggleCompletedMutation.mutate(selectedTaskId)}
            />
            <h3 className="w-full ms-3 text-lg group-has-[:checked]:text-gray-300 group-has-[:checked]:line-through">
              {query.data?.find((task) => task.id === selectedTaskId)?.title}
            </h3>
          </div>
          <div className="py-3 flex-1 overflow-scroll flex flex-col">
            <ul className="space-y-1.5 text-sm">
              <li className="flex gap-x-3.5 py-2 px-2.5 rounded-lg ">
                <label className="cursor-pointer group w-full">
                  <div className="group-has-[:checked]:text-blue-500">
                    <span>⚡ 今日の予定に設定</span>
                    <span className="group-has-[:checked]:inline hidden">しました</span>
                  </div>
                  <input type="checkbox" className="sr-only" />
                </label>
              </li>
              <li className="flex gap-x-3.5 py-2 px-2.5 rounded-lg ">
                <label className="cursor-pointer group w-full">
                  <div className="group-has-[:checked]:text-blue-500">
                    <span>🗓 期限を設定</span>
                    <span className="group-has-[:checked]:inline hidden">しました</span>
                  </div>
                  <input type="checkbox" className="sr-only" />
                </label>
              </li>
              <li className="flex gap-x-3.5 py-2 px-2.5 rounded-lg ">
                <label className="cursor-pointer group w-full">
                  <div className="group-has-[:checked]:text-blue-500">
                    <span>🔁 繰り返しを設定</span>
                    <span className="group-has-[:checked]:inline hidden">しました</span>
                  </div>
                  <input type="checkbox" className="sr-only" />
                </label>
              </li>
            </ul>
            <textarea
              placeholder="メモを追加"
              className="m-1 px-4 text-sm rounded-lg min-h-60 border border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
