<?php
    ini_set("session.cookie_httponly", 1);
    session_start();
    
    header("Content-Type: application/json");

    require 'mysqlconnect.php';

    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    $username = htmlentities($json_obj['username']);
    $individualEventArray = array(); 
    $eventarray = array();
    $eventdetailarray = array();
    $testVar = "Success";
    $previous_ua = @$_SESSION['useragent'];
    $current_ua = $_SERVER['HTTP_USER_AGENT'];

    if(isset($_SESSION['useragent']) && $previous_ua !== $current_ua) {
      die("Session hijack detected");
      //alert($previous_ua);

    }
    else {
      //echo ("user agents match");
      $_SESSION['useragent'] = $current_ua;
    }

    // gets id from table users given username
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

    // gets the events associated with the given user
    $stmt = $mysqli->prepare("SELECT event_id from events where user_id = ?");
    $stmt->bind_param('s', $userid);
    $stmt->execute();
    if(!$stmt){
      printf("Query Prep Failed: %s\n", $mysqli->error);
      exit;
      }
    $stmt->bind_result($eventid);
    //$result = $stmt->get_result();
    while($stmt->fetch()){
      array_push($eventarray, $eventid);
    }
    
    $stmt = $mysqli->prepare("SELECT event_id from events where user_id = '1'");
    $stmt->execute();
    if(!$stmt){
      printf("Query Prep Failed: %s\n", $mysqli->error);
      exit;
      }
    $stmt->bind_result($eventid);
    //$result = $stmt->get_result();
    while($stmt->fetch()){
      array_push($eventarray, $eventid);
    }

    $arraylength = count($eventarray);

    for ($i=0; $i<$arraylength; $i++) {
      $arraypos = $eventarray[$i];
      $stmt = $mysqli->prepare("SELECT description, time, month, date, year, tag, user_id from events where event_id = ?");
      $stmt->bind_param('s', $arraypos);
      $stmt->execute();
      if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
      }
      $stmt->bind_result($description, $time, $month, $day, $year, $tag, $userid);
      while($stmt->fetch()){
      } 
      
      //added another array entry for eventid
      array_push($individualEventArray, $description, $time, $month, $day, $year, $arraypos, $tag, $userid);
      array_push($eventdetailarray, $individualEventArray);
      $individualEventArray = array();

    }
      echo json_encode($eventdetailarray);
      ?>
      