<?php
    ini_set("session.cookie_httponly", 1);
    session_start();

    require 'mysqlconnect.php';

    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    $username = htmlentities($json_obj['username']);
    $title = htmlentities($json_obj['title']);
    $time = htmlentities($json_obj['time']);
    $month = htmlentities($json_obj['month']);
    $day = htmlentities($json_obj['day']);
    $year = htmlentities($json_obj['year']);
    $token = htmlentities($json_obj['token']);
    $tag = htmlentities($json_obj['tag']);
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
    
      //echo($previous_ua + " /// ");
      //echo($current_ua);

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

    $stmt = $mysqli->prepare("insert into events (user_id, description, time, month, date, year, tag) values (?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }

    $stmt->bind_param('sssssss', $userid, $title, $time, $month, $day, $year, $tag);
    $stmt->execute();
    $stmt->close();

    //echo ($_SESSION['username']);
    echo json_encode(array("success" => true));
?>