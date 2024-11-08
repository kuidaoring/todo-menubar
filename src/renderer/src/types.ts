export type Task = Awaited<ReturnType<typeof window.api.getTasks>>[0]

export type SearchFilterOptions = 'today' | 'all' | 'planned' | 'notToday'
