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


function insertSet(setID, setName, description, category, subcategory, shared, publicSet, approved, setType = null, containerId = null, createdBy = null, views = null, creationDate = null) {
    const setDiv = document.createElement('div');
    setDiv.className = 'set-item border-2 border-accent-light dark:border-accent-dark bg-surface-light dark:bg-surface-dark rounded-lg p-4 hover:shadow-lg transition-shadow duration-200';
    setDiv.setAttribute('data-name', setName.toLowerCase());
    setDiv.setAttribute('data-category', category);
    setDiv.setAttribute('data-subcategory', subcategory);
  
    const containerWrapper = document.createElement('div');
    containerWrapper.className = 'h-full flex flex-col justify-between';

    const topSection = document.createElement('div');
  
    const setNameH2 = document.createElement('h2');
    setNameH2.className = 'font-mono text-xl font-bold text-accent-light dark:text-accent-dark mb-2';
    setNameH2.textContent = setName;
    topSection.appendChild(setNameH2);
  
    const descriptionText = description ? description : "No description available";
    const descriptionP = document.createElement('p');
    descriptionP.className = 'text-text-light dark:text-text-dark text-base mb-4 line-clamp-3';
    descriptionP.textContent = descriptionText;
    topSection.appendChild(descriptionP);

    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'flex flex-wrap gap-2 mb-4';
  
    const categorySpan = document.createElement('span');
    categorySpan.className = 'px-2 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-sm';
    categorySpan.textContent = `Category: ${getCategoryName(category, window.categoryNames) || 'Unknown'}`;
    tagsDiv.appendChild(categorySpan);
  
    if (subcategory) {
      const subcategorySpan = document.createElement('span');
      subcategorySpan.className = 'px-2 py-1 rounded bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-sm';
      subcategorySpan.textContent = `Subcategory: ${subcategory}`;
      tagsDiv.appendChild(subcategorySpan);
    }
  
    if (publicSet) {
      const publicSpan = document.createElement('span');
      if (approved) {
        publicSpan.className = 'px-2 py-1 rounded bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-sm';
      } else {
        publicSpan.className = 'px-2 py-1 rounded bg-orange-200 dark:bg-orange-800 text-red-800 dark:text-orange-200 text-sm';
      }
      publicSpan.textContent = `Public (${approved ? 'Approved' : 'Pending'})`;
      tagsDiv.appendChild(publicSpan);
    }

    const contentWrapper = document.createElement('div');
    contentWrapper.appendChild(topSection);
    contentWrapper.appendChild(tagsDiv);
    containerWrapper.appendChild(contentWrapper);
  
    const bottomSection = document.createElement('div');
    
    // Add metadata if this is a public set
    if (setType === 'public' && createdBy) {
      const metaDiv = document.createElement('div');
      
      // Creator and views info
      const infoDiv = document.createElement('div');
      infoDiv.className = 'flex items-center gap-4 mb-2';
      
      const creatorSpan = document.createElement('span');
      creatorSpan.className = 'text-text-light dark:text-text-dark';
      creatorSpan.textContent = `Created by: ${createdBy}`;
      infoDiv.appendChild(creatorSpan);
      
      if (views !== null) {
        const viewsSpan = document.createElement('span');
        viewsSpan.className = 'text-text-light dark:text-text-dark';
        viewsSpan.textContent = `Views: ${views}`;
        infoDiv.appendChild(viewsSpan);
      }
      metaDiv.appendChild(infoDiv);
      
      // Creation date
      if (creationDate) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'text-sm text-gray-500 dark:text-gray-400 mb-3';
        const formattedDate = new Date(creationDate).toLocaleString("en-US", { 
          weekday: 'short',
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit' 
        });
        dateDiv.textContent = `Posted on: ${formattedDate}`;
        metaDiv.appendChild(dateDiv);
      }
      
      bottomSection.appendChild(metaDiv);
    }
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'flex items-center gap-3';

    function createIconButton(href, imgSrc, altText, tooltipText, clickHandler) {
      const btn = document.createElement(href ? 'a' : 'button');
      if (href) {
        btn.href = href;
      }
      btn.className = 'relative group flex items-center justify-center p-1 bg-transparent hover:opacity-80 transition-opacity';
      if (clickHandler) {
        btn.onclick = clickHandler;
      }
  
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = altText;
      img.className = 'invert dark:invert-0';
      img.setAttribute("style", "width:24px !important; height:24px !important; flex-shrink:0 !important;");
      btn.appendChild(img);
  
      const tooltip = document.createElement('span');
      tooltip.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
      tooltip.textContent = tooltipText;
      btn.appendChild(tooltip);
      
      return btn;
    }
  
    // Determine the proper URL parameters for the set type
    const setTypeParam = setType === 'public' ? 'public' : (shared ? 'shared' : 'regular');

    buttonsDiv.appendChild(
      createIconButton(`/view_set?setID=${setID}&set_type=${setTypeParam}`, 'view.svg', 'View Icon', 'View Set')
    );
  
    buttonsDiv.appendChild(
      createIconButton(`/play_set?setID=${setID}&set_type=${setTypeParam}`, 'play.svg', 'Play Icon', 'Play Set')
    );
  
    if (!shared && setType !== 'public') {
      // Regular user set buttons
      buttonsDiv.appendChild(
        createIconButton(`/edit_set?setID=${setID}`, 'edit.svg', 'Edit Icon', 'Edit Set')
      );
      buttonsDiv.appendChild(
        createIconButton(null, 'share.svg', 'Share Icon', 'Share Set', () => { handleShareButtonClick(setID); })
      );
      buttonsDiv.appendChild(
        createIconButton(null, 'delete.svg', 'Delete Icon', 'Delete Set', () => {
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
        })
      );
    } else if (shared && setType !== 'public') {
      // Shared set buttons
      buttonsDiv.appendChild(
        createIconButton(null, 'delete.svg', 'Remove Icon', 'Remove Set', () => { handleRemoveSharedSet(setID, setName); })
      );
      buttonsDiv.appendChild(
        createIconButton(null, 'report.svg', 'Report Icon', 'Report Set', () => { handleReportButtonClick(setID); })
      );
    } else if (setType === 'public') {
      // Public set buttons (just add report)
      buttonsDiv.appendChild(
        createIconButton(null, 'report.svg', 'Report Icon', 'Report Set', () => { 
          reportPublicSet(setID); 
        })
      );
    }
    
    bottomSection.appendChild(buttonsDiv);
    containerWrapper.appendChild(bottomSection);
    setDiv.appendChild(containerWrapper);
  
    // Determine which container to append to
    let container;
    if (containerId) {
      container = document.getElementById(containerId);
    } else {
      container = shared ? document.getElementById('shared-sets') : document.getElementById('user-sets');
    }
    
    if (container) {
      container.appendChild(setDiv);
    } else {
      console.error(`Container not found: ${containerId || (shared ? 'shared-sets' : 'user-sets')}`);
    }
}

