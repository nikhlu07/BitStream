// JavaScript solution to ensure ONLY ONE properly formatted Turnkey modal
export function fixTurnkeyModal() {
  let lastModalCount = 0;
  
  // Run every 50ms to catch modals quickly
  const interval = setInterval(() => {
    const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
    
    // If we have multiple modals, keep only the last one (most recent)
    if (modals.length > 1) {
      console.log(`🗑️ Found ${modals.length} modals, keeping only the last one`);
      
      // Remove all but the last modal
      for (let i = 0; i < modals.length - 1; i++) {
        modals[i].remove();
      }
    }
    
    // Now work with the remaining modal(s)
    const remainingModals = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
    
    remainingModals.forEach(modal => {
      const text = modal.textContent || '';
      
      // If it's the warning modal, REMOVE IT COMPLETELY
      if (text.includes('Turnkey styles are missing') || 
          text.includes('styles are missing') ||
          text.includes('import "@turnkey/react-wallet-kit/styles.css"')) {
        modal.remove();
        console.log('🗑️ Removed Turnkey warning modal');
        return;
      }
      
      // Fix the modal width and content
      modal.style.setProperty('width', '90vw', 'important');
      modal.style.setProperty('min-width', '500px', 'important');
      modal.style.setProperty('max-width', '700px', 'important');
      
      // Fix all child elements
      const allElements = modal.querySelectorAll('*');
      allElements.forEach(el => {
        el.style.setProperty('white-space', 'normal', 'important');
        el.style.setProperty('word-wrap', 'break-word', 'important');
        el.style.setProperty('max-width', 'none', 'important');
        el.style.setProperty('width', 'auto', 'important');
      });
      
      // Fix input fields specifically
      const inputs = modal.querySelectorAll('input');
      inputs.forEach(input => {
        input.style.setProperty('width', '100%', 'important');
        input.style.setProperty('min-width', '300px', 'important');
        input.style.setProperty('padding', '12px', 'important');
        input.style.setProperty('font-size', '16px', 'important');
      });
      
      if (remainingModals.length !== lastModalCount) {
        console.log('✅ Fixed Turnkey modal - ONE modal only');
        lastModalCount = remainingModals.length;
      }
    });
  }, 50);
  
  // Keep running for longer to catch OTP modal
  setTimeout(() => clearInterval(interval), 60000);
}

// Auto-run when DOM loads
if (typeof window !== 'undefined') {
  // Run IMMEDIATELY and very frequently
  fixTurnkeyModal();
  
  // Also run on DOM ready
  document.addEventListener('DOMContentLoaded', fixTurnkeyModal);
  
  // Run every 10ms for the first 5 seconds to catch modals FAST
  const aggressiveInterval = setInterval(fixTurnkeyModal, 10);
  setTimeout(() => clearInterval(aggressiveInterval), 5000);
}