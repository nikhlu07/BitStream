// Make the REAL Turnkey modal look beautiful
(function() {
  const fixTurnkeyModal = () => {
    // Find all modals
    const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
    
    // Debug: Log modal detection
    if (modals.length > 0) {
      console.log('🔍 Found', modals.length, 'modals');
    }
    
    modals.forEach(modal => {
      const text = modal.textContent || '';
      
      // Remove warning modals completely
      if (text.includes('Turnkey styles are missing')) {
        modal.remove();
        console.log('🗑️ Removed warning modal');
        return;
      }
      
      // Fix the REAL authentication modal
      if ((text.includes('Log in') || text.includes('sign up') || modal.querySelector('input')) && 
          !modal.hasAttribute('data-styled')) {
        
        modal.setAttribute('data-styled', 'true');
        
        console.log('🎨 Styling real Turnkey modal');
        
        // Style the modal container
        modal.style.cssText = `
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 450px !important;
          max-width: 90vw !important;
          background: white !important;
          border-radius: 8px !important;
          padding: 0 !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          z-index: 9999 !important;
          border: none !important;
        `;
        
        // Style the content wrapper
        const contentDiv = modal.querySelector('div');
        if (contentDiv) {
          contentDiv.style.cssText = `
            padding: 2rem !important;
            width: 100% !important;
            box-sizing: border-box !important;
          `;
        }
        
        // Style the heading
        const headings = modal.querySelectorAll('h1, h2, h3');
        headings.forEach(heading => {
          heading.style.cssText = `
            font-size: 1.5rem !important;
            font-weight: bold !important;
            margin-bottom: 1.5rem !important;
            color: #1f2937 !important;
            text-align: left !important;
          `;
        });
        
        // Style paragraphs
        const paragraphs = modal.querySelectorAll('p');
        paragraphs.forEach(p => {
          p.style.cssText = `
            font-size: 0.875rem !important;
            color: #6b7280 !important;
            margin-bottom: 1.5rem !important;
            line-height: 1.5 !important;
          `;
        });
        
        // Style inputs
        const inputs = modal.querySelectorAll('input');
        inputs.forEach(input => {
          input.style.cssText = `
            width: 100% !important;
            padding: 0.75rem !important;
            border: 1px solid #d1d5db !important;
            border-radius: 0.375rem !important;
            font-size: 1rem !important;
            margin-bottom: 1rem !important;
            box-sizing: border-box !important;
            background: white !important;
          `;
          
          // Add focus styles
          input.addEventListener('focus', () => {
            input.style.borderColor = '#f97316 !important';
            input.style.outline = 'none !important';
            input.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1) !important';
          });
          
          input.addEventListener('blur', () => {
            input.style.borderColor = '#d1d5db !important';
            input.style.boxShadow = 'none !important';
          });
        });
        
        // Style buttons
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => {
          const buttonText = button.textContent || '';
          
          // Don't style close buttons
          if (buttonText.includes('×') || buttonText.includes('Close')) {
            button.style.cssText = `
              position: absolute !important;
              top: 1rem !important;
              right: 1rem !important;
              background: none !important;
              border: none !important;
              font-size: 1.5rem !important;
              color: #6b7280 !important;
              cursor: pointer !important;
              padding: 0.25rem !important;
              line-height: 1 !important;
            `;
            return;
          }
          
          // Style main action buttons
          button.style.cssText = `
            width: 100% !important;
            padding: 0.75rem 1.5rem !important;
            background: linear-gradient(to right, #f97316, #ea580c) !important;
            color: white !important;
            border: none !important;
            border-radius: 0.375rem !important;
            font-size: 1rem !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            margin-top: 0.5rem !important;
          `;
          
          // Add hover effects
          button.addEventListener('mouseenter', () => {
            button.style.background = 'linear-gradient(to right, #ea580c, #dc2626) !important';
          });
          
          button.addEventListener('mouseleave', () => {
            button.style.background = 'linear-gradient(to right, #f97316, #ea580c) !important';
          });
        });
        
        // Add "Secured by Turnkey" text if not present
        if (!text.includes('Secured by Turnkey')) {
          const securedText = document.createElement('p');
          securedText.textContent = 'Secured by Turnkey';
          securedText.style.cssText = `
            font-size: 0.75rem !important;
            color: #6b7280 !important;
            text-align: center !important;
            margin-top: 1rem !important;
            margin-bottom: 0 !important;
          `;
          
          const contentDiv = modal.querySelector('div');
          if (contentDiv) {
            contentDiv.appendChild(securedText);
          }
        }
        
        console.log('✅ Real Turnkey modal styled beautifully');
      }
    });
  };

  // Run immediately and frequently to catch modals
  fixTurnkeyModal();
  setInterval(fixTurnkeyModal, 100);
  
  // Watch for DOM changes
  const observer = new MutationObserver(fixTurnkeyModal);
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  console.log('🎯 Real Turnkey modal beautifier active');
  
  // Debug: Log when script loads
  console.log('📍 Script loaded at:', new Date().toISOString());
})();