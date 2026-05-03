;(function() {
  try {
    var theme = localStorage.getItem('theme-storage');
    if (theme) {
      theme = JSON.parse(theme).state.theme;
    }
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.add('light');
    }
  } catch(e) {}
})();
