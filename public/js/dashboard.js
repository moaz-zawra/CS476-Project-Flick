// Function to handle the share button click
function handleShareButtonClick(setID) {
    document.getElementById('share-modal').classList.remove('hidden');

    // Set up the share button action
    document.getElementById('confirm-share').onclick = () => {
        const username = document.getElementById('username-input').value;
        if (username) {
            // Create a form to submit the share data
            const form = document.createElement('form');
            form.action = '/api/shareSet';
            form.method = 'post';
            form.style.display = 'none';

            // Add username input
            const usernameInput = document.createElement('input');
            usernameInput.type = 'hidden';
            usernameInput.name = 'username';
            usernameInput.value = username;
            form.appendChild(usernameInput);

            // Add setID input
            const setIDInput = document.createElement('input');
            setIDInput.type = 'hidden';
            setIDInput.name = 'setID';
            setIDInput.value = setID;
            form.appendChild(setIDInput);

            // Append form to document and submit it
            document.body.appendChild(form);
            form.submit();
            
            document.getElementById('share-modal').classList.add('hidden');
        } else {
            alert('Please enter a username');
        }
    };

    // Cancel share action
    document.getElementById('cancel-share').onclick = () => {
        document.getElementById('share-modal').classList.add('hidden');
    };
}

// Function to handle the report button click
function handleReportButtonClick(setID) {
    document.getElementById('report-modal').classList.remove('hidden');

    // Set up the report button action
    document.getElementById('confirm-report').onclick = () => {
        const reason = document.getElementById('reason-input').value;
        if (reason) {
            // Create a form to submit the report data
            const form = document.createElement('form');
            form.action = '/api/reportSet';
            form.method = 'post';
            form.style.display = 'none';

            // Add reason input
            const reasonInput = document.createElement('input');
            reasonInput.type = 'hidden';
            reasonInput.name = 'reason';
            reasonInput.value = reason;
            form.appendChild(reasonInput);

            // Add setID input
            const setIDInput = document.createElement('input');
            setIDInput.type = 'hidden';
            setIDInput.name = 'setID';
            setIDInput.value = setID;
            form.appendChild(setIDInput);

            // Append form to document and submit it
            document.body.appendChild(form);
            form.submit();
            
            document.getElementById('report-modal').classList.add('hidden');
        } else {
            alert('Please enter a reason');
        }
    };

    // Cancel report action
    document.getElementById('cancel-report').onclick = () => {
        document.getElementById('report-modal').classList.add('hidden');
    };
}

// Function to handle removing a shared set
function handleRemoveSharedSet(setID, setName) {
    document.getElementById('confirmation-modal').classList.remove('hidden');
    document.getElementById('confirmation-message').textContent = `Do you want to remove the shared set "${setName}"?`;
    
    document.getElementById('confirm-delete').onclick = () => {
        const form = document.createElement('form');
        form.action = '/api/removeSharedSet?_method=DELETE';
        form.method = 'post';
        form.style.display = 'none';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'setID';
        input.value = setID;

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        
        document.getElementById('confirmation-modal').classList.add('hidden');
    };
    
    document.getElementById('cancel-delete').onclick = () => {
        document.getElementById('confirmation-modal').classList.add('hidden');
    };
}

