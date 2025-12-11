// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Set minimum date for travel date to today
    const travelDateInput = document.getElementById('travelDate');
    if (travelDateInput) {
        const today = new Date().toISOString().split('T')[0];
        travelDateInput.setAttribute('min', today);
    }
});

function checkAuthStatus() {
    // Check if user is logged in by making a request to check session
    fetch('api/get_bookings.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // User is logged in
                const loginLink = document.getElementById('loginLink');
                const signupLink = document.getElementById('signupLink');
                const dashboardLink = document.getElementById('dashboardLink');
                const adminLink = document.getElementById('adminLink');
                const logoutLink = document.getElementById('logoutLink');
                
                if (loginLink) loginLink.style.display = 'none';
                if (signupLink) signupLink.style.display = 'none';
                if (dashboardLink) dashboardLink.style.display = 'block';
                if (logoutLink) logoutLink.style.display = 'block';
                
                // Check if admin
                if (data.isAdmin) {
                    if (adminLink) adminLink.style.display = 'block';
                }
            }
        })
        .catch(error => {
            // User is not logged in, keep default navigation
        });
}

function logout() {
    fetch('api/logout.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            window.location.href = 'index.html';
        });
}

function showMessage(elementId, message, type = 'success') {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

