<?php

function responderJson(mixed $dados, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

function responderErro(string $mensagem, int $status): never
{
    responderJson(['mensagem' => $mensagem], $status);
}

function responderErrosValidacao(array $erros): never
{
    responderJson(['erros' => $erros], 422);
}

function lerCorpoJson(): array
{
    $texto = file_get_contents('php://input');
    $dados = json_decode($texto, true);

    if (!is_array($dados)) {
        responderErro('JSON inválido.', 400);
    }

    return $dados;
}

function lerId(mixed $valor): int
{
    $id = filter_var(
        $valor,
        FILTER_VALIDATE_INT,
        ['options' => ['min_range' => 1]]
    );

    if ($id === false) {
        responderErro('ID inválido.', 400);
    }

    return $id;
}

function lerTexto(array $dados, string $campo): string
{
    $valor = $dados[$campo] ?? '';
    return is_scalar($valor) ? trim((string) $valor) : '';
}

set_exception_handler(
    function (Throwable $erro) {
        error_log($erro);
        responderErro('Erro interno no servidor.', 500);
    }
);