import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Scan } from '@/lib/supabase/types'

// ============================================
// TYPES
// ============================================
interface ScanResultPageProps {
  params: {
    id: string
  }
}

// ============================================
// COMPONENT
// ============================================
export default async function ScanResultPage({ params }: ScanResultPageProps) {
  const { id } = params
  
  const supabase = await createServerSupabaseClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view this scan</p>
          <Link 
            href={`/auth?redirect=/scan/${id}`}
            className="text-emerald-600 font-medium hover:text-emerald-700"
          >
            Sign in →
          </Link>
        </div>
      </div>
    )
  }

  // Fetch scan from database
  const { data: scan, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !scan) {
    notFound()
  }

  // Check ownership
  if (scan.user_id !== user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">You do not have permission to view this scan</p>
        </div>
      </div>
    )
  }

  const typedScan = scan as Scan

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
          <div className="flex items-center space-x-4">
            <Link 
              href="/scan" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              New Scan
            </Link>
            <Link 
              href="/history" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              History
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link 
          href="/history"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to History
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan Details</h1>
        <p className="text-gray-500 text-sm mb-6">{formatDate(typedScan.created_at)}</p>

        {/* Image */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <img
            src={typedScan.image_url}
            alt={`${typedScan.crop_name} scan`}
            className="w-full h-48 sm:h-64 object-cover"
          />
        </div>

        {/* Result Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{typedScan.crop_name}</h2>
              <p className="text-lg text-gray-600">{typedScan.disease_name}</p>
            </div>
            {getStatusBadge(typedScan.is_healthy)}
          </div>

          {/* Confidence Meter */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Confidence</span>
              <span className="font-medium text-gray-900">{Math.round(typedScan.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getConfidenceColor(typedScan.confidence)}`}
                style={{ width: `${typedScan.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* Treatment */}
          {!typedScan.is_healthy && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Recommended Treatment</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{typedScan.treatment}</p>
            </div>
          )}
        </div>

        {/* Share Link */}
        {typedScan.share_token && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Share this result</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={`${process.env.NEXT_PUBLIC_APP_URL || ''}/share/${typedScan.share_token}`}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/share/${typedScan.share_token}`)
                }}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <Link
            href="/scan"
            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 text-center"
          >
            New Scan
          </Link>
          <Link
            href="/history"
            className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 text-center"
          >
            View History
          </Link>
        </div>
      </main>
    </div>
  )
}
