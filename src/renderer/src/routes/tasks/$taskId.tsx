import { formatDate, getFormatString } from '@renderer/formatDate'
import type { Repeat, SearchFilterOptions } from '@renderer/types'
import {
  QueryErrorResetBoundary,
  queryOptions,
  useMutation,
  useSuspenseQuery
} from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { isBefore } from 'date-fns/isBefore'
import { startOfToday } from 'date-fns/startOfToday'
import React, { createRef, forwardRef, useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ja } from 'date-fns/locale'
import { DetailRepeat } from '@renderer/components/DetailRepeat'
import { ErrorBoundary } from 'react-error-boundary'

type SearchParams = {
  filter: SearchFilterOptions
}

function buildGetTaskQueryOptions(taskId: string, filter: SearchFilterOptions) {
  return queryOptions({
    queryKey: ['tasks', { filter: filter }, { id: taskId }],
    queryFn: async () => window.api.getTask(taskId)
  })
}

export const Route = createFileRoute('/tasks/$taskId')({
  validateSearch: (search): SearchParams => {
    return {
      filter: (search.filter as SearchFilterOptions) || 'all'
    }
  },
  component: Task,
  loaderDeps: ({ search: { filter } }) => {
    return { filter }
  },
  loader: ({ params, deps: { filter }, context: { queryClient } }) => {
    return queryClient.ensureQueryData(buildGetTaskQueryOptions(params.taskId, filter))
  }
})

