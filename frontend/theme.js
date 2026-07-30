(function() {
  // Load saved theme from localStorage, default to 'dark'
  const currentTheme = localStorage.getItem('theme') || 'dark';
  
  // Apply the theme to the document element
  if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  // Once DOM is loaded, inject the toggle button
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle-btn';
    btn.title = 'Toggle Light/Dark Mode';
    
    // Set initial icon based on theme
    btn.innerHTML = currentTheme === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    
    // Append to body
    document.body.appendChild(btn);

    // Toggle logic
    btn.addEventListener('click', () => {
      let theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
      }
    });
  });
})();
