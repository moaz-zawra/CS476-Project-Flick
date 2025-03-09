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
        document.getElementById('theme-toggle').checked = true;
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('theme-toggle').checked = false;
    }
});

// Dashboard functions
function getCategoryName(categoryId) {
    const categories = {
        0: 'Language',
        1: 'Technology',
        2: 'Course Subjects',
        3: 'Law',
        4: 'Medical',
        5: 'Military'
    };
    return categories[categoryId] || 'Unknown Category';
}

function handleShareButtonClick(setID) {
    document.getElementById('share-modal').classList.remove('hidden');

    document.getElementById('confirm-share').onclick = () => {
        const username = document.getElementById('username-input').value;
        if (username) {
            alert(`Set shared with ${username}`);
            document.getElementById('share-modal').classList.add('hidden');
        } else {
            alert('Please enter a username');
        }
    };

    document.getElementById('cancel-share').onclick = () => {
        document.getElementById('share-modal').classList.add('hidden');
    };
}

function insertSet(setID, setName, category, shared) {
    const setDiv = document.createElement('div');
    setDiv.className = 'inline-flex flex-col items-start bg-[#90A955] p-4 border-2 border-black rounded-md m-2';

    const setNameDiv = document.createElement('div');
    setNameDiv.className = 'flex items-center gap-2';

    const setNameSpan = document.createElement('span');
    setNameSpan.className = 'font-mono bold text-[#ECF39E]';
    setNameSpan.textContent = setName;
    setNameDiv.appendChild(setNameSpan);

    const playButton = document.createElement('button');
    playButton.className = 'relative group flex items-center justify-center p-1 bg-[#ECF39E] border-2 border-black rounded-md hover:bg-[#CFE892]';
    playButton.onclick = () => { window.location.href = `/view_set?setID=${setID}`; };

    const playImg = document.createElement('img');
    playImg.src = 'play.svg';
    playImg.alt = 'Play Icon';
    playImg.className = 'w-6 h-6';
    playButton.appendChild(playImg);

    const playSpan = document.createElement('span');
    playSpan.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
    playSpan.textContent = 'Play Set';
    playButton.appendChild(playSpan);

    setNameDiv.appendChild(playButton);

    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'flex items-center gap-2 mt-1';
    const categorySpan = document.createElement('span');
    categorySpan.className = 'bg-[#4F772D] text-[#ECF39E] px-2 py-1 rounded-md';
    categorySpan.textContent = getCategoryName(category);
    categoryDiv.appendChild(categorySpan);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'flex items-center gap-2 justify-between mt-2 w-full';

    const buttonBaseClass = 'relative group flex items-center justify-center p-1 bg-[#ECF39E] border-2 border-black rounded-md hover:bg-[#CFE892]';

    const shareButton = document.createElement('button');
    shareButton.className = buttonBaseClass;
    shareButton.onclick = () => {
        handleShareButtonClick(setID);
    };

    const shareImg = document.createElement('img');
    shareImg.src = 'share.svg';
    shareImg.alt = 'Share Icon';
    shareImg.className = 'w-6 h-6';
    shareButton.appendChild(shareImg);

    const shareSpan = document.createElement('span');
    shareSpan.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
    shareSpan.textContent = 'Share Set';
    shareButton.appendChild(shareSpan);

    const editButton = document.createElement('button');
    editButton.className = buttonBaseClass;
    editButton.onclick = () => { window.location.href = `/editSet?setID=${setID}`; };

    const editImg = document.createElement('img');
    editImg.src = 'edit.svg';
    editImg.alt = 'Edit Icon';
    editImg.className = 'w-6 h-6';
    editButton.appendChild(editImg);

    const editSpan = document.createElement('span');
    editSpan.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
    editSpan.textContent = 'Edit Set';
    editButton.appendChild(editSpan);

    const deleteButton = document.createElement('button');
    deleteButton.className = buttonBaseClass;
    deleteButton.onclick = () => {
        document.getElementById('confirmation-modal').classList.remove('hidden');
        document.getElementById('confirmation-message').textContent = `Do you want to delete the set "${setName}"?`;
        document.getElementById('confirm-delete').onclick = () => {
            window.location.href = `/deleteSet?setID=${setID}`;
        };
    };

    const deleteImg = document.createElement('img');
    deleteImg.src = 'delete.svg';
    deleteImg.alt = 'Delete Icon';
    deleteImg.className = 'w-6 h-6';
    deleteButton.appendChild(deleteImg);

    const deleteSpan = document.createElement('span');
    deleteSpan.className = 'absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10';
    deleteSpan.textContent = 'Delete Set';
    deleteButton.appendChild(deleteSpan);

    buttonsDiv.appendChild(shareButton);
    buttonsDiv.appendChild(editButton);
    buttonsDiv.appendChild(deleteButton);

    setDiv.appendChild(setNameDiv);
    setDiv.appendChild(categoryDiv);
    setDiv.appendChild(buttonsDiv);

    const container = shared ? document.getElementById('shared-sets') : document.getElementById('user-sets');
    container.appendChild(setDiv);
}

// Edit Set functions
function editCard(cardId) {
    console.log('Edit card:', cardId);
}

function addNewCard() {
    document.getElementById('cardModal').classList.remove('hidden');
    document.getElementById('cardForm').reset();
}

function closeCardModal() {
    document.getElementById('cardModal').classList.add('hidden');
}

async function saveCard() {
    const front_text = document.getElementById('cardFront').value;
    const back_text = document.getElementById('cardBack').value;
    const setID = document.querySelector('input[name="setID"]').value;

    try {
        const response = await fetch('/api/v2/addCard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                front_text,
                back_text,
                setID
            })
        });

        if (response.ok) {
            alert('Card added successfully!');
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Failed to add card: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error saving card:', error);
        alert('Failed to save card. Please try again.');
    }

    closeCardModal();
}

// New Set functions
const subcategories = {};
const categoryNames = {};

document.getElementById('category').addEventListener('change', function() {
    const subcategoryContainer = document.getElementById('subcategory-container');
    const subcategorySelect = document.getElementById('subcategory');
    const selectedCategory = this.value;

    subcategorySelect.innerHTML = '<option value="" disabled selected>Select a subcategory</option>';

    if (selectedCategory && subcategories[selectedCategory]) {
        const subCategoryEnum = subcategories[selectedCategory];
        Object.entries(subCategoryEnum).forEach(([key, value]) => {
            if (isNaN(Number(key))) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = value;
                subcategorySelect.appendChild(option);
            }
        });
        subcategoryContainer.classList.remove('hidden');
    } else {
        subcategoryContainer.classList.add('hidden');
    }
});
