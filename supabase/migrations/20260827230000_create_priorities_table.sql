-- Migration: 20260827230000_create_priorities_table.sql
-- Description: Create additive priorities table with row-level security for user-generated strategic priorities.

CREATE TABLE IF NOT EXISTS public.priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority_level TEXT NOT NULL CHECK (priority_level IN ('Critical', 'High', 'Medium', 'Low')),
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed', 'Archived')),
    related_entity_type TEXT CHECK (related_entity_type IN ('customer', 'product', 'country', 'review', 'general') OR related_entity_type IS NULL),
    related_entity_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_priorities_user_id ON public.priorities(user_id);
CREATE INDEX IF NOT EXISTS idx_priorities_status ON public.priorities(status);
CREATE INDEX IF NOT EXISTS idx_priorities_level ON public.priorities(priority_level);
CREATE INDEX IF NOT EXISTS idx_priorities_created_at ON public.priorities(created_at DESC);

-- Enable RLS
ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own priorities" ON public.priorities;
DROP POLICY IF EXISTS "Users can insert own priorities" ON public.priorities;
DROP POLICY IF EXISTS "Users can update own priorities" ON public.priorities;
DROP POLICY IF EXISTS "Users can delete own priorities" ON public.priorities;
DROP POLICY IF EXISTS "Service role full access to priorities" ON public.priorities;

-- RLS Policies for authenticated users (isolated to own user_id)
CREATE POLICY "Users can view own priorities"
    ON public.priorities
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own priorities"
    ON public.priorities
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own priorities"
    ON public.priorities
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own priorities"
    ON public.priorities
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Service role bypass for backend management
CREATE POLICY "Service role full access to priorities"
    ON public.priorities
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant table permissions
GRANT ALL ON public.priorities TO authenticated, service_role;
