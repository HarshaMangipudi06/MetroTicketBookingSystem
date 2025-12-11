// Booking JavaScript

let stations = [];
let selectedFromStation = null;
let selectedToStation = null;

document.addEventListener('DOMContentLoaded', function() {
    loadStations();
    
    const fromStation = document.getElementById('fromStation');
    const toStation = document.getElementById('toStation');
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }
    
    if (fromStation) {
        fromStation.addEventListener('change', function() {
            selectedFromStation = this.value;
        });
    }
    
    if (toStation) {
        toStation.addEventListener('change', function() {
            selectedToStation = this.value;
        });
    }
});

function loadStations() {
    fetch('api/get_stations.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                stations = data;
                populateStations();
                console.log('Loaded', stations.length, 'stations');
            } else {
                console.error('No stations found in response:', data);
                showMessage('message', 'No stations found. Please import the database schema.', 'error');
            }
        })
        .catch(error => {
            console.error('Error loading stations:', error);
            showMessage('message', 'Error loading stations. Make sure the database is set up correctly.', 'error');
        });
}

function populateStations() {
    const fromStation = document.getElementById('fromStation');
    const toStation = document.getElementById('toStation');
    
    if (fromStation && toStation) {
        // Clear existing options except the first one
        fromStation.innerHTML = '<option value="">Select station</option>';
        toStation.innerHTML = '<option value="">Select station</option>';
        
        // Sort stations by name for better UX
        const sortedStations = [...stations].sort((a, b) => a.station_name.localeCompare(b.station_name));
        
        sortedStations.forEach(station => {
            const option1 = document.createElement('option');
            option1.value = station.id;
            option1.textContent = `${station.station_name} (${station.station_code})`;
            fromStation.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = station.id;
            option2.textContent = `${station.station_name} (${station.station_code})`;
            toStation.appendChild(option2);
        });
        
        console.log('Populated', sortedStations.length, 'stations in dropdowns');
    } else {
        console.error('Station dropdowns not found');
    }
}

function calculateFare() {
    const fromStationId = document.getElementById('fromStation').value;
    const toStationId = document.getElementById('toStation').value;
    const numberOfTickets = parseInt(document.getElementById('numberOfTickets').value) || 1;
    
    if (!fromStationId || !toStationId) {
        showMessage('message', 'Please select both from and to stations', 'error');
        return;
    }
    
    if (fromStationId === toStationId) {
        showMessage('message', 'From and To stations cannot be the same', 'error');
        return;
    }
    
    fetch('api/calculate_fare.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fromStationId: parseInt(fromStationId),
            toStationId: parseInt(toStationId),
            numberOfTickets: numberOfTickets
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('distance').textContent = data.distance;
            document.getElementById('travelTime').textContent = data.travelTime;
            document.getElementById('farePerTicket').textContent = data.farePerTicket;
            document.getElementById('totalFare').textContent = data.totalFare;
            document.getElementById('fareDetails').style.display = 'block';
            selectedFromStation = fromStationId;
            selectedToStation = toStationId;
        } else {
            showMessage('message', data.message || 'Could not calculate fare', 'error');
        }
    })
    .catch(error => {
        console.error('Error calculating fare:', error);
        showMessage('message', 'Error calculating fare', 'error');
    });
}

function handleBooking(e) {
    e.preventDefault();
    
    // Check if user is logged in
    fetch('api/get_bookings.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                window.location.href = 'login.html';
                return;
            }
            
            // Proceed with booking
            const travelDate = document.getElementById('travelDate').value;
            const numberOfTickets = parseInt(document.getElementById('numberOfTickets').value);
            const totalFare = parseFloat(document.getElementById('totalFare').textContent);
            
            const bookingData = {
                fromStationId: parseInt(selectedFromStation),
                toStationId: parseInt(selectedToStation),
                travelDate: travelDate,
                numberOfTickets: numberOfTickets,
                totalFare: totalFare
            };
            
            fetch('api/book_ticket.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('message', 'Ticket booked successfully! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                } else {
                    showMessage('message', data.message || 'Booking failed', 'error');
                }
            })
            .catch(error => {
                console.error('Error booking ticket:', error);
                showMessage('message', 'Error booking ticket', 'error');
            });
        })
        .catch(error => {
            window.location.href = 'login.html';
        });
}

function showMessage(elementId, message, type = 'success') {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

