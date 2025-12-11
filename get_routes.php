<?php
require_once '../config/database.php';

header('Content-Type: application/json');

$conn = getDBConnection();
$result = $conn->query("
    SELECT r.*, 
           s1.station_name as from_station_name, 
           s2.station_name as to_station_name,
           s1.position_x as from_x, s1.position_y as from_y,
           s2.position_x as to_x, s2.position_y as to_y,
           s1.line_color as line_color
    FROM routes r
    JOIN stations s1 ON r.from_station_id = s1.id
    JOIN stations s2 ON r.to_station_id = s2.id
");

$routes = [];
while ($row = $result->fetch_assoc()) {
    $routes[] = $row;
}

echo json_encode($routes);
$conn->close();
?>