// Function to insert a set into the DOM
function insertSet(setID, setName, category, subcategory, shared, publicSet, approved) {
    // Create the main div container for the set
    const setDiv = document.createElement('div');
    setDiv.className = 'inline-flex flex-col items-start bg-surface-light dark:bg-surface-dark p-4 border-2 border-accent-light dark:border-accent-dark rounded-md m-2';

    // Create and populate the set name section
    const setNameDiv = document.createElement('div');
    setNameDiv.className = 'flex items-center gap-2';

    // Set name display
    const setNameSpan = document.createElement('span');
    setNameSpan.className = 'font-mono font-bold text-accent-light dark:text-accent-dark';
    setNameSpan.textContent = setName;
    setNameDiv.appendChild(setNameSpan);

    // Play Button
    const playButton = document.createElement('button');
    playButton.className = 'relative group flex items-center justify-center p-1 bg-transparent hover:opacity-80 transition-opacity';
    playButton.onclick = () => { window.location.href = `/view_set?setID=${setID}&set_type=${shared ? 'shared' : 'regular'}`; };

    const playImg = document.createElement('img');
    playImg.src = 'play.svg';
    playImg.alt = 'Play Icon';
    playImg.className = 'w-6 h-6 invert dark:invert-0';
    playButton.appendChild(playImg);

    const playSpan = document.createElement('span');
    playSpan.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
    playSpan.textContent = 'Play Set';
    playButton.appendChild(playSpan);

    // Append Play Button beside the set name
    setNameDiv.appendChild(playButton);

    // Create the category section
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'flex flex-col items-start gap-1 mt-1';

    const categorySpan = document.createElement('span');
    categorySpan.className = 'bg-primary-light dark:bg-primary-dark text-accent-light dark:text-accent-dark px-2 py-1 rounded-md';
    categorySpan.textContent = getCategoryName(category, window.categoryNames);
    categoryDiv.appendChild(categorySpan);

    // Create the subcategory section
    const subcategorySpan = document.createElement('span');
    subcategorySpan.className = 'bg-secondary-light dark:bg-secondary-dark text-accent-light dark:text-accent-dark px-2 py-1 rounded-md';
    subcategorySpan.textContent = subcategory;
    categoryDiv.appendChild(subcategorySpan);

    // Check if the set is public
    if (publicSet) {
        const publicSetSpan = document.createElement('span');
        publicSetSpan.className = 'bg-info-light dark:bg-info-dark text-accent-light dark:text-accent-dark px-2 py-1 rounded-md';
        publicSetSpan.textContent = 'Public Set';
        categoryDiv.appendChild(publicSetSpan);

        const approvedSpan = document.createElement('span');
        approvedSpan.className = 'bg-warning-light dark:bg-warning-dark text-accent-light dark:text-accent-dark px-2 py-1 rounded-md';
        approvedSpan.textContent = approved ? 'Approved' : 'Not Approved';
        categoryDiv.appendChild(approvedSpan);
    }

    // Create the buttons section (Share, Edit, Delete) - only for user's own sets
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'flex items-center gap-2 justify-between mt-2 w-full';

    // Button base styling without border
    const buttonBaseClass = 'relative group flex items-center justify-center p-1 bg-transparent hover:opacity-80 transition-opacity';

    // Only add management buttons (share, edit, delete) for sets owned by the user
    if (!shared) {
        const shareButton = document.createElement('button');
        shareButton.className = buttonBaseClass;
        shareButton.onclick = () => {
            handleShareButtonClick(setID);
        };

        const shareImg = document.createElement('img');
        shareImg.src = 'share.svg';
        shareImg.alt = 'Share Icon';
        shareImg.className = 'w-6 h-6 invert dark:invert-0';
        shareButton.appendChild(shareImg);

        const shareSpan = document.createElement('span');
        shareSpan.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
        shareSpan.textContent = 'Share Set';
        shareButton.appendChild(shareSpan);

        // Edit Button
        const editButton = document.createElement('button');
        editButton.className = buttonBaseClass;
        editButton.onclick = () => { window.location.href = `/edit_set?setID=${setID}`; };

        const editImg = document.createElement('img');
        editImg.src = 'edit.svg';
        editImg.alt = 'Edit Icon';
        editImg.className = 'w-6 h-6 invert dark:invert-0';
        editButton.appendChild(editImg);

        const editSpan = document.createElement('span');
        editSpan.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
        editSpan.textContent = 'Edit Set';
        editButton.appendChild(editSpan);

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.className = buttonBaseClass;
        deleteButton.onclick = () => {
            document.getElementById('confirmation-modal').classList.remove('hidden');
            document.getElementById('confirmation-message').textContent = `Do you want to delete the set "${setName}"?`;
            document.getElementById('confirm-delete').onclick = () => {
                const form = document.createElement('form');
                form.action = '/api/deleteSet?_method=DELETE';
                form.method = 'post';
                form.style.display = 'none';

                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'setID';
                input.value = setID;

                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
            };
        };

        const deleteImg = document.createElement('img');
        deleteImg.src = 'delete.svg';
        deleteImg.alt = 'Delete Icon';
        deleteImg.className = 'w-6 h-6 invert dark:invert-0';
        deleteButton.appendChild(deleteImg);

        const deleteSpan = document.createElement('span');
        deleteSpan.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
        deleteSpan.textContent = 'Delete Set';
        deleteButton.appendChild(deleteSpan);

        // Append buttons to button container
        buttonsDiv.appendChild(shareButton);
        buttonsDiv.appendChild(editButton);
        buttonsDiv.appendChild(deleteButton);
    } else {
        // Add Remove button for shared sets
        const removeButton = document.createElement('button');
        removeButton.className = buttonBaseClass;
        removeButton.onclick = () => {
            handleRemoveSharedSet(setID, setName);
        };

        const removeImg = document.createElement('img');
        removeImg.src = 'delete.svg';
        removeImg.alt = 'Remove Icon';
        removeImg.className = 'w-6 h-6 invert dark:invert-0';
        removeButton.appendChild(removeImg);

        const removeSpan = document.createElement('span');
        removeSpan.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
        removeSpan.textContent = 'Remove Set';
        removeButton.appendChild(removeSpan);

        // Append button to button container
        buttonsDiv.appendChild(removeButton);

        // Add Report button for shared sets
        const reportButton = document.createElement('button');
        reportButton.className = buttonBaseClass;
        reportButton.onclick = () => {
            handleReportButtonClick(setID);
        };

        const reportImg = document.createElement('img');
        reportImg.src = 'report.svg';
        reportImg.alt = 'Report Icon';
        reportImg.className = 'w-6 h-6 invert dark:invert-0';
        reportButton.appendChild(reportImg);

        const reportSpan = document.createElement('span');
        reportSpan.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
        reportSpan.textContent = 'Report Set';
        reportButton.appendChild(reportSpan);

        // Append button to button container
        buttonsDiv.appendChild(reportButton);
    }

    // Append everything to the main set div
    setDiv.appendChild(setNameDiv);
    setDiv.appendChild(categoryDiv);
    setDiv.appendChild(buttonsDiv);

    // Append the set div to the correct container
    const container = shared ? document.getElementById('shared-sets') : document.getElementById('user-sets');
    container.appendChild(setDiv);
}

