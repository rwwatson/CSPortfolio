<?php
    ini_set("session.cookie_httponly", 1);
    session_start();
    require 'mysqlconnect.php';

    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    $username = htmlentities($json_obj['username']);
    $token = htmlentities($json_obj['token']);
    $previous_ua = @$_SESSION['useragent'];
    $current_ua = $_SERVER['HTTP_USER_AGENT'];
    $TOKEN = $_SESSION['token'];

    if(!hash_equals($TOKEN, $token)){
      echo ($token);
      die("Request forgery detected");
    }

    if(isset($_SESSION['useragent']) && $previous_ua !== $current_ua) {
      die("Session hijack detected");
    }
    else {
      $_SESSION['useragent'] = $current_ua;
    }

    $stmt = $mysqli->prepare("SELECT id from users where username = ?");
    $stmt->bind_param('s', $username);
    $stmt->execute();
    if(!$stmt){
      printf("Query Prep Failed: %s\n", $mysqli->error);
      exit;
      }
    $stmt->bind_result($userid);
    while($stmt->fetch()){
    }

    $stmt = $mysqli->prepare("DELETE from events where user_id = ?");
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
        }
    $stmt->bind_param('i', $userid);
    $stmt->execute();
    
    while($stmt->fetch()){
    }

    echo json_encode(array("success" => true));
?>