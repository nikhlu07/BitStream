import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Zap, Mail, User, CheckCircle2, Eye, Video, Wallet as WalletIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createUserWallet, isLoading: walletLoading } = useWallet();
  
  const [accountType, setAccountType] = useState<"creator" | "viewer">(
    (searchParams.get("type") as "creator" | "viewer") || "viewer"
  );
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const isLoading = isCreating || walletLoading;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs based on account type
    if (accountType === "viewer") {
      if (!agreedToTerms) {
        toast({
          title: "Please agree to terms",
          description: "You must agree to the Terms of Service and Privacy Policy",
          variant: "destructive",
        });
        return;
      }
    } else {
      // For creators, need email and username
      if (!email || !username || !agreedToTerms) {
        toast({
          title: "Missing information",
          description: "Please fill in all fields and agree to the terms.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsCreating(true);
    
    try {
      // Prepare user data based on account type
      const userEmail = accountType === "viewer" 
        ? `viewer_${Date.now()}@bitstream.local` // Anonymous email for viewers
        : email;
      
      const userUsername = accountType === "viewer"
        ? `viewer_${Math.random().toString(36).substring(2, 8)}` // Auto-generated username
        : username;
      
      console.log('🚀 Creating wallet for:', userUsername);
      
      // Create wallet using Turnkey
      const result = await createUserWallet(userEmail, userUsername);
      
      if (result.success && result.data) {
        const walletAddress = result.data.walletAddress;
        toast({
          title: "Welcome to BitStream!",
          description: accountType === "viewer" 
            ? `Your anonymous wallet has been created securely. Address: ${walletAddress}`
            : "Your account and wallet have been created successfully",
        });
        
        // Navigate based on account type
        if (accountType === "creator") {
          navigate("/dashboard");
        } else {
          navigate("/browse");
        }
      } else {
        toast({
          title: "Wallet creation failed",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during signup:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex bg-gradient-primary p-12 flex-col justify-center items-center text-white">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <Zap className="w-8 h-8" />
            <span className="text-3xl font-bold">BitStream</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-6">Join BitStream</h2>
          <p className="text-xl mb-8 text-white/90">
            Start monetizing exclusive content in minutes
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
              <span className="text-lg">Anonymous account creation</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
              <span className="text-lg">Instant wallet generation</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
              <span className="text-lg">Pre-loaded testnet sBTC</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
              <span className="text-lg">No credit card required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">Get started with BitStream</p>
          </div>

          {/* Account Type Selector */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setAccountType("creator")}
              className={`p-4 rounded-lg border-2 transition-all ${
                accountType === "creator"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Video className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="font-semibold">I'm a Creator</div>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("viewer")}
              className={`p-4 rounded-lg border-2 transition-all ${
                accountType === "viewer"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Eye className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="font-semibold">I'm a Viewer</div>
            </button>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            {accountType === "creator" ? (
              // Creator Flow - Email & Username
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Choose Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="creator_name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">This will be your public identity</p>
                </div>

                <Card className="p-4 bg-muted/50">
                  <h3 className="font-semibold mb-2">Secure Your Account</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    We'll create a secure passkey for your device
                  </p>
                  <div className="bg-primary/10 p-3 rounded-lg text-sm">
                    🔐 Your passkey is stored securely on your device. No passwords to remember!
                  </div>
                </Card>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm leading-tight">
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account & Generate Wallet"}
                </Button>
              </>
            ) : (
              // Viewer Flow - Wallet Only
              <>
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary-light/10 border-primary/20">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <WalletIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Anonymous Wallet Access</h3>
                      <p className="text-sm text-muted-foreground">
                        No email required. We'll generate a secure Bitcoin wallet for you instantly.
                      </p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-left">Completely anonymous viewing</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-left">Pre-loaded with 0.1 testnet sBTC</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-left">No personal information collected</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-left">Start watching instantly</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms-viewer"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <label htmlFor="terms-viewer" className="text-sm leading-tight">
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  disabled={isLoading || !agreedToTerms}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Generating Wallet...
                    </>
                  ) : (
                    <>
                      <WalletIcon className="w-5 h-5 mr-2" />
                      Generate Wallet & Start Watching
                    </>
                  )}
                </Button>
              </>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="text-center">
              <Link to="/signin" className="text-sm text-primary hover:underline">
                Already have an account? Sign In
              </Link>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              🔒 Your wallet and keys are generated securely using Turnkey's infrastructure
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}