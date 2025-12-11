<?php
require_once '../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $fromStationId = isset($data['fromStationId']) ? (int)$data['fromStationId'] : 0;
    $toStationId = isset($data['toStationId']) ? (int)$data['toStationId'] : 0;
    $numberOfTickets = isset($data['numberOfTickets']) ? (int)$data['numberOfTickets'] : 1;

    if ($fromStationId <= 0 || $toStationId <= 0 || $fromStationId === $toStationId) {
        echo json_encode(['success' => false, 'message' => 'Invalid station selection']);
        exit;
    }

    $conn = getDBConnection();

    // Build graph from routes
    $edges = [];
    $travelTimes = [];
    $res = $conn->query("SELECT from_station_id, to_station_id, distance, travel_time FROM routes");
    while ($row = $res->fetch_assoc()) {
        $u = (int)$row['from_station_id'];
        $v = (int)$row['to_station_id'];
        $d = (float)$row['distance'];
        $t = (int)$row['travel_time'];
        if (!isset($edges[$u])) { $edges[$u] = []; }
        $edges[$u][$v] = $d;
        if (!isset($travelTimes[$u])) { $travelTimes[$u] = []; }
        $travelTimes[$u][$v] = $t;
    }

    // Dijkstra by distance
    $dist = [];
    $prev = [];
    $visited = [];
    $pq = new SplPriorityQueue();
    $pq->setExtractFlags(SplPriorityQueue::EXTR_DATA);

    foreach ($edges as $node => $_) { $dist[$node] = INF; }
    $dist[$fromStationId] = 0.0;
    $pq->insert($fromStationId, 0.0 * -1);

    while (!$pq->isEmpty()) {
        $u = $pq->extract();
        if (isset($visited[$u])) { continue; }
        $visited[$u] = true;
        if ($u === $toStationId) { break; }
        if (!isset($edges[$u])) { continue; }
        foreach ($edges[$u] as $v => $w) {
            $alt = $dist[$u] + $w;
            if (!isset($dist[$v]) || $alt < $dist[$v]) {
                $dist[$v] = $alt;
                $prev[$v] = $u;
                $pq->insert($v, $alt * -1);
            }
        }
    }

    if (!isset($dist[$toStationId]) || !is_finite($dist[$toStationId])) {
        echo json_encode(['success' => false, 'message' => 'No route found between selected stations']);
        $conn->close();
        exit;
    }

    // Reconstruct path and sum travel time
    $path = [];
    for ($at = $toStationId; isset($at); $at = isset($prev[$at]) ? $prev[$at] : null) {
        $path[] = $at;
        if ($at === $fromStationId) { break; }
    }
    $path = array_reverse($path);

    $totalDistance = round((float)$dist[$toStationId], 2);
    $totalTravelTime = 0;
    for ($i = 0; $i < count($path) - 1; $i++) {
        $u = $path[$i];
        $v = $path[$i + 1];
        $totalTravelTime += isset($travelTimes[$u][$v]) ? (int)$travelTimes[$u][$v] : 0;
    }

    // Fare calculation proportional to number of stations traversed
    $segmentsCount = max(1, count($path) - 1); // number of edges between stations
    $farePerTicket = $segmentsCount * 10; // ₹10 per segment
    if ($farePerTicket > 70) { $farePerTicket = 70; }

    $totalFare = $farePerTicket * max(1, $numberOfTickets);

    echo json_encode([
        'success' => true,
        'distance' => round($totalDistance, 2),
        'travelTime' => $totalTravelTime,
        'farePerTicket' => round($farePerTicket, 2),
        'totalFare' => round($totalFare, 2),
        'numberOfTickets' => max(1, $numberOfTickets)
    ]);

    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

?>

