// Simple script to remove the red warning modal
(function() {
  const removeWarning = () => {
    // Find any element containing the warning text
    const allElements = document.querySelectorAll('*');
    for (let el of allElements) {
      if (el.textContent && el.textContent.includes('Turnkey styles are missing')) {
        // Find the modal container and remove it
        let parent = el;
        while (parent && parent !== document.body) {
          if (parent.style.position === 'fixed' || 
              parent.style.zIndex > 1000 ||
              parent.getAttribute('role') === 'dialog') {
            parent.style.display = 'none';
            parent.remove();
            console.log('Removed warning modal');
            break;
          }
          parent = parent.parentElement;
        }
        break;
      }
    }
  };

  // Run immediately
  removeWarning();
  
  // Run every 100ms
  setInterval(removeWarning, 100);
})();