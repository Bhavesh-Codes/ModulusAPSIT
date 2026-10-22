-- Atomic helpers: increment/decrement storage_used_bytes without read-modify-write round-trips.
-- Prevents race conditions and eliminates DB latency on upload & delete.
--
-- Run in Supabase Dashboard → SQL Editor. Safe to re-run.

CREATE OR REPLACE FUNCTION public.decrement_storage(p_user_id uuid, p_bytes bigint)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.users
  SET storage_used_bytes = GREATEST(0, COALESCE(storage_used_bytes, 0) - p_bytes)
  WHERE id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_storage(p_user_id uuid, p_bytes bigint)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.users
  SET storage_used_bytes = COALESCE(storage_used_bytes, 0) + p_bytes
  WHERE id = p_user_id;
$$;
