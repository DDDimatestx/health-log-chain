import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { History, ExternalLink, Calendar, Shield, Download, FileText, FileImage } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

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

interface EntryHistoryProps {
  entries: HistoryEntry[];
}

const EntryHistory = ({ entries }: EntryHistoryProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-health-green text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'high': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const openInEtherscan = (txHash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
  };

  const saveAsText = () => {
    const content = entries.map((entry, index) => {
      return `
HEALTH JOURNAL ENTRY #${index + 1}
Date: ${format(entry.date, 'MMM dd, yyyy HH:mm')}
Transaction: ${entry.txHash}
${entry.blockNumber ? `Block: #${entry.blockNumber}` : ''}

ENTRY:
${entry.entry}

ANALYSIS:
Symptoms: ${entry.symptoms.join(', ')}
Mood: ${entry.mood}
Severity: ${entry.severity}
Summary: ${entry.summary}

${'='.repeat(50)}
`;
    }).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-journal-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveAsPDF = () => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    let y = 20;

    // Title
    pdf.setFontSize(20);
    pdf.text('Health Journal Report', 20, y);
    y += 15;

    pdf.setFontSize(12);
    pdf.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, y);
    y += 10;

    pdf.text(`Total Entries: ${entries.length}`, 20, y);
    y += 20;

    entries.forEach((entry, index) => {
      // Check if we need a new page
      if (y > pageHeight - 60) {
        pdf.addPage();
        y = 20;
      }

      // Entry header
      pdf.setFontSize(14);
      pdf.text(`Entry #${index + 1}`, 20, y);
      y += 10;

      pdf.setFontSize(10);
      pdf.text(`Date: ${format(entry.date, 'MMM dd, yyyy HH:mm')}`, 20, y);
      y += 6;
      pdf.text(`Transaction: ${entry.txHash}`, 20, y);
      y += 6;
      if (entry.blockNumber) {
        pdf.text(`Block: #${entry.blockNumber}`, 20, y);
        y += 6;
      }
      y += 4;

      // Entry content
      pdf.setFontSize(12);
      const entryLines = pdf.splitTextToSize(`Entry: ${entry.entry}`, 170);
      pdf.text(entryLines, 20, y);
      y += entryLines.length * 6 + 4;

      // Analysis
      pdf.text(`Symptoms: ${entry.symptoms.join(', ')}`, 20, y);
      y += 6;
      pdf.text(`Mood: ${entry.mood}`, 20, y);
      y += 6;
      pdf.text(`Severity: ${entry.severity}`, 20, y);
      y += 6;
      
      const summaryLines = pdf.splitTextToSize(`Summary: ${entry.summary}`, 170);
      pdf.text(summaryLines, 20, y);
      y += summaryLines.length * 6 + 15;
    });

    pdf.save(`health-journal-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (entries.length === 0) {
    return (
      <Card className="shadow-medical">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5 text-primary" />
            <span>Verified Entry History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No verified entries yet. Create your first health journal entry above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-medical">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5 text-primary" />
          <span>Verified Entry History</span>
          <Badge variant="secondary" className="ml-2">
            {entries.length} entries
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Download className="h-4 w-4 mr-2" />
                Save Records
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={saveAsText}>
                <FileText className="h-4 w-4 mr-2" />
                Save as Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={saveAsPDF}>
                <FileImage className="h-4 w-4 mr-2" />
                Save as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="border border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {format(entry.date, 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInEtherscan(entry.txHash)}
                      className="text-xs"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      View on Blockchain
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {entry.entry.length > 150 
                      ? `${entry.entry.substring(0, 150)}...` 
                      : entry.entry
                    }
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Symptoms: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-primary/10">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Mood: </span>
                        <Badge variant="secondary" className="text-xs">
                          {entry.mood}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Severity: </span>
                        <Badge className={`text-xs ${getSeverityColor(entry.severity)}`}>
                          {entry.severity}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span>TX: {entry.txHash.slice(0, 10)}...{entry.txHash.slice(-8)}</span>
                      {entry.blockNumber && (
                        <span>• Block: #{entry.blockNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EntryHistory;