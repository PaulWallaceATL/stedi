-- Supabase Schema for Clinix AI Billing App
-- Run this in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Claims table
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_name TEXT,
    payer_name TEXT,
    trading_partner_name TEXT,
    trading_partner_service_id TEXT,
    status TEXT,
    claim_charge_amount NUMERIC,
    total_charge NUMERIC,
    date_of_service TIMESTAMP,
    service_line_count INTEGER,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claim events table
CREATE TABLE IF NOT EXISTS public.claim_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
    type TEXT,
    transaction_id TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON public.claims(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claim_events_claim_id ON public.claim_events(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_events_created_at ON public.claim_events(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own claims
CREATE POLICY "Users can view own claims"
    ON public.claims FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own claims
CREATE POLICY "Users can insert own claims"
    ON public.claims FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own claims
CREATE POLICY "Users can update own claims"
    ON public.claims FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can view events for their own claims
CREATE POLICY "Users can view own claim events"
    ON public.claim_events FOR SELECT
    USING (
        claim_id IN (
            SELECT id FROM public.claims WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can insert events for their own claims
CREATE POLICY "Users can insert own claim events"
    ON public.claim_events FOR INSERT
    WITH CHECK (
        claim_id IN (
            SELECT id FROM public.claims WHERE user_id = auth.uid()
        )
    );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_claims_updated_at
    BEFORE UPDATE ON public.claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
