<?php
            $mysqli = new mysqli('localhost', 'phpuser', 'phpuser_pass', 'calendar');

            if($mysqli->connect_errno) {
                printf("Connection Failed: %s\n", $mysqli->connect_error);
                exit;
            }
        ?>