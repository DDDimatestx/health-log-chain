import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Shield, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResult {
  symptoms: string[];
  mood: string;
  severity: 'low' | 'medium' | 'high';
  summary: string;
  confidence: number;
}

interface JournalEntryProps {
  onEntrySubmitted: (entryText: string, analysis: AnalysisResult, dataHash: string, txHash: string) => void;
  account: string | null;
}

const JournalEntry = ({ onEntrySubmitted, account }: JournalEntryProps) => {
  const [entry, setEntry] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const { signAndSubmitHash } = useWallet();

  const analyzeEntry = async () => {
    if (!entry.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please write your health journal entry first.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Real AI analysis via Supabase Edge Function (Gemini)
      const { data, error } = await supabase.functions.invoke('analyze-entry', {
        body: { text: entry },
      });

      if (error) {
        throw error;
      }

      const result = data?.analysis as AnalysisResult | undefined;
      if (!result) {
        throw new Error('AI returned no analysis');
      }

      setAnalysis(result);
      toast({
        title: "Analysis Complete",
        description: "AI has successfully analyzed your health journal entry.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze your entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitToBlockchain = async () => {
    if (!analysis || !account) return;

    setIsSubmitting(true);
    try {
      // Create a hash of the entry data
      const entryData = JSON.stringify({
        entry,
        analysis,
        timestamp: new Date().toISOString(),
        account
      });
      
      // Submit to blockchain using real wallet function
      const txHash = await signAndSubmitHash(entryData);
      
      // Submit to our database
      onEntrySubmitted(entry, analysis, entryData, txHash);
      
      // Reset form
      setEntry('');
      setAnalysis(null);
      
      toast({
        title: "Entry Verified!",
        description: "Your health journal entry has been permanently recorded on the blockchain.",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit to blockchain. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-health-green text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'high': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-medical">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>New Health Journal Entry</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe how you're feeling today, any symptoms you're experiencing, your mood, and overall health status..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="min-h-32 resize-none"
          />
          
          <Button 
            onClick={analyzeEntry}
            disabled={isAnalyzing || !entry.trim()}
            className="w-full bg-gradient-medical shadow-medical hover:shadow-lg transition-all duration-300"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="shadow-success animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-health-green" />
              <span>AI Analysis Results</span>
              <Badge variant="secondary" className="ml-auto">
                {Math.round(analysis.confidence * 100)}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Identified Symptoms:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.symptoms.map((symptom, index) => (
                  <Badge key={index} variant="outline" className="bg-primary/10">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Mood:</h4>
                <Badge variant="secondary">{analysis.mood}</Badge>
              </div>
              <div>
                <h4 className="font-medium mb-1">Severity:</h4>
                <Badge className={getSeverityColor(analysis.severity)}>
                  {analysis.severity}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Summary:</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {analysis.summary}
              </p>
            </div>

            <Button 
              onClick={submitToBlockchain}
              disabled={isSubmitting || !account}
              className="w-full bg-gradient-blockchain shadow-blockchain hover:shadow-lg transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording on Blockchain...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Verify & Record on Blockchain
                </>
              )}
            </Button>

            {!account && (
              <p className="text-sm text-muted-foreground text-center">
                Connect your wallet to record this entry on the blockchain
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JournalEntry;