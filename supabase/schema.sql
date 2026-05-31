-- ============================================
-- CropScan Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SCANS TABLE
-- Stores all crop disease scan results
-- ============================================
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    treatment TEXT NOT NULL,
    is_healthy BOOLEAN NOT NULL DEFAULT false,
    share_token UUID DEFAULT uuid_generate_v4() UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Indexes for common queries
    CONSTRAINT scans_user_id_idx UNIQUE (id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_share_token ON public.scans(share_token);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on scans table
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own scans
CREATE POLICY "Users can view own scans"
    ON public.scans
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can only insert their own scans
CREATE POLICY "Users can insert own scans"
    ON public.scans
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own scans
CREATE POLICY "Users can update own scans"
    ON public.scans
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own scans
CREATE POLICY "Users can delete own scans"
    ON public.scans
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- OPTIONAL: SHARE TOKEN ACCESS POLICY
-- Uncomment when shared scan links feature is implemented
-- ============================================
/*
CREATE POLICY "Anyone can view shared scans via token"
    ON public.scans
    FOR SELECT
    USING (share_token IS NOT NULL);
*/

-- ============================================
-- REALTIME SUBSCRIPTIONS (Optional)
-- Enable realtime for scans table if needed
-- ============================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.scans;

-- ============================================
-- STORAGE BUCKET SETUP (Run separately in Storage)
-- ============================================
/*
1. Create a new bucket called 'scan-images'
2. Set bucket to 'private'
3. Add the following RLS policies for storage.objects:

-- Policy: Users can upload their own images
CREATE POLICY "Users can upload own scan images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'scan-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can view their own images
CREATE POLICY "Users can view own scan images"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'scan-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
*/
