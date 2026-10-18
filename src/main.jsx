import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import { ConfirmProvider } from './components/ConfirmDialog'
import Login from './pages/Login'
import Home from './pages/Home'
import ArticleList from './pages/ArticleList'
import ArticleEdit from './pages/ArticleEdit'
import CreativeList from './pages/CreativeList'
import CreativeEdit from './pages/CreativeEdit'
import SiteContent from './pages/SiteContent'
import RequireAuth from './components/RequireAuth'
import Layout from './components/Layout'

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
          { index: true, element: <Home /> },
          { path: 'articles', element: <ArticleList /> },
          { path: 'articles/new', element: <ArticleEdit /> },
          { path: 'articles/:id/edit', element: <ArticleEdit /> },
          { path: 'creative', element: <CreativeList /> },
          { path: 'creative/new', element: <CreativeEdit /> },
          { path: 'creative/:id/edit', element: <CreativeEdit /> },
          { path: 'site', element: <SiteContent /> },
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
