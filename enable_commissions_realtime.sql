-- 1. Enable Realtime updates for the Commissions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'commissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.commissions;
  END IF;
END
$$;
