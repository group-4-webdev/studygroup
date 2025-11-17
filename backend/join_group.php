<?php
session_start();
include 'db.php';

$userId = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);
$groupId = $data['groupId'] ?? null;

if (!$groupId) {
    echo json_encode(["status" => "error", "message" => "Group ID is required"]);
    exit;
}

// Get current space
$sql = "SELECT space, size FROM groups WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $groupId);
$stmt->execute();
$result = $stmt->get_result();
$group = $result->fetch_assoc();

if (!$group) {
    echo json_encode(["status" => "error", "message" => "Group not found"]);
    exit;
}

// Extract current occupancy
list($current, $max) = explode("/", $group['space']);
$current = (int)$current;
$max = (int)$group['size'];

// Check if there's space
if ($current >= $max) {
    echo json_encode(["status" => "error", "message" => "Group is full"]);
    exit;
}

// Increment space
$current++;
$newSpace = $current . "/" . $max;

$updateSql = "UPDATE groups SET space = ? WHERE id = ?";
$updateStmt = $conn->prepare($updateSql);
$updateStmt->bind_param("si", $newSpace, $groupId);

if ($updateStmt->execute()) {
    echo json_encode(["status" => "success", "space" => $newSpace]);
} else {
    echo json_encode(["status" => "error", "message" => $updateStmt->error]);
}
?>
