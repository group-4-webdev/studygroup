<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include "db.php";

$data = json_decode(file_get_contents("php://input"));

$stmt = $conn->prepare("INSERT INTO groups (group_name, description, created_by) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $data->group_name, $data->description, $data->created_by);

if($stmt->execute()){
    echo json_encode(["success" => true, "message" => "Group created successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to create group"]);
}
?>
