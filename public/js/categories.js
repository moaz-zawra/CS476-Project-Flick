// Get category name from category ID using the provided categoryNames
function getCategoryName(categoryId, categoryNames) {
    // If categoryNames is provided, use it directly
    if (categoryNames && categoryNames[categoryId]) {
        return categoryNames[categoryId];
    }
    
    const categories = {
        '0': 'Language',
        '1': 'Technology',
        '2': 'Course Subjects',
        '3': 'Law',
        '4': 'Medical',
        '5': 'Military'
    };
    
    return categories[categoryId] || 'Unknown Category';
}

function getSubcategoriesForCategory(categoryId, subcategories) {
    return subcategories && subcategories[categoryId] || [];
}
function populateCategoryDropdown(selectElement, categoryNames, includeDefaultOption = true) {
    if (!categoryNames) return;
    
    while (selectElement.options.length > 0) {
        selectElement.remove(0);
    }
    
    if (includeDefaultOption) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Category';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        selectElement.appendChild(defaultOption);
    }
    
    // Add all categories
    Object.entries(categoryNames).forEach(([key, name]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = name;
        selectElement.appendChild(option);
    });
}

// Populate subcategory dropdown based on selected category
function populateSubcategoryDropdown(categoryId, subcategorySelect, subcategories, includeDefaultOption = true) {
    if (!subcategories) return false;
    
    // Clear existing options
    while (subcategorySelect.options.length > 0) {
        subcategorySelect.remove(0);
    }
    
    // Add default option if requested
    if (includeDefaultOption) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All Subcategories';
        subcategorySelect.appendChild(defaultOption);
    }
    
    // Get subcategories for the selected category
    const subcategoriesObj = subcategories[categoryId];
    if (!subcategoriesObj) return false;
    
    // Add subcategories to dropdown
    Object.entries(subcategoriesObj).forEach(([key, value]) => {
        // Skip numeric keys which are enum indices
        if (!isNaN(Number(key))) return;
        
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        subcategorySelect.appendChild(option);
    });
    
    return true;
}

