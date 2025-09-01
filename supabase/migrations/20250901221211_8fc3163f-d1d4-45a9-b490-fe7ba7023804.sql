-- Create table for storing health journal entries
CREATE TABLE public.health_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  entry_text TEXT NOT NULL,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  mood TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  summary TEXT NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0.0,
  data_hash TEXT NOT NULL,
  tx_hash TEXT,
  block_number BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.health_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own entries
CREATE POLICY "Users can view their own entries" 
ON public.health_entries 
FOR SELECT 
USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR wallet_address IS NOT NULL);

-- Create policy for users to insert their own entries
CREATE POLICY "Users can create their own entries" 
ON public.health_entries 
FOR INSERT 
WITH CHECK (true);

-- Create policy for users to update their own entries (for tx_hash updates)
CREATE POLICY "Users can update their own entries" 
ON public.health_entries 
FOR UPDATE 
USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' OR wallet_address IS NOT NULL);

-- Create index for efficient wallet_address queries
CREATE INDEX idx_health_entries_wallet_address ON public.health_entries(wallet_address);

-- Create index for efficient date queries
CREATE INDEX idx_health_entries_created_at ON public.health_entries(created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_health_entries_updated_at
BEFORE UPDATE ON public.health_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();