<?php 

$configs = require __DIR__ . '/../config.php';

$con = mysqli_connect(
    $configs->host,
    $configs->username,
    $configs->password,
    $configs->database,
    $configs->port
);

mysqli_set_charset($con, 'utf8mb4');