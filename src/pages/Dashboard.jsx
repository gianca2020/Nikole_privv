import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ArticleForm from '../components/ArticleForm'
// Intentionally empty dashboard page.
// The app imports this route — export a minimal component that renders nothing
// (per your request: don't add content or navigation here).
const Dashboard = () => {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/')
    }

    return (
        <>
            <button
                onClick={handleLogout}
                className="absolute top-4 right-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition"
            >
                Logout
            </button>
            <ArticleForm />
        </>
    )
}

export default Dashboard
