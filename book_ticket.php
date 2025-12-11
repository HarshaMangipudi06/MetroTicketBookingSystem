<?php
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'user') {
    echo json_encode(['success' => false, 'message' => 'Please login to book tickets']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $fromStationId = $data['fromStationId'] ?? null;
    $toStationId = $data['toStationId'] ?? null;
    $travelDate = $data['travelDate'] ?? date('Y-m-d');
    $numberOfTickets = $data['numberOfTickets'] ?? 1;
    $totalFare = $data['totalFare'] ?? 0;
    
    if (!$fromStationId || !$toStationId) {
        echo json_encode(['success' => false, 'message' => 'Invalid station selection']);
        exit;
    }
    
    $conn = getDBConnection();
    $userId = $_SESSION['user_id'];
    $bookingDate = date('Y-m-d');
    
    $stmt = $conn->prepare("
        INSERT INTO bookings (user_id, from_station_id, to_station_id, booking_date, travel_date, number_of_tickets, total_fare)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("iiissid", $userId, $fromStationId, $toStationId, $bookingDate, $travelDate, $numberOfTickets, $totalFare);
    
    if ($stmt->execute()) {
        $bookingId = $conn->insert_id;
        echo json_encode([
            'success' => true, 
            'message' => 'Ticket booked successfully',
            'bookingId' => $bookingId
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Booking failed']);
    }
    
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>

