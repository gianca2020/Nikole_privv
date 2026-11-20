import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import { ConfirmProvider } from './components/ConfirmDialog'
import Login from './pages/Login'
import ArticleEdit from './pages/ArticleEdit'
import CreativeEdit from './pages/CreativeEdit'
import RequireAuth from './components/RequireAuth'
import Layout from './components/Layout'

// The four section pages (Home, Articles, Creatives, Site Content) are pages of the notebook that
// Layout draws from the URL, so their routes have no element of their own. Editors are real
// route elements: Layout puts them on the loose sheet above the book.
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Login /> },
      {
        path: 'dashboard',
        element: <RequireAuth><Layout /></RequireAuth>,
        children: [
          { index: true },
          { path: 'articles' },
          { path: 'articles/new', element: <ArticleEdit /> },
          { path: 'articles/:id/edit', element: <ArticleEdit /> },
          { path: 'creative' },
          { path: 'creative/new', element: <CreativeEdit /> },
          { path: 'creative/:id/edit', element: <CreativeEdit /> },
          { path: 'site' },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <RouterProvider router={router} />
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
