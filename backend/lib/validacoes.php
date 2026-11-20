<?php

function somenteDigitos(string $valor): string
{
    return preg_replace('/\D/', '', $valor);
}

function validarCpf(string $valor): bool
{
    $d = somenteDigitos($valor);

    if (strlen($d) !== 11 || preg_match('/^(\d)\1{10}$/', $d)) {
        return false;
    }

    for ($posicao = 9; $posicao <= 10; $posicao++) {
        $soma = 0;
        for ($i = 0; $i < $posicao; $i++) {
            $soma += (int) $d[$i] * ($posicao + 1 - $i);
        }
        $resto = ($soma * 10) % 11;
        if ($resto === 10) {
            $resto = 0;
        }
        if ($resto !== (int) $d[$posicao]) {
            return false;
        }
    }

    return true;
}

function validarTelefone(string $valor): bool
{
    $quantidade = strlen(somenteDigitos($valor));
    return $quantidade === 10 || $quantidade === 11;
}

function validarEmail(string $valor): bool
{
    return mb_strlen($valor) <= 150 && filter_var($valor, FILTER_VALIDATE_EMAIL) !== false;
}

function formatarCpf(string $valor): string
{
    $d = somenteDigitos($valor);
    return substr($d, 0, 3) . '.' . substr($d, 3, 3) . '.' . substr($d, 6, 3) . '-' . substr($d, 9, 2);
}

function formatarTelefone(string $valor): string
{
    $d = somenteDigitos($valor);
    $ddd = '(' . substr($d, 0, 2) . ') ';

    if (strlen($d) === 10) {
        return $ddd . substr($d, 2, 4) . '-' . substr($d, 6, 4);
    }

    return $ddd . substr($d, 2, 1) . ' ' . substr($d, 3, 4) . '-' . substr($d, 7, 4);
}