/**
 * Creator Earnings Component
 * Displays earnings and allows withdrawals
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  TrendingUp, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  DollarSign,
  Eye,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';
import { useContentManagement } from '@/hooks/useContentManagement';
import { formatSTX } from '@/lib/contracts';

interface CreatorEarningsProps {
  className?: string;
}

export const CreatorEarnings: React.FC<CreatorEarningsProps> = ({ className }) => {
  const { toast } = useToast();
  const { 
    earnings, 
    loadEarnings, 
    withdrawAllEarnings, 
    isLoading, 
    error, 
    getFormattedEarnings,
    clearError 
  } = usePaymentFlow();
  const { creatorContent } = useContentManagement();
  
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [lastWithdrawal, setLastWithdrawal] = useState<Date | null>(null);

  // Load earnings on component mount
  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  const handleWithdraw = async () => {
    if (!earnings || earnings.balance === 0n) {
      toast({
        title: 'No earnings to withdraw',
        description: 'You need to have earnings before you can withdraw',
        variant: 'destructive',
      });
      return;
    }

    setIsWithdrawing(true);
    clearError();

    try {
      const result = await withdrawAllEarnings();
      
      if (result.success) {
        setLastWithdrawal(new Date());
        toast({
          title: 'Withdrawal successful! 🎉',
          description: `Your earnings have been transferred to your wallet`,
        });
      } else {
        toast({
          title: 'Withdrawal failed',
          description: result.error || 'Unable to process withdrawal',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Withdrawal error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleRefresh = () => {
    clearError();
    loadEarnings();
  };

  // Calculate content statistics
  const contentStats = {
    totalContent: creatorContent.length,
    activeContent: creatorContent.filter(c => c.isActive).length,
    averagePrice: creatorContent.length > 0 
      ? creatorContent.reduce((sum, c) => sum + Number(c.price), 0) / creatorContent.length / 1_000_000
      : 0,
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Creator Earnings</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 border-destructive/20 bg-destructive/10">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </Card>
        )}

        {/* Main Earnings Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Earnings</h3>
              <p className="text-sm text-muted-foreground">Available for withdrawal</p>
            </div>
          </div>

          <div className="text-center py-6">
            <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              {getFormattedEarnings()} STX
            </div>
            <p className="text-muted-foreground">
              {earnings?.balance === 0n ? 'No earnings yet' : 'Ready to withdraw'}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleWithdraw}
              disabled={!earnings || earnings.balance === 0n || isWithdrawing || isLoading}
              className="flex-1"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Withdraw All
                </>
              )}
            </Button>
          </div>

          {lastWithdrawal && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Last withdrawal: {lastWithdrawal.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Content Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Content Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{contentStats.totalContent}</div>
              <div className="text-sm text-muted-foreground">Total Content</div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{contentStats.activeContent}</div>
              <div className="text-sm text-muted-foreground">Active Content</div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mx-auto mb-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{contentStats.averagePrice.toFixed(3)}</div>
              <div className="text-sm text-muted-foreground">Avg Price (STX)</div>
            </div>
          </div>
        </Card>

        {/* Recent Content */}
        {creatorContent.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Content</h3>
            
            <div className="space-y-3">
              {creatorContent.slice(0, 5).map((content, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">Content #{index + 1}</div>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(Number(content.createdAt) * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatSTX(content.price)} STX</div>
                    <Badge variant={content.isActive ? "default" : "secondary"} className="text-xs">
                      {content.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {creatorContent.length > 5 && (
              <div className="text-center mt-4">
                <Button variant="outline" size="sm">
                  View All Content ({creatorContent.length})
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Help Section */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">How Earnings Work</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• <strong>Streaming Payments:</strong> Earn STX as viewers watch your content</p>
            <p>• <strong>Revenue Split:</strong> You keep 90% of all payments (10% platform fee)</p>
            <p>• <strong>Real-time:</strong> Earnings are updated as payments are processed</p>
            <p>• <strong>Withdrawals:</strong> Transfer earnings to your wallet anytime</p>
            <p>• <strong>Blockchain:</strong> All transactions are recorded on Stacks blockchain</p>
          </div>
        </Card>
      </div>
    </div>
  );
};