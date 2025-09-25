import { SelectedProfileProvider } from "./lib/selectedProfile";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SelectedProfileProvider>
      <App />
    </SelectedProfileProvider>
  </QueryClientProvider>
);
