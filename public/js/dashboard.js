
function handleShareButtonClick(setID) {
    document.getElementById('share-modal').classList.remove('hidden');

    document.getElementById('confirm-share').onclick = () => {
        const username = document.getElementById('username-input').value;
        if (username) {
           
            const form = document.createElement('form');
            form.action = '/api/shareSet';
            form.method = 'post';
            form.style.display = 'none';

           
            const usernameInput = document.createElement('input');
            usernameInput.type = 'hidden';
            usernameInput.name = 'username';
            usernameInput.value = username;
            form.appendChild(usernameInput);

           
            const setIDInput = document.createElement('input');
            setIDInput.type = 'hidden';
            setIDInput.name = 'setID';
            setIDInput.value = setID;
            form.appendChild(setIDInput);

           
            document.body.appendChild(form);
            form.submit();
            
            document.getElementById('share-modal').classList.add('hidden');
        } else {
            alert('Please enter a username');
        }
    };

   
    document.getElementById('cancel-share').onclick = () => {
        document.getElementById('share-modal').classList.add('hidden');
    };
}


function handleReportButtonClick(setID) {
    document.getElementById('report-modal').classList.remove('hidden');

   
    document.getElementById('confirm-report').onclick = () => {
        const reason = document.getElementById('reason-input').value;
        if (reason) {
           
            const form = document.createElement('form');
            form.action = '/api/reportSet';
            form.method = 'post';
            form.style.display = 'none';

           
            const reasonInput = document.createElement('input');
            reasonInput.type = 'hidden';
            reasonInput.name = 'reason';
            reasonInput.value = reason;
            form.appendChild(reasonInput);

           
            const setIDInput = document.createElement('input');
            setIDInput.type = 'hidden';
            setIDInput.name = 'setID';
            setIDInput.value = setID;
            form.appendChild(setIDInput);

           
            document.body.appendChild(form);
            form.submit();
            
            document.getElementById('report-modal').classList.add('hidden');
        } else {
            alert('Please enter a reason');
        }
    };

   
    document.getElementById('cancel-report').onclick = () => {
        document.getElementById('report-modal').classList.add('hidden');
    };
}


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


