'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { DetectionResult } from '@/app/api/detect/route'
import { createClient } from '@/lib/supabase/client'

// ============================================
// TYPES
// ============================================
interface ScanState {
  step: 'upload' | 'preview' | 'scanning' | 'saving' | 'result'
  imageFile: File | null
  imagePreview: string | null
  result: DetectionResult | null
  savedScanId: string | null
  error: string | null
}

// ============================================
// COMPONENT
// ============================================
export default function ScanPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  
  const [state, setState] = useState<ScanState>({
    step: 'upload',
    imageFile: null,
    imagePreview: null,
    result: null,
    savedScanId: null,
    error: null
  })

  // Lazy initialization of Supabase client
  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setState(prev => ({ ...prev, error: 'Please select an image file' }))
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setState(prev => ({ ...prev, error: 'Image must be smaller than 10MB' }))
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setState(prev => ({
        ...prev,
        step: 'preview',
        imageFile: file,
        imagePreview: event.target?.result as string,
        error: null
      }))
    }
    reader.readAsDataURL(file)
  }, [])

  // Handle camera capture
  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  // Handle file upload click
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Reset to upload state
  const handleReset = () => {
    setState({
      step: 'upload',
      imageFile: null,
      imagePreview: null,
      result: null,
      savedScanId: null,
      error: null
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    const filePath = `${user.id}/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('scan-images')
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    const { data: { publicUrl } } = supabase.storage
      .from('scan-images')
      .getPublicUrl(filePath)
    
    return publicUrl
  }

  // Save scan to database
  const saveScan = async (result: DetectionResult, imageUrl: string): Promise<string> => {
    const response = await fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        crop_name: result.crop,
        disease_name: result.disease,
        confidence: result.confidence,
        treatment: result.treatment,
        is_healthy: result.isHealthy
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save scan')
    }

    const data = await response.json()
    return data.id
  }

  // Submit for detection and save
  const handleScan = async () => {
    if (!state.imageFile) return

    setState(prev => ({ ...prev, step: 'scanning', error: null }))

    try {
      // Step 1: Detect disease
      const formData = new FormData()
      formData.append('image', state.imageFile)

      const detectResponse = await fetch('/api/detect', {
        method: 'POST',
        body: formData
      })

      if (!detectResponse.ok) {
        const errorData = await detectResponse.json()
        throw new Error(errorData.error || 'Detection failed')
      }

      const result: DetectionResult = await detectResponse.json()
      
      // Step 2: Upload image to storage
      setState(prev => ({ ...prev, step: 'saving' }))
      const imageUrl = await uploadImage(state.imageFile)
      
      // Step 3: Save scan to database
      const scanId = await saveScan(result, imageUrl)
      
      setState(prev => ({
        ...prev,
        step: 'result',
        result,
        savedScanId: scanId
      }))

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze image'
      setState(prev => ({
        ...prev,
        step: 'preview',
        error: message
      }))
    }
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-emerald-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  // Get status badge
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
            href="/history" 
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            History
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Step */}
        {state.step === 'upload' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan Your Crop</h1>
            <p className="text-gray-600 mb-8">Take a photo or upload an image to detect diseases</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              {/* Camera Button */}
              <button
                onClick={handleCameraClick}
                className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                <svg className="h-12 w-12 text-emerald-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium text-gray-900">Take Photo</span>
                <span className="text-sm text-gray-500 mt-1">Use camera</span>
              </button>

              {/* Upload Button */}
              <button
                onClick={handleUploadClick}
                className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                <svg className="h-12 w-12 text-emerald-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-gray-900">Upload Image</span>
                <span className="text-sm text-gray-500 mt-1">From gallery</span>
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {state.error && (
              <p className="mt-4 text-red-600 text-sm">{state.error}</p>
            )}
          </div>
        )}

        {/* Preview Step */}
        {(state.step === 'preview' || state.step === 'scanning' || state.step === 'saving') && state.imagePreview && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Preview</h1>
            
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              <img
                src={state.imagePreview}
                alt="Selected crop"
                className="w-full h-64 sm:h-96 object-cover"
              />
            </div>

            {state.error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{state.error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                disabled={state.step === 'scanning' || state.step === 'saving'}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScan}
                disabled={state.step === 'scanning' || state.step === 'saving'}
                className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center"
              >
                {state.step === 'scanning' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : state.step === 'saving' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Analyze Image'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Result Step */}
        {state.step === 'result' && state.result && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Scan Result</h1>

            {/* Image */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              <img
                src={state.imagePreview!}
                alt="Scanned crop"
                className="w-full h-48 sm:h-64 object-cover"
              />
            </div>

            {/* Result Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{state.result.crop}</h2>
                  <p className="text-lg text-gray-600">{state.result.disease}</p>
                </div>
                {getStatusBadge(state.result.isHealthy)}
              </div>

              {/* Confidence Meter */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Confidence</span>
                  <span className="font-medium text-gray-900">{Math.round(state.result.confidence * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getConfidenceColor(state.result.confidence)}`}
                    style={{ width: `${state.result.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Treatment */}
              {!state.result.isHealthy && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Recommended Treatment</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{state.result.treatment}</p>
                </div>
              )}

              {/* Preventions */}
              {state.result.preventions && state.result.preventions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    {state.result.isHealthy ? 'Maintenance Tips' : 'Prevention'}
                  </h3>
                  <ul className="space-y-2">
                    {state.result.preventions.map((tip, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <svg className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Alternative Predictions */}
            {state.result.allPredictions && state.result.allPredictions.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Other Possibilities</h3>
                <div className="space-y-3">
                  {state.result.allPredictions.slice(1, 4).map((pred, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{pred.label.replace(/___/g, ' - ').replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium text-gray-900">{Math.round(pred.score * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
              >
                New Scan
              </button>
              {state.savedScanId && (
                <Link
                  href={`/scan/${state.savedScanId}`}
                  className="flex-1 py-3 px-4 bg-emerald-100 text-emerald-700 rounded-xl font-medium hover:bg-emerald-200 text-center"
                >
                  View Details
                </Link>
              )}
              <Link
                href="/history"
                className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 text-center"
              >
                View History
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
