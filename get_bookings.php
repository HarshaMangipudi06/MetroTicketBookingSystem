<?php
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Please login']);
    exit;
}

$conn = getDBConnection();
$userId = $_SESSION['user_id'];
$isAdmin = isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'admin';

if ($isAdmin) {
    $stmt = $conn->prepare("
        SELECT b.*, 
               s1.station_name as from_station_name,
               s2.station_name as to_station_name,
               u.username, u.full_name
        FROM bookings b
        JOIN stations s1 ON b.from_station_id = s1.id
        JOIN stations s2 ON b.to_station_id = s2.id
        JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC
    ");
} else {
    $stmt = $conn->prepare("
        SELECT b.*, 
               s1.station_name as from_station_name,
               s2.station_name as to_station_name
        FROM bookings b
        JOIN stations s1 ON b.from_station_id = s1.id
        JOIN stations s2 ON b.to_station_id = s2.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
    ");
    $stmt->bind_param("i", $userId);
}

$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

echo json_encode(['success' => true, 'bookings' => $bookings, 'isAdmin' => $isAdmin]);
$stmt->close();
$conn->close();
?>

