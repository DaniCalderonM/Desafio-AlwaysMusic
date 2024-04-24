//Importar pg y su Clase Pool
const { Pool } = require("pg");

// Configuración de la base de datos - Objeto de conexion
const config = {
    user: "postgres",
    host: "localhost",
    //password: "1234",
    database: "desafio1m7romidani",
    port: 5432
};

const pool = new Pool(config);

// manejo del process.argv - capturar datos por la linea de comandos
const argumentos = process.argv.slice(2);
// posicion 0 funcion a usar
const funcion = argumentos[0];

// resto de posiciones los otros campos
const nombre = argumentos[1];
const rut = argumentos[2];
const curso = argumentos[3];
const nivel = argumentos[4];
//Funcion para manejo de errores
const manejoErrores = (error, pool, tabla) => {
    console.log("Error producido: ", error);
    console.log("Codigo de error PG producido: ", error.code);
    switch (error.code) {
        case '28P01':
            console.log("autentificacion password falló o no existe usuario: " + pool.options.user);
            break;
        case '23505':
            console.log("El estudiante ya existe");
            break;
        case '42P01':
            console.log("No existe la tabla [" + tabla + "] consultada");
            break;
        case '3D000':
            console.log("Base de Datos [" + pool.options.database + "] no existe");
            break;
        case '28000':
            console.log("El rol [" + pool.options.user + "] no existe");
            break;
        case '42601':
            console.log("Error de sintaxis en la instruccion SQL");
            break;
        case 'ENOTFOUND':
            console.log("Error en valor usado como localhost: " + pool.options.host);
            break;
        case 'ECONNREFUSED':
            console.log("Error en el puerto de conexion a BD, usando: " + pool.options.port);
            break;
        default:
            console.log("Error interno del servidor");
            break;
    }
};
//Funcion para validar rut
const validarRut = (rut) => {
    const rutExpReg = /^\d{1,2}\.\d{3}\.\d{3}-\d{1,2}$/;
    return rutExpReg.test(rut);
}
//Funcion para consultar todos los estudiantes
const getEstudiantes = async () => {
    try {
        const res = await pool.query("SELECT * FROM estudiantes");
        console.log("Registro actual de Estudiantes:", res.rows);
    } catch (error) {
        // manejo general de errores
        manejoErrores(error, pool, 'estudiantes');
    }
}
//Funcion para consultar por rut
const consultaRut = async ({ rut }) => {
    try {
        const res = await pool.query(
            `SELECT * FROM estudiantes WHERE rut = $1`, [rut]
        );
        if (!rut) {
            console.log("Debe ingresar el campo rut")
        }
        else if (!validarRut(rut)) {
            console.log("El rut ingresado no tiene el formato correcto, ejemplo: 11.111.111-1")
        }
        else if (res.rows == 0) {
            console.log("El rut ingresado no existe");
        } else {
            console.log("Estudiante consultado: ", res.rows[0]);
        }
    } catch (error) {
        // manejo general de errores
        manejoErrores(error, pool, 'estudiantes');
    }
}
//Funcion para agregar un nuevo estudiante
const nuevoEstudiante = async ({ nombre, rut, curso, nivel }) => {
    try {
        if (!validarRut(rut)) {
            console.log("El rut ingresado no tiene el formato correcto ejemplo: 11.111.111-1");
        } else if (!nombre || !curso || !nivel) {
            console.log("Debe ingresar los campos nombre, rut, curso y nivel");
        } else {
            const res = await pool.query(
                `INSERT INTO estudiantes values ($1, $2, $3, $4) RETURNING *`, [nombre, rut, curso, nivel]
            );
            console.log(`Estudiante ${nombre} agregado con éxito`);
            console.log("Estudiante Agregado: ", res.rows[0]);
        }
    } catch (error) {
        // manejo general de errores
        manejoErrores(error, pool, 'estudiantes');
    }
}
//Funcion para editar un estudiante por su nombre
const editarEstudiante = async ({ nombre, rut, curso, nivel }) => {
    try {
        const res = await pool.query(
            `UPDATE estudiantes SET nombre = $1, rut = $2, curso = $3, nivel = $4 WHERE nombre = $1 RETURNING *`, [nombre, rut, curso, nivel]
        );
        if (!validarRut(rut)) {
            console.log("El rut ingresado no tiene el formato correcto, ejemplo: 11.111.111-1");
        } else if (!nombre || !curso || !nivel) {
            console.log("Debe ingresar los campos nombre, rut, curso y nivel");
        } else if (res.rows == 0) {
            console.log("El estudiante ingresado no existe");
        }
        else {
            console.log(`Estudiante ${nombre} editado con éxito`);
            console.log("Estudiante Editado: ", res.rows[0]);
        }
    } catch (error) {
    // manejo general de errores
    manejoErrores(error, pool, 'estudiantes');
}
}
//Funcion para eliminar un estudiante por su rut
const eliminarEstudiante = async ({ rut }) => {
    try {
        const res = await pool.query(
            `DELETE FROM estudiantes where rut = $1 RETURNING *`, [rut]
        );
        if (!rut) {
            console.log("Debe ingresar el campo rut")
        }
        else if (!validarRut(rut)) {
            console.log("El rut ingresado no tiene el formato correcto, ejemplo: 11.111.111-1")
        }
        else if (res.rows == 0) {
            console.log("El rut ingresado no existe");
        } else {
            console.log(`Registro de Estudiante con rut ${rut} eliminado con éxito`);
        }
    } catch (error) {
        // manejo general de errores
        manejoErrores(error, pool, 'estudiantes');
    }
}

// Funcion IIFE que recibe de la linea de comando y llama funciones asincronas internas
(() => {
    // recibir funciones y campos de la linea de comando
    switch (funcion) {
        case 'nuevo':
            nuevoEstudiante({ nombre, rut, curso, nivel })
            break;
        case 'rut':
            consultaRut({ rut })
            break;
        case 'consulta':
            getEstudiantes()
            break;
        case 'editar':
            editarEstudiante({ nombre, rut, curso, nivel })
            break;
        case 'eliminar':
            eliminarEstudiante({ rut })
            break;
        default:
            console.log("Funcion: " + funcion + " no es valida")
            break;
    }

    pool.end()
})()

// instrucciones de uso:
// ingresar nuevo estudiante: node server nuevo 'Pedro Paramo' '13.245.003-8' 'Biologia' 5
// consultar todos: node server consulta
// consultar por rut: node server rut - '13.245.003-8'
// editar estudiante por nombre: node server editar 'Pedro Paramo' '13.245.123-5' 'Biologia II' 8
// eliminar estudiante por rut:  node server eliminar - '13.245.123-5'