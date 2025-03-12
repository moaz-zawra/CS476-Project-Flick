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
        const response = await fetch('/api/addCardToSet', {
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
