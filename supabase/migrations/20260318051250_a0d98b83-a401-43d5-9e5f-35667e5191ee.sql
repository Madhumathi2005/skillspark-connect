
-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Add unique constraint on connections to prevent duplicate requests
ALTER TABLE public.connections ADD CONSTRAINT connections_unique_pair UNIQUE (sender_id, receiver_id);
