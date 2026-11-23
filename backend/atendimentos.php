<?php

require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/conexao.php';

$metodo = $_SERVER['REQUEST_METHOD'];

#region Método GET
// Obtenção de 1 ou mais atendimentos

if ($metodo === 'GET') {
    if (isset($_GET['id'])) {
        $atendimento = buscarAtendimento($con, lerId($_GET['id']));
        if ($atendimento === null) {
            responderErro('Atendimento não encontrado.', 404);
        }
        responderJson($atendimento);
    }

    responderJson(listarAtendimentos($con));
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
    salvarAtendimento($con, $corpo);
}
if ($acao === 'remover') {
    removerAtendimento($con, $corpo);
}

responderErro('Ação inválida.', 400);
#endregion

#region Funções
function listarAtendimentos(mysqli $con): array
{
    $resultado = mysqli_execute_query(
        $con,
        'SELECT id, data, id_cliente AS cliente, id_animal AS animal, id_funcionario AS funcionario
        FROM atendimentos
        ORDER BY data DESC, id DESC'
    );
    return mysqli_fetch_all($resultado, MYSQLI_ASSOC);
}

function buscarAtendimento(mysqli $con, int $id): ?array
{
    $resultado = mysqli_execute_query(
        $con,
        'SELECT id, data, id_cliente AS cliente, id_animal AS animal, id_funcionario AS funcionario
        FROM atendimentos
        WHERE id = ?', [$id] 
    );
    return mysqli_fetch_assoc ($resultado);
}

function salvarAtendimento(mysqli $con, array $corpo): never
{
    $id = empty($corpo['id']) ? null : lerId($corpo['id']);

    if ($id !== null && buscarAtendimento($con, $id) === null) {
        responderErro('Atendimento não encontrado.', 404);
    }

    $data = lerTexto($corpo, 'data');
    $cliente = lerInteiro($corpo, 'cliente');
    $animal = lerInteiro($corpo, 'animal');
    $funcionario = lerInteiro($corpo, 'funcionario');

    $erros = [];

    if ($data === '') {
        $erros[] = ['campo' => 'data', 'mensagem' => 'Informe a data do atendimento.'];
    } elseif (!dataValida($data)) {
        $erros[] = ['campo' => 'data', 'mensagem' => 'Data inválida.'];
    }

    if ($cliente === null){
        $erros[] = ['campo' => 'cliente', 'mensagem' => 'Selecione o cliente.'];    
    } elseif (!existeRegistro($con, 'clientes', $cliente)){
        $erros[] = ['campo' => 'cliente', 'mensagem' => 'Cliente não encontrado.'];
    }

    if ($animal === null){
        $erros[] = ['campo' => 'animal', 'mensagem' => 'Selecione o animal.'];    
    } elseif (!existeRegistro($con, 'animais', $animal)){
        $erros[] = ['campo' => 'animal', 'mensagem' => 'Animal não encontrado.'];
    }

    if ($funcionario === null){
        $erros[] = ['campo' => 'funcionario', 'mensagem' => 'Selecione o funcionario.'];    
    } elseif (!existeRegistro($con, 'funcionarios', $funcionario)){
        $erros[] = ['campo' => 'funcionario', 'mensagem' => 'Funcionário não encontrado.'];
    }

    if (count($erros) > 0) {
        responderErrosValidacao($erros);
    }

    $valores = [$data, $cliente, $animal, $funcionario];

    if ($id === null) {
        mysqli_execute_query(
            $con,
            'INSERT INTO atendimentos (data, id_cliente, id_animal, id_funcionario) VALUES (?, ?, ?, ?)',
            $valores
        );
        $novoId = mysqli_insert_id($con);
        responderJson(buscarAtendimento($con, $novoId), 201);
    }

    $valores[] = $id;
    mysqli_execute_query(
        $con,
        'UPDATE atendimentos SET data = ?, id_cliente = ?, id_animal = ?, id_funcionario = ? WHERE id = ?',
        $valores
    );
    responderJson(buscarAtendimento($con, $id));
}

function removerAtendimento(mysqli $con, array $corpo): never
{
    $id = lerId($corpo['id'] ?? null);

    if (buscarAtendimento($con, $id) === null) {
        responderErro('Atendimento não encontrado.', 404);
    }

    mysqli_execute_query($con, 'DELETE FROM atendimentos WHERE id = ?', [$id]);
    responderJson(['mensagem' => 'Atendimento removido.']);
}

function lerInteiro(array $dados, string $campo): ?int
{
    $valor = filter_var($dados[$campo] ?? null, FILTER_VALIDATE_INT);
    return $valor === false ? null : $valor;
}

function existeRegistro(mysqli $con, string $tabela, int $id): bool
{
    $resultado = mysqli_execute_query($con, "SELECT id FROM {$tabela} WHERE id = ?", [$id]);
    return mysqli_fetch_assoc($resultado) !== null;
}

function dataValida(string $texto): bool
{
    $data = DateTime::createFromFormat('Y-m-d', $texto);
    return $data !== false && $data->format('Y-m-d') === $texto;
}

#endregion