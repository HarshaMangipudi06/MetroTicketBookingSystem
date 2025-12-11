// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
});

function loadBookings() {
    fetch('api/get_bookings.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.bookings) {
                displayBookings(data.bookings);
            } else {
                // User not logged in, redirect to login
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error loading bookings:', error);
            window.location.href = 'login.html';
        });
}

function displayBookings(bookings) {
    const bookingsList = document.getElementById('bookingsList');
    
    if (!bookingsList) return;
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p>No bookings found. <a href="booking.html">Book a ticket</a></p>';
        return;
    }
    
    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <h3>Booking #${booking.id}</h3>
            <div class="booking-info">
                <p><strong>From:</strong> ${booking.from_station_name}</p>
                <p><strong>To:</strong> ${booking.to_station_name}</p>
                <p><strong>Travel Date:</strong> ${booking.travel_date}</p>
                <p><strong>Booking Date:</strong> ${booking.booking_date}</p>
                <p><strong>Number of Tickets:</strong> ${booking.number_of_tickets}</p>
                <p><strong>Total Fare:</strong> ₹${parseFloat(booking.total_fare).toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="booking-status confirmed">${booking.booking_status}</span></p>
            </div>
        </div>
    `).join('');
}

