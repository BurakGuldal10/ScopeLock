-- ==============================================================================
-- SCOPELOCK DATABASE SCHEMA (1. AŞAMA: TEMEL VE VERİTABANI)
-- Migration: 01_init.sql
-- Proje Lideri: Armut
-- Kıdemli Full-Stack: Vanlı
-- Güvenlik İncelemesi: Ali Oda
-- Kalite & Test İncelemesi: Jony
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. 3 ANA TABLO
-- ==============================================================================

-- Tablo 1: agencies (Ajans Bilgileri)
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tablo 2: projects (Müşteri ve Proje Adı)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tablo 3: signoffs (Onay Talepleri)
-- Durumlar: 'beklemede', 'onaylandi', 'revizyon_istendi'
CREATE TABLE IF NOT EXISTS signoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    additional_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'beklemede' NOT NULL CHECK (status IN ('beklemede', 'onaylandi', 'revizyon_istendi')),
    token UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    signature_data TEXT,
    signed_at TIMESTAMPTZ,
    signer_ip VARCHAR(45),
    revision_notes TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- 3. PERFORMANS İNDEKSLERİ
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_agencies_user_id ON agencies(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_agency_id ON projects(agency_id);
CREATE INDEX IF NOT EXISTS idx_signoffs_project_id ON signoffs(project_id);
CREATE INDEX IF NOT EXISTS idx_signoffs_agency_id ON signoffs(agency_id);
CREATE INDEX IF NOT EXISTS idx_signoffs_token ON signoffs(token);
CREATE INDEX IF NOT EXISTS idx_signoffs_status ON signoffs(status);

-- ==============================================================================
-- 4. OTOMATİK ZAMAN DAMGASI (updated_at) TETİKLEYİCİSİ
-- ==============================================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_agencies_updated_at ON agencies;
CREATE TRIGGER set_agencies_updated_at
BEFORE UPDATE ON agencies
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON projects;
CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_signoffs_updated_at ON signoffs;
CREATE TRIGGER set_signoffs_updated_at
BEFORE UPDATE ON signoffs
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) AKTİVASYONU
-- ==============================================================================
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE signoffs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 6. GÜVENLİK POLİTİKALARI (RLS) - Ali Oda Onaylı
-- ==============================================================================

-- 6.1. AGENCIES POLİTİKALARI (Sadece oturum açmış ajans sahibi erişir)
CREATE POLICY "agencies_select_own"
    ON agencies FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "agencies_insert_own"
    ON agencies FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "agencies_update_own"
    ON agencies FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "agencies_delete_own"
    ON agencies FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- 6.2. PROJECTS POLİTİKALARI (Sadece projeyi oluşturan ajans erişir)
CREATE POLICY "projects_select_own"
    ON projects FOR SELECT
    TO authenticated
    USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

CREATE POLICY "projects_insert_own"
    ON projects FOR INSERT
    TO authenticated
    WITH CHECK (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

CREATE POLICY "projects_update_own"
    ON projects FOR UPDATE
    TO authenticated
    USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()))
    WITH CHECK (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

CREATE POLICY "projects_delete_own"
    ON projects FOR DELETE
    TO authenticated
    USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

-- 6.3. SIGNOFFS POLİTİKALARI (Ajans Yönetimi + Şifresiz Müşteri Token Erişimi)
-- Ajans tüm kendi signoff taleplerini yönetebilir:
CREATE POLICY "signoffs_agency_select_own"
    ON signoffs FOR SELECT
    TO authenticated
    USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

CREATE POLICY "signoffs_agency_insert_own"
    ON signoffs FOR INSERT
    TO authenticated
    WITH CHECK (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

CREATE POLICY "signoffs_agency_update_own"
    ON signoffs FOR UPDATE
    TO authenticated
    USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()))
    WITH CHECK (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

CREATE POLICY "signoffs_agency_delete_own"
    ON signoffs FOR DELETE
    TO authenticated
    USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

-- Müşteri Sihirli Link Erişimi (Anonim / Public):
-- Müşteri sadece linkteki benzersiz token ile talebi görebilir
CREATE POLICY "signoffs_public_select_by_token"
    ON signoffs FOR SELECT
    TO anon, authenticated
    USING (token IS NOT NULL);

-- Müşteri sadece beklemedeki talebi onaylayabilir veya revizyon notu düşebilir:
CREATE POLICY "signoffs_public_update_by_token"
    ON signoffs FOR UPDATE
    TO anon, authenticated
    USING (status = 'beklemede')
    WITH CHECK (status IN ('onaylandi', 'revizyon_istendi'));
