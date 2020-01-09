<?php

    header("Content-Type: application/json");

    require 'mysqlconnect.php';

    ini_set("session.cookie_httponly", 1);
    session_start();
    
    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    $username = $mysqli->real_escape_string($json_obj['username']);
    $password = $mysqli->real_escape_string($json_obj['password']);
    $echoarray = array();

    //$hashpassword = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $mysqli->prepare("SELECT COUNT(*), user_password FROM users WHERE username=?");

    $stmt->bind_param('s', $username);
    $stmt->execute();

    $stmt->bind_result($count, $passwordhashed);
    $stmt->fetch();


    if($count == 1 && password_verify($password, $passwordhashed) && isset($username)) {
        //session_start();
        $_SESSION['useragent'] = $_SERVER['HTTP_USER_AGENT'];
        $_SESSION['username'] = $username;
        $_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32));

        //array_push($echoarray, true, $_SESSION['token']);
        echo json_encode(array("success" => true, "token" => $_SESSION['token']));
	    exit;
    }
    else {
        array_push($echoarray, false);
        echo json_encode($echoarray);
        exit;
    }
?>