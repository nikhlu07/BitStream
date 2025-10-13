import { Link } from "react-router-dom";
import { Zap, Twitter, Github } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="logo.svg" className="h-5 w-auto"/>
            </div>
            <p className="text-sm text-background/70">
              Monetize exclusive content with instant Bitcoin payments
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#for-creators" className="hover:text-primary transition-colors">Features</a></li>
              <li><Link to="/browse" className="hover:text-primary transition-colors">Browse Content</Link></li>
            </ul>
          </div>

          {/*<div>*/}
          {/*  <h4 className="font-semibold mb-4">Resources</h4>*/}
          {/*  <ul className="space-y-2 text-sm text-background/70">*/}
          {/*    <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>*/}
          {/*    <li><a href="#" className="hover:text-primary transition-colors">API</a></li>*/}
          {/*    <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>*/}
          {/*  </ul>*/}
          {/*</div>*/}

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              {/*<a href="#" className="text-background/70 hover:text-primary transition-colors">*/}
              {/*  <Twitter className="w-5 h-5" />*/}
              {/*</a>*/}
              <a href="https://github.com/nikhlu07/BitStream" className="text-background/70 hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-background/70">
          <p>&copy; 2025 BitStream. All rights reserved.</p>
          {/*<div className="flex gap-6 mt-4 md:mt-0">*/}
          {/*  <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>*/}
          {/*  <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>*/}
          {/*</div>*/}
        </div>
      </div>
    </footer>
  );
};