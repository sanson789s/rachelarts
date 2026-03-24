-- Run this to update the database for chat file uploads

-- 1. Add file support columns to the messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- 2. Create the Storage Bucket for Chat Attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('chat_attachments', 'chat_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies for chat_attachments
-- Allow public read access to the bucket
DROP POLICY IF EXISTS "Public Access Chat Attachments" ON storage.objects;
CREATE POLICY "Public Access Chat Attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat_attachments');

-- Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload chat attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat_attachments' AND auth.role() = 'authenticated');
