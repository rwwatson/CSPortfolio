<?php

    header("Content-Type: application/json");

    require 'mysqlconnect.php';

    ini_set("session.cookie_httponly", 1);
    session_start();
    
    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    echo json_encode(array('success' => true));
    session_destroy();
?>