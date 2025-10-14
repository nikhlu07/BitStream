import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Zap, Mail, CheckCircle2, Wallet as WalletIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";

export default function SignIn() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useWallet();
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [signInType, setSignInType] = useState<"creator" | "viewer">("viewer");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signInType === "creator" && !email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (signInType === "viewer" && !walletAddress) {
      toast({
        title: "Wallet address required",
        description: "Please enter your wallet address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await signIn(
        signInType === "creator" ? { email } : { walletAddress }
      );

      if (result.success) {
        toast({
          title: "Welcome back!",
          description: signInType === "creator" ? "Signed in with passkey" : "Wallet connected",
        });
        navigate(signInType === "creator" ? "/dashboard" : "/browse");
      } else {
        toast({
          title: "Authentication failed",
          description: result.error || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Authentication error",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          
          <h2 className="text-4xl font-bold mb-6">Welcome Back</h2>
          <p className="text-xl mb-8 text-white/90">
            Access your BitStream account
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
              <span className="text-lg">Secure passkey authentication</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
              <span className="text-lg">No passwords to remember</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
              <span className="text-lg">Pick up where you left off</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Sign In to BitStream</h1>
            <p className="text-muted-foreground">Welcome back to your account</p>
          </div>

          {/* Sign In Type Selector */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setSignInType("creator")}
              className={`p-4 rounded-lg border-2 transition-all ${
                signInType === "creator"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-semibold">Creator</div>
              <div className="text-xs text-muted-foreground">Email sign in</div>
            </button>
            <button
              type="button"
              onClick={() => setSignInType("viewer")}
              className={`p-4 rounded-lg border-2 transition-all ${
                signInType === "viewer"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-semibold">Viewer</div>
              <div className="text-xs text-muted-foreground">Wallet access</div>
            </button>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            {signInType === "creator" ? (
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

                <Card className="p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-3">
                    We'll use your device's passkey to securely sign you in
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Make sure you're on the device where you created your account
                  </p>
                </Card>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In with Passkey"}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="wallet">Wallet Address</Label>
                  <div className="relative">
                    <WalletIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="wallet"
                      type="text"
                      placeholder="SP2J6ZY..."
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="pl-10 font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary-light/10 border-primary/20">
                  <div className="flex items-start gap-3">
                    <WalletIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">Anonymous Wallet Access</p>
                      <p className="text-muted-foreground">
                        Enter your wallet address to reconnect and continue watching. No other information needed.
                      </p>
                    </div>
                  </div>
                </Card>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <WalletIcon className="w-5 h-5 mr-2" />
                      Connect Wallet
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
              <Link to="/signup" className="text-sm text-primary hover:underline">
                Don't have an account? Sign Up
              </Link>
            </div>

            <div className="text-center">
              <button type="button" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Lost access to your device?
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}