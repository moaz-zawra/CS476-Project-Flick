// Color scheme configuration for Flick application
window.tailwindConfig = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Dark theme
                'bg-dark': '#1a1a2e',          // Deep navy blue
                'surface-dark': '#16213e',     // Slightly lighter navy
                'surface-dark-lighter': '#1f2b4d', // Even lighter navy for subcategories
                'text-dark': '#e2e2e2',        // Off-white text
                'accent-dark': '#4d908e',      // Teal accent
                'highlight-dark': '#f05454',   // Coral red highlight
                'contrast-dark': '#1565C0',    // Dark blue

                // Light theme
                'bg-light': '#FFE082',         // Amber for better contrast
                'surface-light': '#ffffff',    // Pure white
                'text-light': '#212121',       // Black
                'accent-light': '#212121',     // Black accent
                'button-accent-light': '#d3d3d3',     // Light gray accent
                'highlight-light': '#e63946',  // Soft red highlight
                'contrast-light': '#4d908e',   // Teal green
                'main-button-light': '#4CAF50',  // Light green
                'secondary-button-light': '#4FC3F7',    // Sky blue

                // Additional colors
                'primary-dark': '#0f3460',     // Deep blue for emphasis
                'primary-light': '#a8dadc',    // Light blue for emphasis
                'secondary-dark': '#533483',   // Deep purple for secondary elements
                'secondary-light': '#90e0ef'   // Light cyan for secondary elements
            },
            boxShadow: {
                'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }
        }
    }
};

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
}

// Initialize theme based on localStorage or media query after DOM loads
document.addEventListener("DOMContentLoaded", function() {
    const themeToggle = document.getElementById('theme-toggle');
    if (localStorage.theme === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        if (themeToggle) {
            themeToggle.checked = true;
        }
    } else {
        document.documentElement.classList.remove('dark');
        if (themeToggle) {
            themeToggle.checked = false;
        }
    }
});
