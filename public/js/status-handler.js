/**
 * Status message handler for Flick application
 * This module provides functions to display and manage status messages
 */

/**
 * Initializes a status message with appropriate styling based on status code
 * @param {string} status - The status code passed from the server
 */
function initializeStatusMessage(status) {
    if (!status) return;
    
    const statusElement = document.getElementById('status-message');
    if (!statusElement) return;
    
    // Set the appropriate message and styling based on the status code
    switch(status) {
        // Success messages
        case 'success':
            setStatusMessage('Operation completed successfully!', 'success');
            break;
        case 'registration-success':
            setStatusMessage('Registration successful! Please log in.', 'success');
            break;
            
        // Set related messages
        case 'no_sets':
            setStatusMessage('You have no card sets.', 'info');
            break;
        case 'no_shared_sets':
            setStatusMessage('No sets have been shared with you.', 'info');
            break;
        case 'no_cards':
            setStatusMessage('This set has no cards yet.', 'info');
            break;
        case 'set-does-not-exist':
            setStatusMessage('Card set not found.', 'error');
            break;
        case 'does-not-exist':
            setStatusMessage('The requested resource does not exist.', 'error');
            break;
        case 'name-used':
            setStatusMessage('A set with this name already exists.', 'error');
            break;
            
        // Data related messages
        case 'no_data':
            setStatusMessage('No data available for this request.', 'info');
            break;
            
        // Set sharing related messages
        case 'user-does-not-exist':
            setStatusMessage('User not found. Please check the username.', 'error');
            break;
        case 'already-shared':
            setStatusMessage('This set is already shared with this user.', 'warning');
            break;
        
        // Form submission related messages
        case 'missing-fields':
            setStatusMessage('Please fill in all required fields.', 'error');
            break;
        case 'error':
            setStatusMessage('An error occurred. Please try again.', 'error');
            break;
            
        // Account related messages
        case 'username-used':
            setStatusMessage('This username is already taken.', 'error');
            break;
        case 'email-used':
            setStatusMessage('This email is already registered.', 'error');
            break;
        case 'bad-password':
            setStatusMessage('Password does not meet security requirements.', 'error');
            break;
        case 'mismatch-password':
            setStatusMessage('Passwords do not match.', 'error');
            break;
        case 'wrong-password':
            setStatusMessage('Incorrect password.', 'error');
            break;
        case 'incorrect-password':
            setStatusMessage('Incorrect password.', 'error');
            break;
            
        // Action related messages
        case 'invalid-action':
            setStatusMessage('Invalid action requested.', 'error');
            break;
            
        // Default case
        default:
            console.log(`Unhandled status code: ${status}`);
            setStatusMessage(`Status: ${status}`, 'info');
            return;
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(dismissStatus, 5000);
}

/**
 * Sets a status message with the specified text and type
 * @param {string} message - The message text to display
 * @param {string} type - The type of message (success, error, warning, info)
 */
function setStatusMessage(message, type) {
    const statusElement = document.getElementById('status-message');
    const statusTextElement = document.getElementById('status-text');
    const statusIconElement = document.getElementById('status-icon');
    
    if (!statusElement || !statusTextElement || !statusIconElement) return;
    
    statusTextElement.textContent = message;
    
    // Remove all previous styling classes
    statusElement.className = 'mt-4 mb-2 px-4 py-3 rounded-md flex items-center justify-between';
    
    // Set status message style based on type
    if (type === 'success') {
        statusElement.classList.add('bg-green-100', 'dark:bg-green-800', 'text-green-700', 'dark:text-green-200');
        statusIconElement.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>';
    } else if (type === 'error') {
        statusElement.classList.add('bg-red-100', 'dark:bg-red-800', 'text-red-700', 'dark:text-red-200');
        statusIconElement.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
    } else if (type === 'warning') {
        statusElement.classList.add('bg-yellow-100', 'dark:bg-yellow-800', 'text-yellow-700', 'dark:text-yellow-200');
        statusIconElement.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
    } else {
        statusElement.classList.add('bg-blue-100', 'dark:bg-blue-800', 'text-blue-700', 'dark:text-blue-200');
        statusIconElement.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1z" clip-rule="evenodd"></path></svg>';
    }
}

/**
 * Dismisses (hides) the status message
 */
function dismissStatus() {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.style.display = 'none';
    }
}

// Initialize status message if present on page load
document.addEventListener('DOMContentLoaded', () => {
    // Get status from URL query parameters if not directly available
    if (!window.statusCode) {
        const urlParams = new URLSearchParams(window.location.search);
        window.statusCode = urlParams.get('status');
    }
    
    if (window.statusCode) {
        initializeStatusMessage(window.statusCode);
    }
});
