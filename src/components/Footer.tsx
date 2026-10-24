import { useState } from "react";

const Footer = () => {
  return (
    <footer className="w-full py-8 border-t mt-12 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center gap-4">
        
        {/* Brand Section */}
        <p className="text-sm font-medium text-muted-foreground">
          Precision Typing © 2026 | Developed by <span className="text-primary font-bold">NK</span>
        </p>

        {/* Links Section */}
        <div className="flex gap-6 text-xs text-muted-foreground">
          <button 
            onClick={() => window.alert(
              "Privacy Policy:\n\n" +
              "1. We do not collect any personal identification information.\n" +
              "2. Your typing scores and data are stored locally on your browser.\n" +
              "3. We use anonymous analytics to monitor website traffic."
            )}
            className="hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Privacy Policy
          </button>
          <span className="cursor-default">|</span>
          <p className="cursor-default">Exam-Standard Interface</p>
          <span className="cursor-default">|</span>
          <p className="cursor-default">Secure & Private</p>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;