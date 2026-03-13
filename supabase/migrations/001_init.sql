-- Migration: 001_init.sql
-- Description: CertChain Primary Database Schema matching the architecture blueprint.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. INSTITUTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    wallet_address TEXT UNIQUE NOT NULL, -- The Polygon Amoy address authorized on the smart contract
    logo_url TEXT,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to Supabase Auth
    is_authorized BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Institutions
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institutions are viewable by everyone" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Institutions can update their own profile" ON public.institutions FOR UPDATE USING (auth.uid() = auth_user_id);

-- ==============================================================================
-- 2. CERTIFICATES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id INT4 UNIQUE NOT NULL,             -- The token ID returned from Polygon Amoy
    cert_hash TEXT UNIQUE NOT NULL,            -- SHA-256 Hash of the critical data
    ipfs_cid TEXT NOT NULL,                    -- The Pinata CID for the PDF
    tx_hash TEXT NOT NULL,                     -- The immutable polygon transaction hash
    student_name TEXT NOT NULL,
    student_email TEXT,
    student_wallet TEXT NOT NULL,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    degree TEXT NOT NULL,
    specialization TEXT,
    cgpa DECIMAL(4,2),
    date_issued DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for high-performance block explorer lookups
CREATE INDEX idx_certs_hash ON public.certificates(cert_hash);
CREATE INDEX idx_certs_student_wallet ON public.certificates(student_wallet);
CREATE INDEX idx_certs_tx_hash ON public.certificates(tx_hash);

-- RLS Policies for Certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certificates are viewable by everyone" ON public.certificates FOR SELECT USING (true);
-- Only the institution that issued it (or Edge functions) can insert/update
CREATE POLICY "Institutions can insert their certificates" ON public.certificates FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_user_id FROM public.institutions WHERE id = institution_id)
);
CREATE POLICY "Institutions can update their certificates (e.g. revoke)" ON public.certificates FOR UPDATE USING (
    auth.uid() IN (SELECT auth_user_id FROM public.institutions WHERE id = institution_id)
);

-- ==============================================================================
-- 3. STUDENTS TABLE 
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own profile" ON public.students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students can update their own profile" ON public.students FOR UPDATE USING (auth.uid() = id);

-- ==============================================================================
-- 4. UTILITY TRIGGERS
-- ==============================================================================
-- Automatically update the `updated_at` timestamp.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
