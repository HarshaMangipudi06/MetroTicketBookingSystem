<?php
require_once '../config/database.php';

header('Content-Type: application/json');

$conn = getDBConnection();
$result = $conn->query("SELECT * FROM stations ORDER BY station_name");

$stations = [];
while ($row = $result->fetch_assoc()) {
    $stations[] = $row;
}

echo json_encode($stations);
$conn->close();
?>

