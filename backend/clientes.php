<?php

require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/conexao.php';
require_once __DIR__ . '/lib/validacoes.php';

$metodo = $_SERVER['REQUEST_METHOD'];

#region Método GET 
// Obtenção de 1 ou mais clientes

if ($metodo === 'GET') {
    if (isset($_GET['id'])) {
        $cliente = buscarCliente($con, lerId($_GET['id']));
        if ($cliente === null) {
            responderErro('Cliente não encontrado.', 404);
        }
        responderJson($cliente);
    }

    responderJson(listarClientes($con));
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
    salvarCliente($con, $corpo);
}

if ($acao === 'remover') {
    removerCliente($con, $corpo);
}

responderErro('Ação inválida.', 400);
#endregion

#region Funções
function listarClientes(mysqli $con): array
{
    $resultado = mysqli_execute_query(
        $con,
        'SELECT id, nome, telefone, email, rg, cpf FROM clientes ORDER BY nome'
    );
    return mysqli_fetch_all($resultado, MYSQLI_ASSOC);
}

function buscarCliente(mysqli $con, int $id): ?array
{
    $resultado = mysqli_execute_query(
        $con,
        'SELECT id, nome, telefone, email, rg, cpf FROM clientes WHERE id = ?',
        [$id]
    );
    return mysqli_fetch_assoc($resultado);
}

function cpfEmUso(mysqli $con, string $cpf, ?int $idIgnorado): bool
{
    $resultado = mysqli_execute_query(
        $con,
        'SELECT id FROM clientes WHERE cpf = ? AND id <> ?',
        [$cpf, $idIgnorado ?? 0]
    );
    return mysqli_fetch_assoc($resultado) !== null;
}

function salvarCliente(mysqli $con, array $corpo): never
{
    $id = empty($corpo['id']) ? null : lerId($corpo['id']);

    if ($id !== null && buscarCliente($con, $id) === null) {
        responderErro('Cliente não encontrado.', 404);
    }

    $nome = lerTexto($corpo, 'nome');
    $telefone = lerTexto($corpo, 'telefone');
    $email = lerTexto($corpo, 'email');
    $rg = lerTexto($corpo, 'rg');
    $cpf = lerTexto($corpo, 'cpf');

    $erros = [];

    if ($nome === '') {
        $erros[] = ['campo' => 'nome', 'mensagem' => 'Informe o nome do cliente.'];
    } elseif (mb_strlen($nome) > 75) {
        $erros[] = ['campo' => 'nome', 'mensagem' => 'Nome muito longo (máximo 75 caracteres).'];
    }

    if ($telefone === '') {
        $erros[] = ['campo' => 'telefone', 'mensagem' => 'Informe o telefone do cliente.'];
    } elseif (!validarTelefone($telefone)) {
        $erros[] = ['campo' => 'telefone', 'mensagem' => 'Telefone incompleto: informe o DDD e o número.'];
    } else {
        $telefone = formatarTelefone($telefone);
    }

    if ($email !== '' && !validarEmail($email)) {
        $erros[] = ['campo' => 'email', 'mensagem' => 'E-mail inválido.'];
    }

    if (mb_strlen($rg) > 12) {
        $erros[] = ['campo' => 'rg', 'mensagem' => 'RG inválido.'];
    }

    if ($cpf === '') {
        $erros[] = ['campo' => 'cpf', 'mensagem' => 'Informe o CPF do cliente.'];
    } elseif (!validarCpf($cpf)) {
        $erros[] = ['campo' => 'cpf', 'mensagem' => 'CPF inválido.'];
    } else {
        $cpf = formatarCpf($cpf);
        if (cpfEmUso($con, $cpf, $id)) {
            $erros[] = ['campo' => 'cpf', 'mensagem' => 'Já existe um cliente com este CPF.'];
        }
    }

    if (count($erros) > 0) {
        responderErrosValidacao($erros);
    }

    $valores = [$nome, $telefone, $email, $rg, $cpf];

    if ($id === null) {
        mysqli_execute_query(
            $con,
            'INSERT INTO clientes (nome, telefone, email, rg, cpf) VALUES (?, ?, ?, ?, ?)',
            $valores
        );
        $novoId = mysqli_insert_id($con);
        responderJson(buscarCliente($con, $novoId), 201);
    }

    $valores[] = $id;
    mysqli_execute_query(
        $con,
        'UPDATE clientes SET nome = ?, telefone = ?, email = ?, rg = ?, cpf = ? WHERE id = ?',
        $valores
    );
    responderJson(buscarCliente($con, $id));
}

function removerCliente(mysqli $con, array $corpo): never
{
    $id = lerId($corpo['id'] ?? null);

    $cliente = buscarCliente($con, $id);
    if ($cliente === null) {
        responderErro('Cliente não encontrado.', 404);
    }

    $resultado = mysqli_execute_query(
        $con,
        'SELECT COUNT(*) AS total FROM atendimentos WHERE id_cliente = ?',
        [$id]
    );
    $total = (int) mysqli_fetch_assoc($resultado)['total'];

    if ($total > 0) {
        $texto = $total === 1 ?
            '1 atendimento' :
            "{$total} atendimentos";
        responderErro($cliente['nome'] . ' tem ' . $texto . ' e não pode ser removido.', 409);
    }

    mysqli_execute_query($con, 'DELETE FROM clientes WHERE id = ?', [$id]);
    responderJson(['mensagem' => 'Cliente removido.']);
}
#endregion