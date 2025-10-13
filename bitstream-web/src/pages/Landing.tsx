import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  Eye, 
  Bitcoin, 
  Wallet, 
  Shield, 
  Lock, 
  Zap, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle2
} from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import dashboardPreview from "@/assets/dashboard-preview.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary-light/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Monetize Exclusive Content
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                With Instant Bitcoin Payments
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Anonymous viewing. Real-time earnings. Zero fees. Built on Bitcoin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup?type=creator">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Earning
                </Button>
              </Link>
              <Link to="/signup?type=consumer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Explore Content
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 rounded-2xl overflow-hidden shadow-elegant max-w-5xl mx-auto animate-slide-up">
            <img 
              src={heroImage} 
              alt="BitStream platform visualization" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            How BitStream Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 hover:shadow-card-hover transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Watch Anonymously</h3>
              <p className="text-muted-foreground mb-6">
                Sign up with just email. No KYC. No tracking. Your viewing habits stay private.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Instant wallet creation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Pre-loaded testnet sBTC</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Pay per second of content</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">One-click tipping</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 hover:shadow-card-hover transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <Bitcoin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Automatic Micropayments</h3>
              <p className="text-muted-foreground mb-6">
                Smart contracts stream tiny sBTC payments in real-time as you watch.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Sub-cent per second rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">No subscriptions needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Pause anytime</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Transparent pricing</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 hover:shadow-card-hover transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Instant Earnings</h3>
              <p className="text-muted-foreground mb-6">
                Get paid immediately. No waiting. No chargebacks. Withdraw to any Bitcoin wallet.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Real-time revenue tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Set your own rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Pseudonymous identity</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Global payments</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* For Creators Section */}
      <section id="for-creators" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Built for Exclusive Content Creators
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Privacy-first monetization for your premium content
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg">Upload podcasts, livestreams, videos, articles</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg">Set flexible per-minute or per-second rates</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg">Track earnings and viewers in real-time</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg">Withdraw sBTC instantly to any wallet</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg">No personal payment details required</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg">Accept payments from anywhere in the world</p>
                </div>
              </div>

              <Link to="/signup?type=creator">
                <Button size="lg">
                  Start Creating
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-elegant">
                <img 
                  src={dashboardPreview} 
                  alt="Creator dashboard preview" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Bank-Grade Security, Maximum Privacy
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 hover:shadow-card-hover transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">No KYC Required</h3>
              <p className="text-sm text-muted-foreground">
                Creators and viewers remain pseudonymous. No identity verification needed.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card-hover transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Non-Custodial Wallets</h3>
              <p className="text-sm text-muted-foreground">
                You control your keys. Turnkey's secure enclave technology protects your funds.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card-hover transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Zero Tracking</h3>
              <p className="text-sm text-muted-foreground">
                No viewing history. No payment data storage. Your activity stays private.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card-hover transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Bitcoin Security</h3>
              <p className="text-sm text-muted-foreground">
                Irreversible payments. No chargebacks. Built on Bitcoin's proven security.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Trusted by Creators Worldwide
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                1,000+
              </div>
              <p className="text-muted-foreground">Active Creators</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                50,000+
              </div>
              <p className="text-muted-foreground">Hours Streamed</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                100K+
              </div>
              <p className="text-muted-foreground">sBTC Earned</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join BitStream and monetize your exclusive content today
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="bg-white text-foreground hover:bg-white/90">
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}