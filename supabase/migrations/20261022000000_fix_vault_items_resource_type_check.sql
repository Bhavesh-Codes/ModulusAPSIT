-- vault_items.resource_type CHECK constraint is stale.
--
-- The app (src/types/groups.ts → RESOURCE_TYPES) now uses 11 resource types:
--   lecture_notes, lecture_ppt, lab_manual, question_bank, previous_papers,
--   assignment, solutions, case_study, video, reference, other
--
-- The DB constraint still only allows the OLD list (it even kept the legacy
-- 'ppt' value) and rejects 'lecture_ppt', 'solutions' and 'case_study'.
-- Result: sharing to a community works unless the user picks one of those
-- three types → "new row for relation \"vault_items\" violates check
-- constraint \"vault_items_resource_type_check\"".
--
-- Run in Supabase Dashboard → SQL Editor. Safe to re-run.

-- 1. Remove the stale constraint.
ALTER TABLE public.vault_items
  DROP CONSTRAINT IF EXISTS vault_items_resource_type_check;

-- 2. Normalize legacy rows before re-adding the constraint
--    (app maps 'ppt' → 'lecture_ppt' for display already).
UPDATE public.vault_items
  SET resource_type = 'lecture_ppt'
  WHERE resource_type = 'ppt';

-- 3. Restore the constraint with the full, current value set.
ALTER TABLE public.vault_items
  ADD CONSTRAINT vault_items_resource_type_check
  CHECK (resource_type IN (
    'lecture_notes',
    'lecture_ppt',
    'lab_manual',
    'question_bank',
    'previous_papers',
    'assignment',
    'solutions',
    'case_study',
    'video',
    'reference',
    'other'
  ));