function insertSet(setID, setName, category, subcategory, shared, publicSet, approved) {
   
    const setDiv = document.createElement('div');
    setDiv.className = 'set-item border-2 border-accent-light dark:border-accent-dark bg-surface-light dark:bg-surface-dark rounded-lg p-4 hover:shadow-lg transition-shadow duration-200';
    setDiv.setAttribute('data-name', setName.toLowerCase());
    setDiv.setAttribute('data-category', category);
    setDiv.setAttribute('data-subcategory', subcategory);

   
    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex flex-col md:flex-row md:items-center justify-between';
    
   
    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex-grow';
    
   
    const setNameH2 = document.createElement('h2');
    setNameH2.className = 'font-mono text-xl font-bold text-accent-light dark:text-accent-dark';
    setNameH2.textContent = setName;
    contentDiv.appendChild(setNameH2);
    
   
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'flex flex-wrap gap-2 mt-2';
    
   
    const categorySpan = document.createElement('span');
    categorySpan.className = 'bg-primary-light dark:bg-primary-dark text-text-light dark:text-text-dark px-2 py-1 rounded-md text-sm';
    categorySpan.textContent = `Category: ${getCategoryName(category, window.categoryNames) || 'Unknown'}`;
    tagsDiv.appendChild(categorySpan);
    
   
    if (subcategory) {
        const subcategorySpan = document.createElement('span');
        subcategorySpan.className = 'bg-secondary-light dark:bg-secondary-dark text-text-light dark:text-text-dark px-2 py-1 rounded-md text-sm';
        subcategorySpan.textContent = `Subcategory: ${subcategory}`;
        tagsDiv.appendChild(subcategorySpan);
    }
    
   
    if (publicSet) {
        const publicSpan = document.createElement('span');
        publicSpan.className = 'bg-highlight-light dark:bg-highlight-dark text-text-light dark:text-text-dark px-2 py-1 rounded-md text-sm';
        publicSpan.textContent = approved ? 'Public (Approved)' : 'Public (Pending)';
        tagsDiv.appendChild(publicSpan);
    }
    
   
    if (shared) {
        const sharedSpan = document.createElement('span');
        sharedSpan.className = 'bg-contrast-light dark:bg-contrast-dark text-text-light dark:text-text-dark px-2 py-1 rounded-md text-sm';
        sharedSpan.textContent = 'Shared with me';
        tagsDiv.appendChild(sharedSpan);
    }
    
    contentDiv.appendChild(tagsDiv);
    
   
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex items-center gap-3 mt-4 md:mt-0';
    
   
    const viewButton = document.createElement('a');
    viewButton.href = `/view_set?setID=${setID}&set_type=${shared ? 'shared' : 'regular'}`;
    viewButton.className = 'relative group flex items-center justify-center p-1 bg-transparent hover:opacity-80 transition-opacity';
    
    const viewImg = document.createElement('img');
    viewImg.src = 'view.svg';
    viewImg.alt = 'View Icon';
    viewImg.className = 'w-6 h-6 invert dark:invert-0';
    viewButton.appendChild(viewImg);
    
    const viewTooltip = document.createElement('span');
    viewTooltip.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
    viewTooltip.textContent = 'View Set';
    viewButton.appendChild(viewTooltip);
    
    actionsDiv.appendChild(viewButton);
    
   
    const playButton = document.createElement('a');
    playButton.href = `/play_set?setID=${setID}&set_type=${shared ? 'shared' : 'regular'}`;
    playButton.className = 'relative group flex items-center justify-center p-1 bg-transparent hover:opacity-80 transition-opacity';
    
    const playImg = document.createElement('img');
    playImg.src = 'play.svg';
    playImg.alt = 'Play Icon';
    playImg.className = 'w-6 h-6 invert dark:invert-0';
    playButton.appendChild(playImg);
    
    const playTooltip = document.createElement('span');
    playTooltip.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
    playTooltip.textContent = 'Play Set';
    playButton.appendChild(playTooltip);
    
    actionsDiv.appendChild(playButton);

   
    if (!shared) {
       
        const editButton = document.createElement('a');
        editButton.href = `/edit_set?setID=${setID}`;
        editButton.className = 'relative group flex items-center justify-center p-1 bg-transparent hover:opacity-80 transition-opacity';
        
        const editImg = document.createElement('img');
        editImg.src = 'edit.svg';
        editImg.alt = 'Edit Icon';
        editImg.className = 'w-6 h-6 invert dark:invert-0';
        editButton.appendChild(editImg);
        
        const editTooltip = document.createElement('span');
        editTooltip.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
        editTooltip.textContent = 'Edit Set';
        editButton.appendChild(editTooltip);
        
        actionsDiv.appendChild(editButton);
        
       
        const shareButton = document.createElement('button');
        shareButton.className = 'relative group flex items-center justify-center p-1 bg-transparent hover:opacity-80 transition-opacity';
        shareButton.onclick = () => {
            handleShareButtonClick(setID);
        };
        
        const shareImg = document.createElement('img');
        shareImg.src = 'share.svg';
        shareImg.alt = 'Share Icon';
        shareImg.className = 'w-6 h-6 invert dark:invert-0';
        shareButton.appendChild(shareImg);
        
        const shareTooltip = document.createElement('span');
        shareTooltip.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
        shareTooltip.textContent = 'Share Set';
        shareButton.appendChild(shareTooltip);
        
        actionsDiv.appendChild(shareButton);
        
       
        const deleteButton = document.createElement('button');
        deleteButton.className = 'relative group flex items-center justify-center p-1 bg-transparent hover:opacity-80 transition-opacity';
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
        
        const deleteTooltip = document.createElement('span');
        deleteTooltip.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
        deleteTooltip.textContent = 'Delete Set';
        deleteButton.appendChild(deleteTooltip);
        
        actionsDiv.appendChild(deleteButton);
    } else {
       
        const removeButton = document.createElement('button');
        removeButton.className = 'relative group flex items-center justify-center p-1 bg-transparent hover:opacity-80 transition-opacity';
        removeButton.onclick = () => {
            handleRemoveSharedSet(setID, setName);
        };
        
        const removeImg = document.createElement('img');
        removeImg.src = 'delete.svg';
        removeImg.alt = 'Remove Icon';
        removeImg.className = 'w-6 h-6 invert dark:invert-0';
        removeButton.appendChild(removeImg);
        
        const removeTooltip = document.createElement('span');
        removeTooltip.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
        removeTooltip.textContent = 'Remove Set';
        removeButton.appendChild(removeTooltip);
        
        actionsDiv.appendChild(removeButton);
        
       
        const reportButton = document.createElement('button');
        reportButton.className = 'relative group flex items-center justify-center p-1 bg-transparent hover:opacity-80 transition-opacity';
        reportButton.onclick = () => {
            handleReportButtonClick(setID);
        };
        
        const reportImg = document.createElement('img');
        reportImg.src = 'report.svg';
        reportImg.alt = 'Report Icon';
        reportImg.className = 'w-6 h-6 invert dark:invert-0';
        reportButton.appendChild(reportImg);
        
        const reportTooltip = document.createElement('span');
        reportTooltip.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
        reportTooltip.textContent = 'Report Set';
        reportButton.appendChild(reportTooltip);
        
        actionsDiv.appendChild(reportButton);
    }
    
   
    flexContainer.appendChild(contentDiv);
    flexContainer.appendChild(actionsDiv);
    setDiv.appendChild(flexContainer);
    
   
    const container = shared ? document.getElementById('shared-sets') : document.getElementById('user-sets');
    container.appendChild(setDiv);
}


