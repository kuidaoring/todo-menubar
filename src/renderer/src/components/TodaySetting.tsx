import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import ListItem from './ListItem'

function TodaySetting() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button onClick={() => setIsOpen(true)}>🖊 今日のタスクを設定</button>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

export default TodaySetting

type DialogProps = {
  isOpen: boolean
  onClose: () => void
}
function Dialog({ isOpen, onClose }: DialogProps) {
  const query = useQuery({
    queryKey: ['tasks', { filter: 'notToday' }],
    queryFn: async () => window.api.getTasks('notToday'),
    enabled: isOpen
  })
  const dialogRef = useRef<HTMLDialogElement>(null)
  if (isOpen) {
    dialogRef.current?.showModal()
  } else {
    dialogRef.current?.close()
  }
  const queryClient = useQueryClient()

  const toggleIsTodayMutation = useMutation({
    mutationFn: window.api.toggleIsToday,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks']
      })
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

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg p-3"
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose()
        }
      }}
    >
      <div className="text-gray-700 text-sm flex flex-col h-[80dvh] w-[50dvw]">
        <h3 className="p-2 text-xl">🖊 今日のタスクを設定</h3>
        <div className="p-1 flex-1 overflow-scroll flex flex-col">
          {query.data?.length === 0 && (
            <p className="text-center mt-auto mb-auto">⚡ タスクはありません</p>
          )}
          {query.data &&
            query.data.length > 0 &&
            query.data?.map((task) => {
              return (
                <div key={task.id} className="my-1">
                  <ListItem
                    task={task}
                    onChange={() => {
                      toggleCompletedMutation.mutate(task.id)
                    }}
                    diableLink
                  >
                    <button onClick={() => toggleIsTodayMutation.mutate(task.id)}>➕</button>
                  </ListItem>
                </div>
              )
            })}
        </div>
        <div className="flex space-x-5 justify-center">
          <button
            className="w-20 border border-gray-200 bg-white text-gray-700 px-3 py-1.5 rounded-lg"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </dialog>
  )
}
