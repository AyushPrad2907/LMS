(function() {
  // Load saved theme from localStorage, default to 'light'
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  // Apply the theme to the document element
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Once DOM is loaded, inject the toggle button
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle-btn';
    btn.title = 'Toggle Light/Dark Mode';
    
    // Set initial icon based on theme
    btn.innerHTML = currentTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    
    // Append to body
    document.body.appendChild(btn);

    // Toggle logic
    btn.addEventListener('click', () => {
      let theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
      }
    });
  });
})();
