import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle, Loader2, AlertCircle, UserPlus } from 'lucide-react'

const LoginPage = () => {
  const { loading, isAuthenticated, error, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If authenticated, redirect to chat
    if (!loading && isAuthenticated) {
      console.log('User authenticated, redirecting to chat')
      // Small delay to ensure state is updated
      setTimeout(() => {
        navigate('/chat', { replace: true })
      }, 100)
    }
  }, [loading, isAuthenticated, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
          <p className="text-gray-600 mt-2">Initializing Keycloak</p>
        </div>
      </div>
    )
  }

  const handleRegister = async () => {
    try {
      await register()
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  // Keycloak will handle the login UI, so we just show a loading state
  // The user will be redirected to Keycloak login page automatically
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <MessageCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Chat App</h1>
        <p className="text-gray-600 mb-6">Redirecting to login...</p>
        
        <div className="space-y-3">
          <button
            onClick={handleRegister}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create New Account</span>
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          If you're not redirected, check the browser console for errors.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
