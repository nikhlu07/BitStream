import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  Star, 
  Eye,
  ThumbsUp,
  Share2,
  Heart,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { mockContent } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";
import { useContractInteraction } from "@/hooks/useContractInteraction";
import { parseSTX, formatSTX } from "@/lib/contracts";

export default function Watch() {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, balance, sendPaymentTransaction, refreshBalance } = useWallet();
  const { 
    startStreamingPayment, 
    stopStreamingPayment, 
    streamingSession, 
    isLoading: paymentLoading,
    error: paymentError,
    getStreamingStats 
  } = usePaymentFlow();
  const { hasAccess, getContentInfo } = useContractInteraction();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [tipAmount, setTipAmount] = useState("");
  const [isSendingTip, setIsSendingTip] = useState(false);
  const [hasContentAccess, setHasContentAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  
  const lastPaymentTime = useRef<number>(0);
  const accumulatedAmount = useRef<number>(0);

  const content = mockContent.find(c => c.id === contentId);
  const relatedContent = mockContent.filter(c => c.id !== contentId).slice(0, 4);

  // Check content access on load
  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.walletAddress || !contentId) {
        setIsCheckingAccess(false);
        return;
      }

      try {
        const contentIdBigInt = BigInt(contentId);
        const accessResult = await hasAccess(contentIdBigInt, user.walletAddress);
        
        if (accessResult.success) {
          setHasContentAccess(accessResult.data || false);
        } else {
          setHasContentAccess(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasContentAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user?.walletAddress, contentId, hasAccess]);

  // Watch time tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setWatchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle play/pause with smart contract integration
  const handlePlayPause = async () => {
    if (!content || !user) return;

    if (!isPlaying) {
      // Starting playback - check access and start streaming payment
      if (!hasContentAccess) {
        toast({
          title: "Access required",
          description: "You need to purchase access to this content first",
          variant: "destructive",
        });
        return;
      }

      // Start streaming payment
      const contentIdBigInt = BigInt(contentId!);
      const pricePerMinute = parseSTX(content.price.toString());
      
      const result = await startStreamingPayment(contentIdBigInt, pricePerMinute);
      
      if (result.success) {
        setIsPlaying(true);
        toast({
          title: "Streaming started",
          description: `Paying ${content.price} sBTC/min to ${content.creatorName}`,
        });
      } else {
        toast({
          title: "Failed to start streaming",
          description: result.error || "Unable to start payment stream",
          variant: "destructive",
        });
      }
    } else {
      // Stopping playback
      const result = await stopStreamingPayment();
      setIsPlaying(false);
      
      if (result.success) {
        toast({
          title: "Streaming stopped",
          description: "Final payment processed",
        });
      } else {
        toast({
          title: "Error stopping stream",
          description: result.error || "There was an issue processing the final payment",
          variant: "destructive",
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTip = async (amount: number) => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Please sign in to send tips",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    if (balance < amount) {
      toast({
        title: "Insufficient balance",
        description: "Please add more sBTC to your wallet",
        variant: "destructive",
      });
      return;
    }

    if (!content) return;

    setIsSendingTip(true);

    try {
      // Send tip to creator (using mock address for now)
      const creatorAddress = content.creatorAddress || "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7";
      
      const result = await sendPaymentTransaction(creatorAddress, amount);

      if (result.success) {
        toast({
          title: "Tip sent! 🎉",
          description: `You tipped ${amount} sBTC to ${content.creatorName}`,
        });
        setTipAmount("");
        
        // Refresh balance
        await refreshBalance();
      } else {
        toast({
          title: "Tip failed",
          description: result.error || "Unable to send tip",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send tip",
        variant: "destructive",
      });
    } finally {
      setIsSendingTip(false);
    }
  };

  // Check authentication
  useEffect(() => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to watch content",
      });
      navigate("/signin");
    }
  }, [user, navigate, toast]);

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Content not found</h2>
          <Link to="/browse">
            <Button>Back to Browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Video Player */}
      <div className="bg-black">
        <div className="container mx-auto">
          <div className="relative aspect-video bg-black">
            <img 
              src={content.thumbnail} 
              alt={content.title}
              className="w-full h-full object-cover"
            />
            
            {/* Play/Pause Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlayPause}
                disabled={paymentLoading || isCheckingAccess}
                className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? (
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-10 h-10 text-primary" fill="currentColor" />
                ) : (
                  <Play className="w-10 h-10 text-primary ml-1" fill="currentColor" />
                )}
              </button>
            </div>

            {/* Payment Status */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white min-w-[200px]">
              <div className="text-xs text-white/70 mb-1">
                {isCheckingAccess ? 'Checking access...' : hasContentAccess ? 'Streaming' : 'Access required'}
              </div>
              <div className="font-semibold text-primary">{content.price} sBTC/min</div>
              <div className="text-xs mt-2">Watched: {formatTime(watchTime)}</div>
              {streamingSession && (
                <>
                  <div className="text-xs">Spent: {getStreamingStats().totalPaid} sBTC</div>
                  <div className="text-xs">Rate: {getStreamingStats().currentRate} sBTC/min</div>
                </>
              )}
              <div className="text-xs">Balance: {balance.toFixed(8)} sBTC</div>
              {paymentLoading && (
                <div className="text-xs text-primary mt-2 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing payment...
                </div>
              )}
              {paymentError && (
                <div className="text-xs text-red-400 mt-2">
                  Error: {paymentError}
                </div>
              )}
              {!hasContentAccess && !isCheckingAccess && (
                <div className="text-xs text-yellow-400 mt-2">
                  ⚠️ Purchase access to watch
                </div>
              )}
            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate("/browse")}
              className="absolute top-4 left-4 w-10 h-10 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/90 transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title & Info */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={content.creatorAvatar} 
                  alt={content.creatorName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-semibold">{content.creatorName}</div>
                  <div className="text-sm text-muted-foreground">2.4K subscribers</div>
                </div>
                <Button>Subscribe</Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {content.views.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  {content.rating}
                </span>
                <Badge className="capitalize">{content.type}</Badge>
              </div>
            </div>

            {/* Tip Section */}
            <Card className="p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">Support this creator</h3>
              <div className="text-sm text-muted-foreground mb-4">
                Your balance: {balance.toFixed(8)} sBTC
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleTip(0.0001)}
                  disabled={isSendingTip || balance < 0.0001}
                >
                  {isSendingTip ? <Loader2 className="w-4 h-4 animate-spin" /> : '0.0001 sBTC'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleTip(0.0005)}
                  disabled={isSendingTip || balance < 0.0005}
                >
                  {isSendingTip ? <Loader2 className="w-4 h-4 animate-spin" /> : '0.0005 sBTC'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleTip(0.001)}
                  disabled={isSendingTip || balance < 0.001}
                >
                  {isSendingTip ? <Loader2 className="w-4 h-4 animate-spin" /> : '0.001 sBTC'}
                </Button>
              </div>
              <div className="flex gap-3">
                <Input
                  type="number"
                  step="0.00000001"
                  placeholder="Custom amount"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  disabled={isSendingTip}
                />
                <Button 
                  onClick={() => tipAmount && handleTip(parseFloat(tipAmount))}
                  disabled={!tipAmount || isSendingTip || balance < parseFloat(tipAmount || '0')}
                >
                  {isSendingTip ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Tip'
                  )}
                </Button>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">About</h3>
              <p className="text-muted-foreground">
                Deep dive into the Bitcoin halving event and what it means for the cryptocurrency market. 
                We'll explore the technical aspects, historical data, and potential impact on price.
              </p>
              <div className="flex gap-2 mt-4">
                <Badge variant="secondary">Bitcoin</Badge>
                <Badge variant="secondary">Education</Badge>
                <Badge variant="secondary">Crypto</Badge>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Stats */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Your Session</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Watch time</div>
                  <div className="text-2xl font-bold">{formatTime(watchTime)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Amount streamed</div>
                  <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {amountStreamed.toFixed(8)} sBTC
                  </div>
                </div>
              </div>
            </Card>

            {/* Related Content */}
            <div>
              <h3 className="font-bold mb-4">Related Content</h3>
              <div className="space-y-4">
                {relatedContent.map((item) => (
                  <Link key={item.id} to={`/watch/${item.id}`}>
                    <Card className="p-3 hover:shadow-card-hover transition-all cursor-pointer">
                      <div className="flex gap-3">
                        <img 
                          src={item.thumbnail} 
                          alt={item.title}
                          className="w-32 h-20 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                            {item.title}
                          </h4>
                          <div className="text-xs text-muted-foreground">
                            {item.creatorName}
                          </div>
                          <div className="text-xs font-semibold bg-gradient-primary bg-clip-text text-transparent mt-1">
                            {item.price} sBTC/min
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}