-- Migration: Add token_data JSONB column for plain text token storage
-- Description: Adds a JSONB column for storing OAuth tokens as plain text during development.
-- Makes encryption columns nullable so they are not required when using token_data.

-- Add token_data JSONB column
ALTER TABLE public.integration_tokens
    ADD COLUMN IF NOT EXISTS token_data JSONB;

-- Make encryption columns nullable for plain text mode
ALTER TABLE public.integration_tokens
    ALTER COLUMN encrypted_access_token DROP NOT NULL,
    ALTER COLUMN iv DROP NOT NULL,
    ALTER COLUMN auth_tag DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN public.integration_tokens.token_data IS 'JSONB column for plain text token storage (development mode). Contains access_token, refresh_token, expires_at, scope, etc.';