function getCategoryName(key, categoryNames) {
    return categoryNames[key] || '';
}


document.addEventListener('DOMContentLoaded', () => {
    // Get filter elements
    const userCategoryFilter = document.getElementById('userCategoryFilter');
    const userSubcategoryFilter = document.getElementById('userSubcategoryFilter');
    const userNameFilter = document.getElementById('userNameFilter');
    const userApplyFiltersBtn = document.getElementById('userApplyFilters');
    const sharedCategoryFilter = document.getElementById('sharedCategoryFilter');
    const sharedSubcategoryFilter = document.getElementById('sharedSubcategoryFilter');
    const sharedNameFilter = document.getElementById('sharedNameFilter');
    const sharedApplyFiltersBtn = document.getElementById('sharedApplyFilters');
    
    // Populate category dropdowns if they exist
    if (userCategoryFilter) {
        populateCategoryDropdown(userCategoryFilter, window.categoryNames);
        
        // Handle category changes
        userCategoryFilter.addEventListener('change', function() {
            const hasSubcategories = populateSubcategoryDropdown(this.value, userSubcategoryFilter, window.subcategoriesData);
            if (userSubcategoryFilter) {
                userSubcategoryFilter.classList.toggle('hidden', !hasSubcategories);
            }
        });
        
        // Apply filters button for user sets
        if (userApplyFiltersBtn) {
            userApplyFiltersBtn.addEventListener('click', function() {
                filterSets('user-sets', userCategoryFilter.value, 
                    userSubcategoryFilter ? userSubcategoryFilter.value : '', 
                    userNameFilter ? userNameFilter.value : '');
            });
        }
    }
    
    if (sharedCategoryFilter) {
        populateCategoryDropdown(sharedCategoryFilter, window.categoryNames);
        
        // Handle category changes
        sharedCategoryFilter.addEventListener('change', function() {
            const hasSubcategories = populateSubcategoryDropdown(this.value, sharedSubcategoryFilter, window.subcategoriesData);
            if (sharedSubcategoryFilter) {
                sharedSubcategoryFilter.classList.toggle('hidden', !hasSubcategories);
            }
        });
        
        // Apply filters button for shared sets
        if (sharedApplyFiltersBtn) {
            sharedApplyFiltersBtn.addEventListener('click', function() {
                filterSets('shared-sets', sharedCategoryFilter.value, 
                    sharedSubcategoryFilter ? sharedSubcategoryFilter.value : '', 
                    sharedNameFilter ? sharedNameFilter.value : '');
            });
        }
    }
    
    // Handle Enter key for name search fields
    if (userNameFilter && userApplyFiltersBtn) {
        userNameFilter.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                userApplyFiltersBtn.click();
            }
        });
    }
    
    if (sharedNameFilter && sharedApplyFiltersBtn) {
        sharedNameFilter.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                sharedApplyFiltersBtn.click();
            }
        });
    }
});

