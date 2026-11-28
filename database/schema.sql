DROP TABLE IF EXISTS atendimentos;
DROP TABLE IF EXISTS animais;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS funcionarios;

CREATE TABLE animais (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(75) NOT NULL,
    peso DECIMAL(6, 2) NOT NULL,  
    altura DECIMAL(5, 2) NOT NULL
);

CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(75) NOT NULL,
    telefone VARCHAR(16) NOT NULL,
    email VARCHAR(150),
    rg VARCHAR(12),
    cpf VARCHAR(14) NOT NULL UNIQUE
);

CREATE TABLE funcionarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(75) NOT NULL,
    numero_matricula VARCHAR(10) NOT NULL UNIQUE,
    qualificacao VARCHAR(150),
    descricao_funcao VARCHAR(255),
    carga_horaria_semanal INT NOT NULL
);

CREATE TABLE atendimentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data DATE NOT NULL,
    id_cliente INT NOT NULL,
    id_animal INT NOT NULL,
    id_funcionario INT NOT NULL,
    CONSTRAINT fk_id_cliente FOREIGN KEY (id_cliente) REFERENCES clientes (id),
    CONSTRAINT fk_id_animal FOREIGN KEY (id_animal) REFERENCES animais (id),
    CONSTRAINT fk_id_funcionario FOREIGN KEY (id_funcionario) REFERENCES funcionarios (id)
);