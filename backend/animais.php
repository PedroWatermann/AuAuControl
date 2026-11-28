<?php

require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/conexao.php';

$metodo = $_SERVER['REQUEST_METHOD'];

#region Método GET
// Obtenção de 1 ou mais animais

if ($metodo === 'GET') {
    if (isset($_GET['id'])) {
        $animal = buscarAnimal($con, lerId($_GET['id']));
        if ($animal === null) {
            responderErro('Animal não encontrado.', 404);
        }
        responderJson($animal);
    }

    responderJson(listarAnimais($con));
}
#endregion

// O site de hospedagem do AuAuControl, InfinityFree, não permite outros métodos
if ($metodo !== 'POST') {
    responderErro('Método não permitido.', 405);
}

#region Método POST
// Ações de novo, editar e excluir
$corpo = lerCorpoJson();
$acao = $corpo['acao'] ?? '';

if ($acao === 'salvar') {
    salvarAnimal($con, $corpo);
}
if ($acao === 'remover') {
    removerAnimal($con, $corpo);
}

responderErro('Ação inválida.', 400);
#endregion

#region Funções
function listarAnimais(mysqli $con): array
{
    $resultado = mysqli_execute_query(
        $con,
        'SELECT id, nome, peso, altura FROM animais ORDER BY nome'
    );
    return mysqli_fetch_all($resultado, MYSQLI_ASSOC);
}

function buscarAnimal(mysqli $con, int $id): ?array
{
    $resultado = mysqli_execute_query(
        $con,
        'SELECT id, nome, peso, altura FROM animais WHERE id = ?',
        [$id]
    );
    return mysqli_fetch_assoc($resultado);
}

function salvarAnimal(mysqli $con, array $corpo): never
{
    $id = empty($corpo['id']) ? null : lerId($corpo['id']);

    if ($id !== null && buscarAnimal($con, $id) === null) {
        responderErro('Animal não encontrado.', 404);
    }

    $nome = lerTexto($corpo, 'nome');
    $peso = lerNumero($corpo, 'peso');
    $altura = lerNumero($corpo, 'altura');

    $erros = [];

    if ($nome === '') {
        $erros[] = ['campo' => 'nome', 'mensagem' => 'Informe o nome do animal.'];
    } elseif (mb_strlen($nome) > 75) {
        $erros[] = ['campo' => 'nome', 'mensagem' => 'Nome muito longo (máximo 75 caracteres).'];
    }

    if ($peso === null || $peso <= 0 || $peso > 9999.99) {
        $erros[] = ['campo' => 'peso', 'mensagem' => 'O peso deve estar entre 0,01 a 9.999,99kg'];
    }

    if ($altura === null || $altura <= 0) {
        $erros[] = ['campo' => 'altura', 'mensagem' => 'A altura deve ser maior que zero.'];
    } elseif ($altura > 999.99) {
        $erros[] = ['campo' => 'altura', 'mensagem' => 'A altura deve ser no máximo 999,99 cm.'];
    }

    if (count($erros) > 0) {
        responderErrosValidacao($erros);
    }

    $valores = [$nome, $peso, $altura];

    if ($id === null) {
        mysqli_execute_query(
            $con,
            'INSERT INTO animais (nome, peso, altura) VALUES (?, ?, ?)',
            $valores
        );
        $novoId = mysqli_insert_id($con);
        responderJson(buscarAnimal($con, $novoId), 201);
    }

    $valores[] = $id;
    mysqli_execute_query(
        $con,
        'UPDATE animais SET nome = ?, peso = ?, altura = ? WHERE id = ?',
        $valores
    );
    responderJson(buscarAnimal($con, $id));
}

function removerAnimal(mysqli $con, array $corpo): never
{
    $id = lerId($corpo['id'] ?? null);

    $animal = buscarAnimal($con, $id);
    if ($animal === null) {
        responderErro('Animal não encontrado.', 404);
    }

    $resultado = mysqli_execute_query(
        $con,
        'SELECT COUNT(*) AS total FROM atendimentos WHERE id_animal = ?',
        [$id]
    );
    $total = (int) mysqli_fetch_assoc($resultado)['total'];

    if ($total > 0) {
        $texto = $total === 1
            ? '1 atendimento'
            : "{$total} atendimentos";
        responderErro($animal['nome'] . ' tem ' . $texto . ' e não pode ser removido.', 409);
    }

    mysqli_execute_query($con, 'DELETE FROM animais WHERE id = ?', [$id]);
    responderJson(['mensagem' => "Animal removido."]);
}

#endregion
