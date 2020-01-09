<?php
    require 'mysqlconnect.php';

    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    $username = htmlentities($json_obj['username']);
    $password = htmlentities($json_obj['password']);
    
    $hashpassword = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $mysqli->prepare("insert into users (username, user_password) values (?, ?)");
    if (!$stmt) {
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }

    $stmt->bind_param('ss', $username, $hashpassword);
    $stmt->execute();
    $stmt->close();

    echo json_encode(array("success" => true));
?>