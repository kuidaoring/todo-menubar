import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()
const router = createRouter({
  routeTree,
  context: {
    queryClient: queryClient
  }
})

declare module '@tanstack/react-router' {
  interface Register {
    routeTree: typeof router
  }
}

const rootElement = document.getElementById('root')
if (!rootElement?.innerHTML) {
  const root = ReactDOM.createRoot(rootElement as HTMLElement)
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>
  )
}
