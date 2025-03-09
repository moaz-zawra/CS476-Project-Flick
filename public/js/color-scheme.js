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
                'contrast-dark': '#9d4edd',    // Deep purple
                
                // Light theme
                'bg-light': '#f8f9fa',         // Lighter gray for better contrast
                'surface-light': '#ffffff',    // Pure white
                'text-light': '#2b2d42',       // Dark blue-gray text
                'accent-light': '#457b9d',     // Steel blue accent
                'highlight-light': '#e63946',  // Soft red highlight
                'contrast-light': '#2a9d8f',   // Teal green
                
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