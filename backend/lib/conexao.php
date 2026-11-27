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

mysqli_query($con, "SET SESSION sql_mode = 'STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'");