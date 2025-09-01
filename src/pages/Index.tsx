import { useState } from 'react';
import Header from '@/components/Header';
import JournalEntry from '@/components/JournalEntry';
import EntryHistory from '@/components/EntryHistory';
import { useWallet } from '@/hooks/useWallet';
import { Separator } from '@/components/ui/separator';

interface HistoryEntry {
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

const Index = () => {
  const { account, isConnecting, connectWallet } = useWallet();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  const handleEntrySubmitted = (entry: string, analysis: any, hash: string) => {
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date(),
      entry,
      symptoms: analysis.symptoms,
      mood: analysis.mood,
      severity: analysis.severity,
      summary: analysis.summary,
      txHash: hash,
      blockNumber: Math.floor(Math.random() * 1000000) + 5000000 // Mock block number
    };

    setEntries(prev => [newEntry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        account={account}
        onConnectWallet={connectWallet}
        isConnecting={isConnecting}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Secure Health Journal
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Record your health journey with AI-powered analysis and blockchain verification. 
              Create tamper-proof medical records that you control.
            </p>
          </div>

          <Separator className="my-8" />

          <JournalEntry 
            onEntrySubmitted={handleEntrySubmitted}
            account={account}
          />

          <EntryHistory entries={entries} />
        </div>
      </main>
    </div>
  );
};

export default Index;
