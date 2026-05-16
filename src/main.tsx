import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App' // Vite handles the .tsx extension automatically
import './index.css'   // This must stay to enable Tailwind styles

// Create a client for React Query to manage our server state
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevents unnecessary refetches when you switch browser tabs during dev
      refetchOnWindowFocus: false, 
      retry: 1,
      // Stale time helps keep the UI snappy
      staleTime: 1000 * 60 * 5, 
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)