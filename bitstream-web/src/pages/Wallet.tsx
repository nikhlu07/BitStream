import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet as WalletIcon, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Copy, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  LogOut,
  Settings,
  ArrowLeft,
  RefreshCw,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { convertToUSD, formatAddress, getTestnetTokens } from "@/lib/turnkey";
import { getNetworkConfig, getCurrentNetwork } from "@/config/network";
import { isFaucetEnabled } from "@/config/turnkey";
import { mockTransactions } from "@/data/mockData";
import { useTurnkeyWallet } from "@/hooks/useTurnkeyWallet";

export default function Wallet() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, balance, isLoading, refreshBalance, sendPaymentTransaction, signOut } = useWallet();
  const { connectTurnkey, isLoading: isTurnkeyLoading, isConnected } = useTurnkeyWallet();
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isRequestingTokens, setIsRequestingTokens] = useState(false);
  const networkConfig = getNetworkConfig();
  const isTestnet = getCurrentNetwork() === 'testnet';
  const showFaucet = isTestnet && isFaucetEnabled();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/signin");
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const copyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      toast({
        title: "Address copied!",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleRefreshBalance = async () => {
    await refreshBalance();
    toast({
      title: "Balance refreshed",
      description: "Your balance has been updated",
    });
  };

  const handleWithdraw = async () => {
    if (!withdrawAddress || !withdrawAmount) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    
    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough sBTC",
        variant: "destructive",
      });
      return;
    }

    // Validate address format (basic Stacks address validation)
    if (!withdrawAddress.startsWith("SP") && !withdrawAddress.startsWith("SM")) {
      toast({
        title: "Invalid address",
        description: "Please enter a valid Stacks address",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);

    try {
      const result = await sendPaymentTransaction(withdrawAddress, amount);

      if (result.success) {
        toast({
          title: "Withdrawal successful!",
          description: `Sent ${amount} sBTC to ${formatAddress(withdrawAddress)}`,
        });
        setWithdrawAddress("");
        setWithdrawAmount("");
      } else {
        toast({
          title: "Withdrawal failed",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const openExplorer = () => {
    if (user?.walletAddress) {
      window.open(`${networkConfig.explorerUrl}/address/${user.walletAddress}`, '_blank');
    }
  };

  const handleGetTestnetTokens = async () => {
    if (!user?.walletAddress) return;

    setIsRequestingTokens(true);

    try {
      const result = await getTestnetTokens(user.walletAddress);

      if (result.success) {
        toast({
          title: "Testnet tokens requested!",
          description: result.message,
        });
        
        // Refresh balance after a delay
        setTimeout(() => {
          refreshBalance();
        }, 3000);
      } else {
        toast({
          title: "Faucet request failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request testnet tokens",
        variant: "destructive",
      });
    } finally {
      setIsRequestingTokens(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/" className="font-bold text-xl flex items-center gap-2">
              <span className="bg-gradient-primary bg-clip-text text-transparent">BitStream</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white">
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Balance Card */}
        <Card className="p-8 mb-8 bg-gradient-primary text-white relative">
          <div className="text-center">
            <div className="text-sm opacity-90 mb-2">Your Balance</div>
            <div className="text-5xl font-bold mb-2 flex items-center justify-center gap-3">
              {isLoading ? (
                <Loader2 className="w-12 h-12 animate-spin" />
              ) : (
                <>
                  {balance.toFixed(8)} sBTC
                </>
              )}
            </div>
            <div className="text-xl opacity-90">
              ≈ ${convertToUSD(balance).toFixed(2)} USD
            </div>
            <div className="text-xs opacity-75 mt-2">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshBalance}
            disabled={isLoading}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </Card>

        {/* Action Buttons */}
        <div className={`grid grid-cols-1 ${showFaucet ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 mb-8`}>
          <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowDownToLine className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Deposit</div>
                <div className="text-xs text-muted-foreground">Send sBTC to your wallet</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowUpFromLine className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Withdraw</div>
                <div className="text-xs text-muted-foreground">Send sBTC to another wallet</div>
              </div>
            </div>
          </Card>

          {showFaucet && (
            <Card 
              className="p-4 hover:bg-primary/5 transition-colors cursor-pointer border-primary/50"
              onClick={handleGetTestnetTokens}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  {isRequestingTokens ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <WalletIcon className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-semibold">Get Testnet Tokens</div>
                  <div className="text-xs text-muted-foreground">
                    {isRequestingTokens ? 'Requesting...' : 'Free STX for testing'}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Wallet Address */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Your Wallet Address</h3>
            
            {user.walletAddress === 'PENDING_WALLET_CREATION' || user.walletAddress === 'PENDING_CONNECTION' ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                    🔐 Your wallet needs to be connected with Turnkey to get a real Stacks address.
                  </p>
                  <Button 
                    onClick={connectTurnkey} 
                    disabled={isTurnkeyLoading}
                    className="w-full"
                  >
                    {isTurnkeyLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Turnkey Wallet'
                    )}
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg break-all font-mono text-sm text-muted-foreground">
                  {user.walletAddress}
                </div>
              </div>
            ) : (
              <>
                <div className="bg-muted p-4 rounded-lg mb-3 break-all font-mono text-sm">
                  {user.walletAddress}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={copyAddress}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={openExplorer}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Explorer
                  </Button>
                </div>
              </>
            )}
          </Card>

          {/* Withdraw */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Withdraw sBTC</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Stacks Address
                </label>
                <Input
                  placeholder="SP2J6ZY..."
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  disabled={isWithdrawing}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Amount (sBTC)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.00000001"
                    placeholder="0.00000000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={isWithdrawing}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => setWithdrawAmount(balance.toString())}
                    disabled={isWithdrawing}
                  >
                    Max
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Available: {balance.toFixed(8)} sBTC
              </div>
              <div className="text-xs text-muted-foreground">
                Network fee: ~0.00001 sBTC
              </div>
              <Button 
                className="w-full" 
                onClick={handleWithdraw}
                disabled={isWithdrawing || !withdrawAddress || !withdrawAmount}
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Withdrawal'
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-6">Recent Transactions</h3>
          <div className="space-y-3">
            {mockTransactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'received' ? 'bg-success/10' : 'bg-primary/10'
                  }`}>
                    {tx.type === 'received' ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {tx.type === 'streamed' && `Streamed - ${tx.contentTitle}`}
                      {tx.type === 'tip' && `Tip sent - ${tx.contentTitle}`}
                      {tx.type === 'received' && `Received from ${tx.from}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tx.date.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    tx.type === 'received' ? 'text-success' : 'text-foreground'
                  }`}>
                    {tx.type === 'received' ? '+' : '-'}{tx.amount.toFixed(5)} sBTC
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}