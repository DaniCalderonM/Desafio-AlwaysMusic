create database desafio1m7romidani;

\c desafio1m7romidani;

CREATE TABLE estudiantes (
    nombre VARCHAR(25),
    rut VARCHAR(14) PRIMARY KEY,
    curso VARCHAR(25),
    nivel INT
);