<?php

    header("Content-Type: application/json");

    require 'mysqlconnect.php';

    ini_set("session.cookie_httponly", 1);
    session_start();
    //echo json_encode($_SESSION['username']);
    
    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);
    $echoarray = array();
    //echo ($_SESSION['username']);

    if (isset($_SESSION['username'])) {
        //array_push($echoarray, "success" => true, $_SESSION['token'], ($_SESSION['username']));
        echo json_encode(array("success" => true, "token" => $_SESSION['token']));
        
        exit;
    }
    else {
        //array_push($echoarray, "success" => false, "", "");
        echo json_encode(array("success" => false));
        exit;
    }
?>