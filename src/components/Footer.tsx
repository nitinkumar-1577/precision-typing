import { useState } from "react";

const Footer = () => {
  return (
    <footer className="w-full py-8 border-t mt-12 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center gap-4">
        
        {/* Aapka Brand Name */}
        <p className="text-sm font-medium text-muted-foreground">
          Precision Typing © 2026 | Developed by <span className="text-primary font-bold">NK</span>
        </p>

        {/* Links */}
        <div className="flex gap-6 text-xs text-muted-foreground">
          <button 
            onClick={() => window.alert("Privacy Policy:\n1. Hum aapka koi personal data collect nahi karte.\n2. Aapka typing score sirf aapke browser mein save hota hai.\n3. Hum anonymous traffic analytics use karte hain.")}
            className="hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Privacy Policy
          </button>
          <span className="cursor-default">|</span>
          <p className="cursor-default">Exam-Standard Interface</p>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;