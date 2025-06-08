import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Custom404() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page after 5 seconds
    const timer = setTimeout(() => {
      router.push('/')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
          <br />
          You will be redirected to the home page in 5 seconds.
        </p>
        <Link 
          href="/"
          className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
} 