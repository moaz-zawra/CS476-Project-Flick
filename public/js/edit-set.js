document.addEventListener('DOMContentLoaded', function() {
    const categoryNames = window.categoryNames;
    const subcategoriesData = window.subcategoriesData;
    
    const category_select = document.getElementById('category');
    const subcategory_select = document.getElementById('subcategory');
    const category = window.category;
    const subcategory = window.subcategory;

    populateCategoryDropdown(category_select, categoryNames, false);
    
    category_select.addEventListener('change', function() {
      console.log('Category changed:', this.value);
      populateSubcategoryDropdown(this.value, subcategory_select, subcategoriesData, true);
    });
    
    if (category) {
      category_select.value = category;
      populateSubcategoryDropdown(category, subcategory_select, subcategoriesData, true);
  
      if (subcategory) {
        subcategory_select.value = subcategory;
      }
    }
    
    document.getElementById('cancel-delete').addEventListener('click', function() {
        document.getElementById('confirmation-modal').classList.add('hidden');
    });
});

function editCard(cardId) {
  document.getElementById('cardModal').classList.remove('hidden');
  document.getElementById('cardForm').action = '/api/editCard';
  document.getElementById('cardForm').reset();
  document.getElementById('cardFront').value = document.getElementById('front' + cardId).innerText;
  document.getElementById('cardBack').value = document.getElementById('back' + cardId).innerText;
  document.getElementById('cardSetID').value = window.setID;
}

function addNewCard() {
    document.getElementById('cardModal').classList.remove('hidden');
    document.getElementById('cardForm').action = '/api/addCardToSet';
    document.getElementById('cardForm').reset();
    document.getElementById('cardSetID').value = window.setID;
}

function closeCardModal() {
    document.getElementById('cardModal').classList.add('hidden');
}

function deleteCard(cardID) {
    document.getElementById('deleteCardID').value = cardID;
    document.getElementById('confirmation-message').innerText = 'Are you sure you want to delete this card?';
    document.getElementById('confirmation-modal').classList.remove('hidden');
}