// Helper function to get category name by key
function getCategoryName(key, categoryNames) {
    return categoryNames[key] || '';
}

// Set up category filters and event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Set up category filters
    const userCategoryFilter = document.getElementById('userCategoryFilter');
    const userSubcategoryFilter = document.getElementById('userSubcategoryFilter');
    const sharedCategoryFilter = document.getElementById('sharedCategoryFilter');
    const sharedSubcategoryFilter = document.getElementById('sharedSubcategoryFilter');
    
    // Only proceed if these elements exist (we're on the dashboard page)
    if (!userCategoryFilter) return;
    
    // Populate category dropdowns with global data
    populateCategoryDropdown(userCategoryFilter, window.categoryNames);
    populateCategoryDropdown(sharedCategoryFilter, window.categoryNames);
    
    // Set up event listeners for category changes
    userCategoryFilter.addEventListener('change', function() {
        const hasSubcategories = populateSubcategoryDropdown(this.value, userSubcategoryFilter, window.subcategoriesData);
        userSubcategoryFilter.classList.toggle('hidden', !hasSubcategories);
        filterSets('user-sets', this.value, userSubcategoryFilter.value);
    });
    
    sharedCategoryFilter.addEventListener('change', function() {
        const hasSubcategories = populateSubcategoryDropdown(this.value, sharedSubcategoryFilter, window.subcategoriesData);
        sharedSubcategoryFilter.classList.toggle('hidden', !hasSubcategories);
        filterSets('shared-sets', this.value, sharedSubcategoryFilter.value);
    });
    
    // Set up event listeners for subcategory changes
    userSubcategoryFilter.addEventListener('change', function() {
        filterSets('user-sets', userCategoryFilter.value, this.value);
    });
    
    sharedSubcategoryFilter.addEventListener('change', function() {
        filterSets('shared-sets', sharedCategoryFilter.value, this.value);
    });
});

// Function to filter sets based on category and subcategory
function filterSets(containerId, categoryValue, subcategoryValue) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const sets = container.querySelectorAll('div[class*="inline-flex"]');
    
    sets.forEach(set => {
        let showSet = true;
        
        // Check category if filter is active
        if (categoryValue !== '') {
            const setCategorySpan = set.querySelector('span.bg-primary-light');
            const setCategory = setCategorySpan ? setCategorySpan.textContent : '';
            const categoryMatch = getCategoryName(categoryValue, window.categoryNames) === setCategory;
            
            if (!categoryMatch) {
                showSet = false;
            }
            
            // Check subcategory if filter is active
            if (showSet && subcategoryValue !== '') {
                const setSubcategorySpan = set.querySelector('span.bg-secondary-light');
                const setSubcategory = setSubcategorySpan ? setSubcategorySpan.textContent : '';
                
                if (setSubcategory !== subcategoryValue) {
                    showSet = false;
                }
            }
        }
        
        // Show/hide the set
        set.style.display = showSet ? '' : 'none';
    });
}

// Helper function to populate category dropdown
function populateCategoryDropdown(dropdown, categoryNames) {
    if (!dropdown) return;
    
    const categoryOptions = Object.keys(categoryNames).map(key => {
        return `<option value="${key}">${getCategoryName(key, categoryNames)}</option>`;
    }).join('');
    dropdown.innerHTML = '<option value="">Select Category</option>' + categoryOptions;
}

// Helper function to populate subcategory dropdown
function populateSubcategoryDropdown(categoryKey, dropdown, subcategories) {
    if (!dropdown) return false;
    
    const subcategoryList = getSubcategoriesForCategory(categoryKey, subcategories);
    if (!subcategoryList || subcategoryList.length === 0) {
        dropdown.innerHTML = '<option value="">All Subcategories</option>';
        return false;
    }
    const subcategoryOptions = Object.entries(subcategoryList).map(([key, value]) => {
        if (!isNaN(Number(key))) return '';
        return `<option value="${value}">${value}</option>`;
    }).join('');
    dropdown.innerHTML = '<option value="">All Subcategories</option>' + subcategoryOptions;
    return true;
}
// Theme toggle function
function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
}

// Initialize theme based on saved preference
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.checked = true;
    } else {
        document.documentElement.classList.remove('dark');
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.checked = false;
    }
});
