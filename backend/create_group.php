<?php
session_start();
include 'db.php'; // Your DB connection

$userId = $_SESSION['user_id']; // Logged-in user
$groupName = $_POST['group_name'] ?? '';

if(!$groupName){
    echo json_encode(["status" => "error", "message" => "Group name is required"]);
    exit;
}

$sql = "INSERT INTO groups (user_id, name) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $userId, $groupName);

if($stmt->execute()){
    $newGroupId = $stmt->insert_id;
    echo json_encode([
        "status" => "success",
        "group" => [
            "id" => $newGroupId,
            "name" => $groupName
        ]
    ]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
?>
