'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Scan } from '@/lib/supabase/types'

// ============================================
// TYPES
// ============================================
interface ScanWithMeta extends Scan {
  formattedDate: string
}

// ============================================
// COMPONENT
// ============================================
export default function HistoryPage() {
  const [scans, setScans] = useState<ScanWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    fetchScans()
  }, [])

  const fetchScans = async () => {
    try {
      setLoading(true)
      
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedScans: ScanWithMeta[] = (data || []).map((scan: Scan) => ({
        ...scan,
        formattedDate: new Date(scan.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }))

      setScans(formattedScans)
    } catch (err) {
      setError('Failed to load scan history')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scan?')) return

    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', id)

      if (error) throw error

      setScans(scans.filter(scan => scan.id !== id))
    } catch (err) {
      alert('Failed to delete scan')
      console.error(err)
    }
  }

  const getStatusBadge = (isHealthy: boolean) => {
    if (isHealthy) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
          Healthy
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
        Disease
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              New Scan
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>
            <p className="text-gray-600 mt-1">
              {scans.length} {scans.length === 1 ? 'scan' : 'scans'} total
            </p>
          </div>
          <Link
            href="/scan"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Scan
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-emerald-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">Loading scans...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchScans}
              className="text-emerald-600 font-medium hover:text-emerald-700"
            >
              Try again
            </button>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scans yet</h3>
            <p className="text-gray-600 mb-6">Start by scanning your first crop</p>
            <Link
              href="/scan"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
            >
              Take Your First Scan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
                    <img
                      src={scan.image_url}
                      alt={`${scan.crop_name} scan`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusBadge(scan.is_healthy)}
                          <span className="text-sm text-gray-500">{scan.formattedDate}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {scan.crop_name}
                        </h3>
                        <p className="text-gray-600">{scan.disease_name}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-emerald-600">
                          {Math.round(scan.confidence * 100)}%
                        </span>
                        <p className="text-xs text-gray-500">confidence</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
                      <Link
                        href={`/scan/${scan.id}`}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        View Details →
                      </Link>
                      {scan.share_token && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/share/${scan.share_token}`)
                            alert('Share link copied!')
                          }}
                          className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                          Copy Link
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(scan.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700 ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