function filterSets(containerId, categoryValue, subcategoryValue, nameValue = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const sets = container.querySelectorAll('.set-item');
    const nameFilterLower = nameValue.toLowerCase();
    
    sets.forEach(set => {
        let showSet = true;
        
        // Filter by name if provided
        if (nameFilterLower !== '') {
            const setName = set.getAttribute('data-name');
            if (setName && !setName.includes(nameFilterLower)) {
                showSet = false;
            }
        }
        
        // Filter by category if selected
        if (showSet && categoryValue !== '') {
            const setCategory = set.getAttribute('data-category');
            if (setCategory !== categoryValue) {
                showSet = false;
            }
            
            // Filter by subcategory if selected and category matches
            if (showSet && subcategoryValue !== '') {
                const setSubcategory = set.getAttribute('data-subcategory');
                if (setSubcategory !== subcategoryValue) {
                    showSet = false;
                }
            }
        }
        
        set.style.display = showSet ? '' : 'none';
    });
    
    // Check if we need to show "no results" message
    const visibleSets = container.querySelectorAll('.set-item:not([style*="display: none"])');
    const noResultsId = `no-results-${containerId}`;
    let noResultsMessage = document.getElementById(noResultsId);
    
    if (visibleSets.length === 0) {
        if (!noResultsMessage) {
            noResultsMessage = document.createElement('div');
            noResultsMessage.id = noResultsId;
            noResultsMessage.className = 'col-span-full font-mono text-lg text-accent-light dark:text-accent-dark py-2 text-center';
            noResultsMessage.innerText = 'No matching sets found.';
            container.appendChild(noResultsMessage);
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }
}

function populateCategoryDropdown(dropdown, categoryNames) {
    if (!dropdown) return;
    
    const categoryOptions = Object.keys(categoryNames).map(key => {
        return `<option value="${key}">${getCategoryName(key, categoryNames)}</option>`;
    }).join('');
    
    // Change "Select Category" to "All Categories" for consistency with public sets
    dropdown.innerHTML = '<option value="">All Categories</option>' + categoryOptions;
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
    
    // Already using "All Subcategories" so this is correct
    dropdown.innerHTML = '<option value="">All Subcategories</option>' + subcategoryOptions;
    return true;
}

function getSubcategoriesForCategory(categoryKey, subcategories) {
    return subcategories && subcategories[categoryKey] ? subcategories[categoryKey] : [];
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