function Task() {
  const { filter } = Route.useSearch()
  const { taskId } = Route.useParams()
  const query = useSuspenseQuery(buildGetTaskQueryOptions(taskId, filter))
  const navigate = useNavigate()

  const { queryClient } = Route.useRouteContext()

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => window.api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { filter: filter }]
      })
      navigate({ to: '/tasks', search: { filter: filter } })
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

  const [title, setTitle] = useState(query.data?.title)
  useEffect(() => {
    setTitle(query.data?.title)
  }, [taskId])
  const [isTitleEditing, setIsTitleEditing] = useState(false)
  const isImeOn = useRef(false)
  const titleInputRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (isTitleEditing) {
      titleInputRef.current?.focus()
    }
  }, [isTitleEditing])
  const updateTitleMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => window.api.updateTitle(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { filter: filter }]
      })
    }
  })

  const toggleStepCompletedMutation = useMutation({
    mutationFn: ({ id, stepId }: { id: string; stepId: string }) =>
      window.api.toggleStepCompleted(id, stepId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { filter: filter }]
      })
    }
  })

  const addStepFormRef = useRef<HTMLFormElement>(null)
  const addStepMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => window.api.addStep(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { filter: filter }]
      })
    }
  })

  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [stepTitle, setStepTitle] = useState('')
  const updateStepTitleMutation = useMutation({
    mutationFn: ({ id, stepId, title }: { id: string; stepId: string; title: string }) =>
      window.api.updateStepTitle(id, stepId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { filter: filter }]
      })
    }
  })
  const stepRefMap =
    query.data?.steps && query.data?.steps.length > 0
      ? Object.fromEntries(
          query.data?.steps?.map((step) => {
            return [step.id, createRef<HTMLTextAreaElement>()]
          })
        )
      : {}

  useEffect(() => {
    if (editingStepId) {
      stepRefMap[editingStepId]?.current?.focus()
    }
  }, [editingStepId])

  const deleteStepMutation = useMutation({
    mutationFn: ({ id, stepId }: { id: string; stepId: string }) =>
      window.api.deleteStep(id, stepId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { filter: filter }]
      })
    }
  })

  const toggleIsTodayMutation = useMutation({
    mutationFn: window.api.toggleIsToday,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { filter: filter }]
      })
    }
  })

  const updateDueDateMutation = useMutation({
    mutationFn: ({ id, dueDate }: { id: string; dueDate: Date | null }) =>
      window.api.updateDueDate(id, dueDate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { filter: filter }]
      })
    }
  })

  const DatePickerInput = forwardRef<HTMLButtonElement, JSX.IntrinsicElements['button']>(
    ({ value, onClick, className }, ref) => {
      return (
        <button className={className} onClick={onClick} ref={ref}>
          🗓 {value ? value : '期限を設定'}
        </button>
      )
    }
  )
  const dueDateColorClass = !query.data?.dueDate
    ? ''
    : isBefore(query.data?.dueDate, startOfToday())
      ? 'text-red-500'
      : 'text-blue-500'

  const updateRepeatMutation = useMutation({
    mutationFn: ({ id, repeat }: { id: string; repeat: Repeat | null }) => {
      return window.api.updateRepeat(id, repeat)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { filter: filter }]
      })
    }
  })

  const updateMemoMutation = useMutation({
    mutationFn: ({ id, memo }: { id: string; memo: string | null }) =>
      window.api.updateMemo(id, memo),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { filter: filter }]
      })
    }
  })

  const [memo, setMemo] = useState(query.data?.memo || '')
  const [memoDebounceTimer, setMemoDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const startDebounceMemoUpdate = (value: string) => {
    if (!query.data) {
      return
    }
    const id = query.data.id
    if (memoDebounceTimer) {
      clearTimeout(memoDebounceTimer)
    }
    setMemo(value)
    setMemoDebounceTimer(
      setTimeout(() => {
        updateMemoMutation.mutate({ id: id, memo: value })
      }, 500)
    )
  }
  useEffect(() => {
    setMemo(query.data?.memo || '')
  }, [taskId])

  return (
    <div className={`w-80 flex flex-col h-[calc(100dvh-1.5rem)]`}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={() => (
              <>
                <div className="flex flex-row m-1 px-2 text-xs text-gray-500">
                  <Link to="/tasks" search={{ filter: filter }} className="pr-3" title="閉じる">
                    ✗
                  </Link>
                </div>
                <div className="overflow-scroll">
                  <p>エラーが発生しました</p>
                </div>
              </>
            )}
          >
            <React.Suspense
              fallback={
                <>
                  <div className="flex flex-row m-1 px-2 text-xs text-gray-500">
                    <Link to="/tasks" search={{ filter: filter }} className="pr-3" title="閉じる">
                      ✗
                    </Link>
                  </div>
                  <div className="overflow-scroll">
                    <p>ローディング中</p>
                  </div>
                </>
              }
            >
              <div className="flex flex-row m-1 px-2 text-xs text-gray-500">
                <Link to="/tasks" search={{ filter: filter }} className="pr-3" title="閉じる">
                  ✗
                </Link>
                <p className=" text-center flex-1">{formatDate(query.data?.createdAt)} 作成</p>
                <button
                  onClick={() => {
                    confirm('タスクを削除しますか？') &&
                      query.data &&
                      deleteTaskMutation.mutate(query.data.id)
                  }}
                >
                  🗑
                </button>
              </div>
              <div className="overflow-scroll">
                <div className="flex items-center group mr-1 p-1.5 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    className="w-4 border-gray-300 rounded mt-0.5 text-blue-600 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
                    checked={query.data?.completed || false}
                    onChange={() => {
                      query.data && toggleCompletedMutation.mutate(query.data?.id)
                    }}
                  />
                  <h3
                    className={`w-full p-1 ms-3 text-lg break-all group-has-[:checked]:text-gray-300 group-has-[:checked]:line-through ${isTitleEditing ? 'hidden' : ''}`}
                    onClick={() => {
                      setIsTitleEditing(true)
                      setTitle(query.data?.title)
                    }}
                  >
                    {query.data?.title}
                  </h3>
                  <textarea
                    className={`detailTitleTextArea w-full p-1 ms-3 mb-[-1px] text-lg rounded-lg border focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50  ${isTitleEditing ? '' : 'hidden'} resize-none`}
                    value={title}
                    rows={1}
                    onCompositionStart={() => (isImeOn.current = true)}
                    onCompositionEnd={() => (isImeOn.current = false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isImeOn.current) {
                        e.preventDefault()
                        setIsTitleEditing(false)
                        if (!query.data || !title || title.match(/^\s*$/)) {
                          return
                        }
                        updateTitleMutation.mutate({ id: query.data.id, title })
                      }
                    }}
                    onChange={(e) => {
                      setTitle(e.target.value)
                    }}
                    onBlur={() => {
                      setIsTitleEditing(false)
                    }}
                    ref={titleInputRef}
                    name="title"
                  />
                </div>
                <div className="ml-3">
                  {query.data?.steps?.map((step) => {
                    return (
                      <div
                        key={step.id}
                        className="flex items-center group p-1 mx-2 rounded-lg hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          className="w-4 border-gray-300 rounded mt-0.5 text-blue-600 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
                          checked={step.completed || false}
                          onChange={() =>
                            query.data &&
                            toggleStepCompletedMutation.mutate({
                              id: query.data.id,
                              stepId: step.id
                            })
                          }
                        />
                        <p
                          className={`w-full p-1 ms-3 text-sm break-all group-has-[:checked]:text-gray-300 group-has-[:checked]:line-through ${editingStepId === step.id ? 'hidden' : ''}`}
                          onClick={() => {
                            setEditingStepId(step.id)
                            setStepTitle(step.title)
                          }}
                        >
                          {step.title}
                        </p>
                        <textarea
                          className={`stepTitleTextArea w-full p-1 ms-3 mb-[-1px] text-sm rounded-lg border focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50  ${editingStepId === step.id ? '' : 'hidden'} resize-none`}
                          value={stepTitle}
                          rows={1}
                          onCompositionStart={() => (isImeOn.current = true)}
                          onCompositionEnd={() => (isImeOn.current = false)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isImeOn.current) {
                              e.preventDefault()
                              setEditingStepId(null)
                              if (!query.data || stepTitle.match(/^\s*$/)) {
                                return
                              }
                              updateStepTitleMutation.mutate({
                                id: query.data?.id,
                                stepId: step.id,
                                title: stepTitle
                              })
                            }
                          }}
                          onChange={(e) => {
                            setStepTitle(e.target.value)
                          }}
                          onBlur={() => {
                            setEditingStepId(null)
                          }}
                          ref={stepRefMap[step.id]}
                        />
                        <button
                          className="text-xs invisible group-hover:visible"
                          onClick={() => {
                            confirm('ステップを削除しますか？') &&
                              query.data &&
                              deleteStepMutation.mutate({ id: query.data.id, stepId: step.id })
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    )
                  })}
                  <form
                    ref={addStepFormRef}
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.target as HTMLFormElement)
                      const stepTitle = formData.get('stepTitle') as string
                      if (!query.data || stepTitle.match(/^\s*$/)) {
                        return
                      }
                      addStepMutation.mutate({ id: query.data.id, title: stepTitle })
                      addStepFormRef.current?.reset()
                    }}
                  >
                    <div className="relative m-2 rounded-lg">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <button className="text-gray-500">➕</button>
                      </div>
                      <input
                        type="text"
                        name="stepTitle"
                        className="block w-full text-sm rounded-lg border border-gray-200 py-1.5 pl-10 pr-5 ring-inset ring-gray-200 placeholder:text-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="ステップの追加"
                      />
                    </div>
                  </form>
                </div>
                <div className="py-3 flex-1 flex flex-col">
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex gap-x-3.5 py-2 px-2.5 rounded-lg hover:bg-gray-100">
                      <label className="cursor-pointer group w-full">
                        <div className="group-has-[:checked]:text-blue-500">
                          <span>⚡ 今日の予定に設定</span>
                          <span className="group-has-[:checked]:inline hidden">しました</span>
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={query.data?.isToday}
                          onChange={() => {
                            query.data && toggleIsTodayMutation.mutate(query.data.id)
                          }}
                        />
                      </label>
                    </li>
                    <li className="flex gap-x-3.5 py-2 px-2.5 rounded-lg hover:bg-gray-100">
                      <DatePicker
                        className={`border-none w-60 text-left ${dueDateColorClass}`}
                        placeholderText="🗓 期限を設定"
                        customInput={<DatePickerInput />}
                        isClearable
                        selected={query.data?.dueDate}
                        dateFormat={getFormatString(query.data?.dueDate)}
                        locale={ja}
                        onChange={(date) => {
                          query.data &&
                            updateDueDateMutation.mutate({ id: query.data.id, dueDate: date })
                        }}
                      />
                    </li>
                    <li className="flex gap-x-3.5 py-2 px-2.5 rounded-lg hover:bg-gray-100">
                      <DetailRepeat
                        key={query.data?.id}
                        repeat={query.data?.repeat}
                        onSubmit={(repeat) => {
                          query.data && updateRepeatMutation.mutate({ id: query.data.id, repeat })
                        }}
                      />
                    </li>
                  </ul>
                  <textarea
                    placeholder="メモを追加"
                    className="m-1 px-4 text-sm rounded-lg min-h-60 border border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    value={memo}
                    onChange={(e) => {
                      startDebounceMemoUpdate(e.target.value)
                    }}
                  />
                </div>
              </div>
            </React.Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  )
}
