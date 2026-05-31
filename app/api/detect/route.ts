import { NextRequest, NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'
import { getTreatmentInfo } from '@/lib/treatments'

export const maxDuration = 60

const hf = new HfInference(process.env.HF_API_KEY)

const MODEL_ID = 'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification'

async function classifyWithRetry(data: Blob, retries = 3): Promise<ReturnType<typeof hf.imageClassification>> {
  for (let i = 0; i < retries; i++) {
    try {
      return await hf.imageClassification({ model: MODEL_ID, data })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      const isLoading = msg.toLowerCase().includes('loading') || msg.includes('503')
      if (isLoading && i < retries - 1) {
        await new Promise(r => setTimeout(r, 8000))
        continue
      }
      throw err
    }
  }
  throw new Error('Model unavailable after retries')
}

export interface DetectionResult {
  crop: string
  disease: string
  confidence: number
  treatment: string
  isHealthy: boolean
  preventions?: string[]
  rawLabel: string
  allPredictions: Array<{
    label: string
    score: number
  }>
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.HF_API_KEY) {
      return NextResponse.json(
        { error: 'HF_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Parse FormData
    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      )
    }

    // Convert file to Blob so HF SDK gets the correct content type
    const buffer = await imageFile.arrayBuffer()
    const blob = new Blob([buffer], { type: imageFile.type })

    // Call Hugging Face API (with retry for cold starts)
    const predictions = await classifyWithRetry(blob)

    // Sort by confidence (highest first)
    const sortedPredictions = predictions.sort((a, b) => b.score - a.score)
    const topPrediction = sortedPredictions[0]

    // Get treatment info
    const treatmentInfo = getTreatmentInfo(topPrediction.label)

    // Build result
    const result: DetectionResult = {
      crop: treatmentInfo.crop,
      disease: treatmentInfo.disease,
      confidence: Math.round(topPrediction.score * 100) / 100,
      treatment: treatmentInfo.treatment,
      isHealthy: treatmentInfo.isHealthy,
      preventions: treatmentInfo.preventions,
      rawLabel: topPrediction.label,
      allPredictions: sortedPredictions.slice(0, 5).map(p => ({
        label: p.label,
        score: Math.round(p.score * 100) / 100
      }))
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Detection error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { error: 'Failed to process image', details: errorMessage },
      { status: 500 }
    )
  }
}

// Handle GET request for health check
export async function GET() {
  return NextResponse.json({ status: 'ok', model: MODEL_ID })
}
