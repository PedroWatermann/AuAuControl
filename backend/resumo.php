<?php

require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/conexao.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo !== 'GET') {
    responderErro('Método não permitido.', 405);
}

responderJson(contarCadastros($con));

function contarCadastros(mysqli $con): array
{
    $resultado = mysqli_execute_query(
        $con,
        'SELECT
            (SELECT COUNT(*) FROM clientes) AS clientes,
            (SELECT COUNT(*) FROM funcionarios) AS funcionarios,
            (SELECT COUNT(*) FROM animais) AS animais,
            (SELECT COUNT(*) FROM atendimentos) AS atendimentos'
    );

    return mysqli_fetch_assoc($resultado);
}