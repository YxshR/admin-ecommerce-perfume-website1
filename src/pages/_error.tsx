import { NextPageContext } from 'next'
import Link from 'next/link'

interface ErrorProps {
  statusCode: number | null
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold mb-4">{statusCode || 'Error'}</h1>
        <h2 className="text-2xl font-semibold mb-6">
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : 'An error occurred on client'}
        </h2>
        <p className="text-gray-600 mb-8">
          We apologize for the inconvenience. Please try again later.
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

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error 