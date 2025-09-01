import Header from '@/components/Header';
import JournalEntry from '@/components/JournalEntry';
import EntryHistory from '@/components/EntryHistory';
import { useWallet } from '@/hooks/useWallet';
import { useHealthEntries } from '@/hooks/useHealthEntries';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const { account, isConnecting, connectWallet } = useWallet();
  const { entries, loading, saveEntry } = useHealthEntries(account);

  const handleEntrySubmitted = async (entryText: string, analysis: any, dataHash: string, txHash: string) => {
    try {
      await saveEntry(entryText, analysis, dataHash, txHash);
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
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
