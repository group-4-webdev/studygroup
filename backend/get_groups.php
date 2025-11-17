<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include "db.php";

$result = $conn->query("SELECT * FROM groups ORDER BY created_at DESC");

$groups = [];
while($row = $result->fetch_assoc()){
    $groups[] = $row;
}

echo json_encode(["success" => true, "data" => $groups]);
?>
