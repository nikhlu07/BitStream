import { useState } from "react";
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
  ArrowLeft
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { mockTransactions } from "@/data/mockData";

export default function Wallet() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userData = JSON.parse(localStorage.getItem("bitstream_user") || "{}");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleSignOut = () => {
    localStorage.removeItem("bitstream_user");
    navigate("/");
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(userData.walletAddress || "");
    toast({
      title: "Address copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleWithdraw = () => {
    if (!withdrawAddress || !withdrawAmount) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > (userData.balance || 0)) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough sBTC",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Withdrawal initiated",
      description: `Withdrawing ${amount} sBTC to ${withdrawAddress.substring(0, 8)}...`,
    });
    
    setWithdrawAddress("");
    setWithdrawAmount("");
  };

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
                    {userData.username?.[0]?.toUpperCase() || "U"}
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
        <Card className="p-8 mb-8 bg-gradient-primary text-white">
          <div className="text-center">
            <div className="text-sm opacity-90 mb-2">Your Balance</div>
            <div className="text-5xl font-bold mb-2">
              {userData.balance?.toFixed(4) || "0.1000"} sBTC
            </div>
            <div className="text-xl opacity-90">
              ≈ ${((userData.balance || 0.1) * 62000).toFixed(2)} USD
            </div>
            <div className="text-xs opacity-75 mt-2">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button size="lg" className="h-auto py-4 flex items-center gap-3">
            <ArrowDownToLine className="w-5 h-5" />
            <span>Deposit sBTC</span>
          </Button>
          <Button size="lg" variant="outline" className="h-auto py-4 flex items-center gap-3">
            <ArrowUpFromLine className="w-5 h-5" />
            <span>Withdraw sBTC</span>
          </Button>
          <Button size="lg" variant="outline" className="h-auto py-4 flex items-center gap-3">
            <WalletIcon className="w-5 h-5" />
            <span>Get Testnet sBTC</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Wallet Address */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Your Wallet Address</h3>
            <div className="bg-muted p-4 rounded-lg mb-3 break-all font-mono text-sm">
              {userData.walletAddress || "SP2J6ZY...EXAMPLE"}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyAddress}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
            </div>
          </Card>

          {/* Withdraw */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Withdraw sBTC</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Bitcoin Address
                </label>
                <Input
                  placeholder="SP2J6ZY..."
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Amount (sBTC)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="0.0000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => setWithdrawAmount((userData.balance || 0).toString())}
                  >
                    Max
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Network fee: ~0.00001 sBTC
              </div>
              <Button className="w-full" onClick={handleWithdraw}>
                Confirm Withdrawal
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