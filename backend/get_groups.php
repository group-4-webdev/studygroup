<?php
session_start();
include 'db.php';

$userId = $_SESSION['user_id'];

$sql = "SELECT * FROM groups WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$groups = [];
while($row = $result->fetch_assoc()){
    $groups[] = $row;
}

echo json_encode($groups);
?>
