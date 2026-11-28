<?php

require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/conexao.php';

$metodo = $_SERVER['REQUEST_METHOD'];

#region Método GET
// Obtenção de 1 ou mais funcionarios

if ($metodo === 'GET') {
    if (isset($_GET['id'])) {
        $funcionario = buscarFuncionario($con, lerId($_GET['id']));
        if ($funcionario === null) {
            responderErro('Funcionário não encontrado.', 404);
        }
        responderJson($funcionario);
    }

    responderJson(listarFuncionarios($con));
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
    salvarFuncionario($con, $corpo);
}
if ($acao === 'remover') {
    removerFuncionario($con, $corpo);
}

responderErro('Ação inválida.', 400);
#endregion

#region Funções
function listarFuncionarios(mysqli $con): array
{
    $resultado = mysqli_execute_query(
        $con,
        'SELECT id, nome, numero_matricula AS numeroMatricula, qualificacao,
        descricao_funcao AS descricaoFuncao, carga_horaria_semanal AS cargaHorariaSemanal
        FROM funcionarios
        ORDER BY nome'    
    );
    return mysqli_fetch_all($resultado, MYSQLI_ASSOC);
}

function buscarFuncionario(mysqli $con, int $id): ?array
{
    $resultado = mysqli_execute_query(
        $con,
        'SELECT id, nome, numero_matricula AS numeroMatricula, qualificacao,
        descricao_funcao AS descricaoFuncao, carga_horaria_semanal AS cargaHorariaSemanal
        FROM funcionarios WHERE id = ?', [$id]
    );
    return mysqli_fetch_assoc($resultado);
}

function salvarFuncionario(mysqli $con, array $corpo): never
{
    $id = empty($corpo['id']) ? null : lerId($corpo['id']);

    if ($id !== null && buscarFuncionario($con, $id) === null) {
        responderErro('Funcionário não encontrado.', 404);
    }

    $nome = lerTexto($corpo, 'nome');
    $qualificacao = lerTexto($corpo, 'qualificacao');
    $funcao = lerTexto($corpo, 'funcao');
    $matricula = lerTexto($corpo, 'matricula');
    $cargaHoraria = lerInteiro($corpo, 'cargaHoraria');

    $erros = [];

    if ($nome === '') {
        $erros[] = ['campo' => 'nome', 'mensagem' => 'Informe o nome do funcionário.'];
    } elseif (mb_strlen($nome) > 75) {
        $erros[] = ['campo' => 'nome', 'mensagem' => 'Nome muito longo (máximo de 75 caracteres).'];
    }

    if ($qualificacao === ''){
        $erros[] = ['campo' => 'qualificacao', 'mensagem' => 'Informe uma qualificação.'];
    } elseif (mb_strlen($qualificacao) > 150){
        $erros[] = ['campo' => 'qualificacao', 'mensagem' => 'Qualificação muito longa (máximo de 150 caracteres).'];
    }

    if ($funcao === ''){
        $erros[] = ['campo' => 'funcao', 'mensagem' => 'Informe uma descrição.'];
    } elseif (mb_strlen($funcao) > 255){
        $erros[] = ['campo' => 'funcao', 'mensagem' => 'Descrição muito longa (máximo de 255 caracteres).'];
    }

    if ($cargaHoraria === null) {
        $erros[] = ['campo' => 'cargaHoraria', 'mensagem' => 'Insira um número inteiro.'];
    } elseif ($cargaHoraria <= 0 || $cargaHoraria > 100){
        $erros[] = ['campo' => 'cargaHoraria', 'mensagem' => 'A carga horária deve estar entre 1 a 100 horas semanais.'];
    }

    if ($matricula === ''){
        $erros[] = ['campo' => 'matricula', 'mensagem' => 'Informe o número de matrícula.'];
    } elseif (!ctype_digit($matricula)) {
        $erros[] = ['campo' => 'matricula', 'mensagem' => 'A matrícula deve ter apenas números.'];
    } elseif (mb_strlen($matricula) > 10) {
        $erros[] = ['campo' => 'matricula', 'mensagem' => 'Matrícula muito longa (máximo de 10 caracteres).'];
    } elseif (matriculaEmUso($con, $matricula, $id)) {
        $erros[] = ['campo' => 'matricula', 'mensagem' => 'Já existe um funcionário com esta matrícula.'];
    }
    
    if (count($erros) > 0) {
        responderErrosValidacao($erros);
    }   

    $valores = [$nome, $qualificacao, $funcao, $cargaHoraria, $matricula];

    if ($id === null) {
        mysqli_execute_query(
            $con,
            'INSERT INTO funcionarios (nome, qualificacao, descricao_funcao, carga_horaria_semanal, numero_matricula) VALUES (?, ?, ?, ?, ?)',
            $valores
        );
        $novoId = mysqli_insert_id($con);
        responderJson(buscarFuncionario($con, $novoId), 201);
    }

    $valores[] = $id;
    mysqli_execute_query(
        $con,
        'UPDATE funcionarios SET nome = ?, qualificacao = ?, descricao_funcao = ?, carga_horaria_semanal = ?, numero_matricula = ? WHERE id = ?',
        $valores
    );
    responderJson(buscarFuncionario($con, $id));
}


function removerFuncionario(mysqli $con, array $corpo): never
{
    $id = lerId($corpo['id'] ?? null);

    $funcionario = buscarFuncionario($con, $id);
    if ($funcionario === null) {
        responderErro('Funcionário não encontrado.', 404);
    }

    $resultado = mysqli_execute_query(
        $con,
        'SELECT COUNT(*) AS total FROM atendimentos WHERE id_funcionario = ?',
        [$id]
    );
    $total = (int) mysqli_fetch_assoc($resultado)['total'];

    if ($total > 0) {
        $texto = $total === 1
            ? '1 atendimento'
            : "{$total} atendimentos";
        responderErro($funcionario['nome'] . ' tem ' . $texto . ' e não pode ser removido.', 409);
    }

    mysqli_execute_query($con, 'DELETE FROM funcionarios WHERE id = ?', [$id]);
    responderJson(['mensagem' => "Funcionário removido."]);
}

function matriculaEmUso(mysqli $con, string $matricula, ?int $idIgnorado): bool
{
    $resultado = mysqli_execute_query(
        $con,
        'SELECT id FROM funcionarios WHERE numero_matricula = ? AND id <> ?',
        [$matricula, $idIgnorado ?? 0]
    );
    return mysqli_fetch_assoc($resultado) !== null;
}
#endregion
