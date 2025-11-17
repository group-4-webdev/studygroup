<?php
session_start();
include 'db.php'; // DB connection

$userId = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);

$groupName   = $data['name'] ?? '';
$description = $data['description'] ?? '';
$course      = $data['course'] ?? '';
$topic       = $data['topic'] ?? '';
$location    = $data['location'] ?? '';
$size        = $data['size'] ?? '';
$space       = $data['space'] ?? '';

if (!$groupName) {
    echo json_encode(["status" => "error", "message" => "Group name is required"]);
    exit;
}

$sql = "INSERT INTO groups (user_id, name, description, course, topic, location, size, space)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isssssis", $userId, $groupName, $description, $course, $topic, $location, $size, $space);

if ($stmt->execute()) {
    $newGroupId = $stmt->insert_id;
    echo json_encode([
        "status" => "success",
        "group" => [
            "id" => $newGroupId,
            "name" => $groupName,
            "description" => $description,
            "course" => $course,
            "topic" => $topic,
            "location" => $location,
            "size" => $size,
            "space" => $space
        ]
    ]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
?>
