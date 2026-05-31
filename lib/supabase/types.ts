// ============================================
// TYPES: Database Schema Types
// ============================================
export type Scan = {
  id: string
  user_id: string
  image_url: string
  crop_name: string
  disease_name: string
  confidence: number
  treatment: string
  is_healthy: boolean
  share_token: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      scans: {
        Row: Scan
        Insert: Omit<Scan, 'id' | 'created_at'>
        Update: Partial<Omit<Scan, 'id' | 'created_at' | 'user_id'>>
      }
    }
  }
}