function getCategoryName(key, categoryNames) {
    return categoryNames[key] || '';
}


document.addEventListener('DOMContentLoaded', () => {
   
    const userCategoryFilter = document.getElementById('userCategoryFilter');
    const userSubcategoryFilter = document.getElementById('userSubcategoryFilter');
    const sharedCategoryFilter = document.getElementById('sharedCategoryFilter');
    const sharedSubcategoryFilter = document.getElementById('sharedSubcategoryFilter');
    
   
    if (!userCategoryFilter) return;
    
   
    populateCategoryDropdown(userCategoryFilter, window.categoryNames);
    populateCategoryDropdown(sharedCategoryFilter, window.categoryNames);
    
   
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
    
   
    userSubcategoryFilter.addEventListener('change', function() {
        filterSets('user-sets', userCategoryFilter.value, this.value);
    });
    
    sharedSubcategoryFilter.addEventListener('change', function() {
        filterSets('shared-sets', sharedCategoryFilter.value, this.value);
    });
});


function filterSets(containerId, categoryValue, subcategoryValue) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const sets = container.querySelectorAll('.set-item');
    
    sets.forEach(set => {
        let showSet = true;
        
        if (categoryValue !== '') {
            const setCategory = set.getAttribute('data-category');
            if (setCategory !== categoryValue) {
                showSet = false;
            }
            
            if (showSet && subcategoryValue !== '') {
                const setSubcategory = set.getAttribute('data-subcategory');
                if (setSubcategory !== subcategoryValue) {
                    showSet = false;
                }
            }
        }
        
        set.style.display = showSet ? '' : 'none';
    });
}


function populateCategoryDropdown(dropdown, categoryNames) {
    if (!dropdown) return;
    
    const categoryOptions = Object.keys(categoryNames).map(key => {
        return `<option value="${key}">${getCategoryName(key, categoryNames)}</option>`;
    }).join('');
    dropdown.innerHTML = '<option value="">Select Category</option>' + categoryOptions;
}


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

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
}


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