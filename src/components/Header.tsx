import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Activity, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  account: string | null;
  onConnectWallet: () => Promise<void>;
  isConnecting: boolean;
}

const Header = ({ account, onConnectWallet, isConnecting }: HeaderProps) => {
  const { toast } = useToast();

  const formatAccount = (account: string) => {
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-primary animate-pulse-glow" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                MedJournal
              </h1>
              <p className="text-sm text-muted-foreground">
                Blockchain-Verified Health Diary
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {account ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-secondary/20 rounded-full">
                <div className="w-2 h-2 bg-health-green rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{formatAccount(account)}</span>
              </div>
            </div>
          ) : (
            <Button 
              onClick={onConnectWallet}
              disabled={isConnecting}
              className="bg-gradient-medical shadow-medical hover:shadow-lg transition-all duration-300"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;