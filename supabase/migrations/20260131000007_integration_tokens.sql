-- Migration: Integration tokens table
-- Description: Encrypted OAuth tokens for third-party integrations (WHOOP, Hevy)

-- Create provider enum
CREATE TYPE public.integration_provider AS ENUM (
    'whoop',
    'hevy'
);

-- Create integration_tokens table
CREATE TABLE IF NOT EXISTS public.integration_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider public.integration_provider NOT NULL,
    encrypted_access_token TEXT NOT NULL,
    encrypted_refresh_token TEXT,
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    token_type TEXT NOT NULL DEFAULT 'Bearer',
    expires_at TIMESTAMPTZ,
    scopes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_provider UNIQUE (user_id, provider)
);

-- Create indexes for integration_tokens
CREATE INDEX IF NOT EXISTS idx_integration_tokens_user_id ON public.integration_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_provider ON public.integration_tokens(provider);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_expires ON public.integration_tokens(expires_at) WHERE expires_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own tokens
CREATE POLICY "Users can view own integration tokens"
    ON public.integration_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert only their own tokens
CREATE POLICY "Users can insert own integration tokens"
    ON public.integration_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update only their own tokens
CREATE POLICY "Users can update own integration tokens"
    ON public.integration_tokens
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete only their own tokens
CREATE POLICY "Users can delete own integration tokens"
    ON public.integration_tokens
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.integration_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comment to table
COMMENT ON TABLE public.integration_tokens IS 'Encrypted OAuth tokens for third-party integrations with WHOOP and Hevy';
COMMENT ON COLUMN public.integration_tokens.encrypted_access_token IS 'AES-256-GCM encrypted access token';
COMMENT ON COLUMN public.integration_tokens.encrypted_refresh_token IS 'AES-256-GCM encrypted refresh token';
COMMENT ON COLUMN public.integration_tokens.iv IS 'Initialization vector for AES-256-GCM encryption';
COMMENT ON COLUMN public.integration_tokens.auth_tag IS 'Authentication tag for AES-256-GCM encryption';
