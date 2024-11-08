import TodaySetting from '@renderer/components/TodaySetting'
import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: App
})

function App() {
  return (
    <>
      <div className="h-dvh flex flex-col text-gray-700 text-sm">
        <div id="appTitleBar" className="w-full h-6" />
        <div className="flex flex-1">
          <div className="p-3 w-64">
            <div className="relative mt-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <button className="text-gray-500">🔍</button>
              </div>
              <input
                type="text"
                className="block w-full text-sm rounded-lg border border-gray-200 py-1.5 pl-10 pr-5 ring-inset ring-gray-200 placeholder:text-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="検索"
              />
            </div>
            <nav className="p-3 w-full flex flex-col flex-wrap">
              <ul className="space-y-1.5 text-sm">
                <li>
                  <Link
                    to="/tasks"
                    search={{ filter: 'today' }}
                    className="flex gap-x-3.5 py-2 px-2.5 rounded-lg hover:bg-gray-100 [&.active]:bg-gray-100"
                  >
                    ⚡ 今日のタスク
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tasks"
                    search={{ filter: 'all' }}
                    className="flex gap-x-3.5 py-2 px-2.5 rounded-lg hover:bg-gray-100 [&.active]:bg-gray-100"
                  >
                    🚀 全てのタスク
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tasks"
                    search={{ filter: 'planned' }}
                    className="flex gap-x-3.5 py-2 px-2.5 rounded-lg hover:bg-gray-100 [&.active]:bg-gray-100"
                  >
                    🗓 期限付きのタスク
                  </Link>
                </li>
                <li>
                  <div className="flex gap-x-3.5 py-2 px-2.5 rounded-lg hover:bg-gray-100 [&.active]:bg-gray-100">
                    <TodaySetting />
                  </div>
                </li>
              </ul>
            </nav>
          </div>
          <Outlet />
        </div>
      </div>
      <TanStackRouterDevtools />
    </>
  )
}
