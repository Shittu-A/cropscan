import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// ============================================
// TYPES
// ============================================
interface SharePageProps {
  params: {
    token: string
  }
}

// ============================================
// COMPONENT
// ============================================
export default async function SharePage({ params }: SharePageProps) {
  const { token } = params
  
  const supabase = await createServerSupabaseClient()
  
  // Fetch scan by share token
  const { data: scan, error } = await supabase
    .from('scans')
    .select('*')
    .eq('share_token', token)
    .single()

  if (error || !scan) {
    notFound()
  }

  // Helper functions
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-emerald-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getStatusBadge = (isHealthy: boolean) => {
    if (isHealthy) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Healthy
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Disease Detected
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">CropScan</span>
          </Link>
          <Link 
            href="/auth"
            className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-emerald-800">
            <span className="font-medium">Shared result</span> — This crop scan was shared with you. 
            <Link href="/auth" className="underline ml-1">Create your own account</Link> to start scanning.
          </p>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan Result</h1>
        <p className="text-gray-500 text-sm mb-6">{formatDate(scan.created_at)}</p>

        {/* Image */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <img
            src={scan.image_url}
            alt={`${scan.crop_name} scan`}
            className="w-full h-48 sm:h-64 object-cover"
          />
        </div>

        {/* Result Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{scan.crop_name}</h2>
              <p className="text-lg text-gray-600">{scan.disease_name}</p>
            </div>
            {getStatusBadge(scan.is_healthy)}
          </div>

          {/* Confidence Meter */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Confidence</span>
              <span className="font-medium text-gray-900">{Math.round(scan.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getConfidenceColor(scan.confidence)}`}
                style={{ width: `${scan.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* Treatment */}
          {!scan.is_healthy && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Recommended Treatment</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{scan.treatment}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-emerald-600 rounded-2xl p-6 text-center text-white">
          <h3 className="text-lg font-semibold mb-2">Want to scan your own crops?</h3>
          <p className="text-emerald-100 mb-4">Join thousands of farmers using CropScan</p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 bg-white text-emerald-600 rounded-lg font-medium hover:bg-gray-100"
          >
            Create Free Account
          </Link>
        </div>
      </main>
    </div>
  )
}
