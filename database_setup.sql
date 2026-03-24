-- Run this in the Supabase SQL Editor to set up your backend

-- 1. Create the Commissions table
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    discord_handle TEXT NOT NULL,
    details TEXT NOT NULL,
    reference_url TEXT,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the Messages table for the chat
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    commission_id UUID REFERENCES public.commissions(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Set up Row Level Security (RLS)

-- Enable RLS on tables
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies for Commissions
DROP POLICY IF EXISTS "Users can view their own commissions" ON public.commissions;
CREATE POLICY "Users can view their own commissions" 
ON public.commissions FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own commissions" ON public.commissions;
CREATE POLICY "Users can insert their own commissions" 
ON public.commissions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Artist can view all commissions" ON public.commissions;
CREATE POLICY "Artist can view all commissions" 
ON public.commissions FOR SELECT 
USING (auth.jwt() ->> 'email' = 'rachelstudio9@gmail.com');

DROP POLICY IF EXISTS "Artist can update all commissions" ON public.commissions;
CREATE POLICY "Artist can update all commissions" 
ON public.commissions FOR UPDATE 
USING (auth.jwt() ->> 'email' = 'rachelstudio9@gmail.com');

-- Policies for Messages
DROP POLICY IF EXISTS "Users can view messages of their commissions" ON public.messages;
CREATE POLICY "Users can view messages of their commissions" 
ON public.messages FOR SELECT 
USING (
    commission_id IN (
        SELECT id FROM public.commissions WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert messages to their commissions" ON public.messages;
CREATE POLICY "Users can insert messages to their commissions" 
ON public.messages FOR INSERT 
WITH CHECK (
    commission_id IN (
        SELECT id FROM public.commissions WHERE user_id = auth.uid()
    )
    AND sender_id = auth.uid()
);

DROP POLICY IF EXISTS "Artist can view all messages" ON public.messages;
CREATE POLICY "Artist can view all messages" 
ON public.messages FOR SELECT 
USING (auth.jwt() ->> 'email' = 'rachelstudio9@gmail.com');

DROP POLICY IF EXISTS "Artist can insert messages" ON public.messages;
CREATE POLICY "Artist can insert messages" 
ON public.messages FOR INSERT 
WITH CHECK (
    auth.jwt() ->> 'email' = 'rachelstudio9@gmail.com'
    AND sender_id = auth.uid()
);

-- 4. Set up Storage for Reference Images
-- Create a new bucket called 'references' (ignores if already created)
INSERT INTO storage.buckets (id, name, public) VALUES ('references', 'references', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the references bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'references');

-- Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'references' AND auth.role() = 'authenticated');

-- 5. Enable Realtime on the messages table
-- We use a DO block to prevent errors if it's already in the publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END
$$;
