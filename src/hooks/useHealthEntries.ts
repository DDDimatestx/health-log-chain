import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HealthEntry {
  id: string;
  wallet_address: string;
  entry_text: string;
  symptoms: string[];
  mood: string;
  severity: 'low' | 'medium' | 'high';
  summary: string;
  confidence_score?: number;
  data_hash: string;
  tx_hash?: string;
  block_number?: number;
  created_at: string;
}

export interface HistoryEntry {
  id: string;
  date: Date;
  entry: string;
  symptoms: string[];
  mood: string;
  severity: 'low' | 'medium' | 'high';
  summary: string;
  txHash: string;
  blockNumber?: number;
}

export const useHealthEntries = (walletAddress: string | null) => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load entries when wallet connects
  useEffect(() => {
    if (walletAddress) {
      loadEntries();
    } else {
      setEntries([]);
    }
  }, [walletAddress]);

  const loadEntries = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('health_entries')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedEntries: HistoryEntry[] = (data || []).map((entry: any) => ({
        id: entry.id,
        date: new Date(entry.created_at),
        entry: entry.entry_text,
        symptoms: entry.symptoms,
        mood: entry.mood,
        severity: entry.severity,
        summary: entry.summary,
        txHash: entry.tx_hash || '',
        blockNumber: entry.block_number || undefined
      }));

      setEntries(mappedEntries);
    } catch (error: any) {
      console.error('Error loading entries:', error);
      toast({
        title: "Error Loading Entries",
        description: error.message || "Failed to load your journal entries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async (
    entryText: string,
    analysis: {
      symptoms: string[];
      mood: string;
      severity: 'low' | 'medium' | 'high';
      summary: string;
      confidence?: number;
    },
    dataHash: string,
    txHash: string
  ) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const { data, error } = await supabase
        .from('health_entries')
        .insert({
          wallet_address: walletAddress,
          entry_text: entryText,
          symptoms: analysis.symptoms,
          mood: analysis.mood,
          severity: analysis.severity,
          summary: analysis.summary,
          confidence_score: analysis.confidence || 0,
          data_hash: dataHash,
          tx_hash: txHash,
          block_number: Math.floor(Math.random() * 1000000) + 5000000 // Mock for now
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newEntry: HistoryEntry = {
        id: data.id,
        date: new Date(data.created_at),
        entry: entryText,
        symptoms: analysis.symptoms,
        mood: analysis.mood,
        severity: analysis.severity,
        summary: analysis.summary,
        txHash: txHash,
        blockNumber: data.block_number
      };

      setEntries(prev => [newEntry, ...prev]);

      toast({
        title: "Entry Saved",
        description: "Your health journal entry has been securely stored",
      });

      return newEntry;
    } catch (error: any) {
      console.error('Error saving entry:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save your entry",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    entries,
    loading,
    saveEntry,
    loadEntries
  };
};