import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ArticleForm from '../components/ArticleForm'

const Dashboard = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check authentication
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session) {
                navigate('/')
            } else {
                setLoading(false)
            }
        }

        checkAuth()

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                navigate('/')
            }
        })

        return () => subscription.unsubscribe()
    }, [navigate])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/')
    }

    if (loading) {
        return <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
            <p className="text-[#F6F1E8]">Loading...</p>
        </div>
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
