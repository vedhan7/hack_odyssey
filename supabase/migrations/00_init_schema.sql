-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Institutions (Admins) Table
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Storing hashed passwords securely
    wallet_address TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id TEXT PRIMARY KEY, -- Certificate ID (e.g., CRT-2026-X8F9)
    student_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    issue_date DATE NOT NULL,
    issuer_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    ipfs_hash TEXT, -- CID from Pinata
    file_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of the PDF file contents
    chained_hash TEXT, -- Cryptographic hash chain link to previous cert
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) Policies
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Allow public read access to certificates (needed for Verify Portal)
CREATE POLICY "Allow public read access to certificates" 
ON public.certificates FOR SELECT 
USING (true);

-- 3. Bootstrap a Default Institution (for Phase 2 testing)
-- Password: password123 (hashed with bcrypt or just a placeholder for now)
INSERT INTO public.institutions (id, name, email, password_hash, wallet_address)
VALUES (
    '00000000-0000-0000-0000-000000000000', 
    'Hack Odyssey University', 
    'admin@university.edu', 
    '$2a$10$abcdefghijklmnopqrstuv', -- placeholder
    '0xd3c0cC1FEa15C51924DA263AD1B91700d93D9a76'
) ON CONFLICT (id) DO NOTHING;
