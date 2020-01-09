<?php
    ini_set("session.cookie_httponly", 1);
    session_start();

    require 'mysqlconnect.php';

    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    $title = htmlentities($json_obj['newtitle']);
    $time = htmlentities($json_obj['newtime']);
    $day = htmlentities($json_obj['newday']);
    $eventid = htmlentities($json_obj['eventid']);
    $token = htmlentities($json_obj['token']);
    $previous_ua = @$_SESSION['useragent'];
    $current_ua = $_SERVER['HTTP_USER_AGENT'];

    if(!hash_equals($_SESSION['token'], $token)){
      die("Request forgery detected");
    }

    if(isset($_SESSION['useragent']) && $previous_ua !== $current_ua) {
      die("Session hijack detected");
      //alert($previous_ua);

    }
    else {
      //echo ("user agents match");
      $_SESSION['useragent'] = $current_ua;
    }


    $stmt = $mysqli->prepare("UPDATE events SET description=?, time=?, date=? where event_id=?");
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
        }
    $stmt->bind_param('ssss', $title, $time, $day, $eventid);
    $stmt->execute();
    while($stmt->fetch()){
    }

    echo json_encode(array("success" => true));
?>