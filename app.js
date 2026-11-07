// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================

const supabaseUrl =
    'https://pfmkygwbnbrdhykhrnao.supabase.co/rest/v1/estudiantes?select=*';

const supabaseKey =
    'sb_publishable_25jDuEx84acqCID_p1AmAQ_XaNKGxMC';


// ==========================================
// FUNCIÓN PARA OBTENER LOS ESTUDIANTES
// ==========================================

async function cargarEstudiantes() {

    const cuerpoTabla = document.getElementById('cuerpo-tabla');

    if (!cuerpoTabla) {
        console.error('No se encontró el elemento cuerpo-tabla.');
        return;
    }

    cuerpoTabla.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;">
                Cargando estudiantes...
            </td>
        </tr>
    `;

    try {

        const respuesta = await fetch(supabaseUrl, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey
            }
        });

        // Mostrar errores reales de Supabase
        if (!respuesta.ok) {

            const detalle = await respuesta.text();

            throw new Error(
                `HTTP ${respuesta.status}: ${detalle}`
            );
        }

        const estudiantes = await respuesta.json();

        console.log('Estudiantes recibidos:', estudiantes);

        cuerpoTabla.innerHTML = '';

        // Si no hay estudiantes
        if (estudiantes.length === 0) {

            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No hay alumnos registrados aún.
                    </td>
                </tr>
            `;

            return;
        }

        // Dibujar estudiantes
        estudiantes.forEach(alumno => {

            const fila = document.createElement('tr');

            // DNI
            const tdDni = document.createElement('td');

            const strong = document.createElement('strong');
            strong.textContent = alumno.dni || '';

            tdDni.appendChild(strong);

            // Nombre completo
            const tdNombre = document.createElement('td');

            tdNombre.textContent =
                `${alumno.apellidos || ''}, ${alumno.nombres || ''}`;

            // Carrera
            const tdCarrera = document.createElement('td');

            tdCarrera.textContent =
                alumno.carrera_interes || '';

            // WhatsApp
            const tdWhatsapp = document.createElement('td');

            if (alumno.whatsapp) {

                const enlace = document.createElement('a');

                const numero = String(alumno.whatsapp)
                    .replace(/\D/g, '');

                enlace.href = `https://wa.me/51${numero}`;
                enlace.target = '_blank';
                enlace.rel = 'noopener noreferrer';
                enlace.textContent = `📱 ${alumno.whatsapp}`;

                tdWhatsapp.appendChild(enlace);
            }

            // Tutor
            const tdTutor = document.createElement('td');

            tdTutor.textContent =
                `${alumno.nombre_tutor || ''} ${alumno.apellido_tutor || ''} (${alumno.telefono_tutor || ''})`;

            // ==========================================
            // BOTONES DE ACCIÓN EN LA TABLA PRINCIPAL
            // ==========================================

            const tdAcciones = document.createElement('td');

            // Nombre completo del estudiante
            const nombreCompleto =
                `${alumno.nombres || ''} ${alumno.apellidos || ''}`;

            // BOTÓN VER NOTAS
            const btnNotas = document.createElement('button');

            btnNotas.className = 'btn-secundario';
            btnNotas.style.marginRight = '5px';
            btnNotas.textContent = 'Ver Notas';

            btnNotas.onclick = () => {

                if (typeof window.verPerfil === 'function') {

                    window.verPerfil(
                        alumno.dni,
                        nombreCompleto
                    );

                } else {

                    console.error(
                        'No existe la función verPerfil().'
                    );

                }

            };

            // BOTÓN ENTREVISTA
            const btnEntrevista = document.createElement('button');

            btnEntrevista.className = 'btn-primario';
            btnEntrevista.style.backgroundColor = '#17a2b8';
            btnEntrevista.textContent = 'Entrevista';

            btnEntrevista.onclick = () => {

                if (typeof window.abrirEntrevista === 'function') {

                    window.abrirEntrevista(
                        alumno.dni,
                        nombreCompleto
                    );

                } else {

                    console.error(
                        'No existe la función abrirEntrevista().'
                    );

                }

            };

            // BOTÓN EXPEDIENTE ACADÉMICO INTEGRAL
            const btnExpediente = document.createElement('button');
            btnExpediente.className = 'btn-secundario';
            btnExpediente.style.marginLeft = '5px';
            btnExpediente.style.backgroundColor = '#142d4e';
            btnExpediente.style.color = '#fff';
            btnExpediente.textContent = 'Expediente';
            btnExpediente.onclick = () => {
                if (typeof window.abrirExpedienteIntegral === 'function') {
                    window.abrirExpedienteIntegral(alumno.dni);
                } else {
                    console.error('No se pudo abrir el expediente integral.');
                }
            };

            // Agregar botones a la celda
            tdAcciones.appendChild(btnNotas);
            tdAcciones.appendChild(btnEntrevista);
            tdAcciones.appendChild(btnExpediente);

            // ==========================================
            // AGREGAR COLUMNAS A LA FILA
            // ==========================================

            fila.appendChild(tdDni);
            fila.appendChild(tdNombre);
            fila.appendChild(tdCarrera);
            fila.appendChild(tdWhatsapp);
            fila.appendChild(tdTutor);
            fila.appendChild(tdAcciones);

            cuerpoTabla.appendChild(fila);

        });

    } catch (error) {

        console.error(
            'ERROR AL CARGAR ESTUDIANTES:',
            error
        );

        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center; color:red;">
                    Error al cargar la base de datos.
                    Revisa la consola para más detalles.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// CARGAR DATOS AL ABRIR LA PÁGINA
// ==========================================

document.addEventListener(
    'DOMContentLoaded',
    cargarEstudiantes
);


// ==========================================
// BUSCADOR EN TIEMPO REAL
// ==========================================

const inputBuscador = document.getElementById('buscador');

if (inputBuscador) {
    inputBuscador.addEventListener('keyup', function() {
        const termino = this.value.toLowerCase();
        const filas = document.querySelectorAll('#cuerpo-tabla tr');

        filas.forEach(fila => {
            // Ignorar la fila de "Cargando" o "No hay alumnos"
            if (fila.cells.length === 1) return;

            const dni = fila.cells[0].textContent.toLowerCase();
            const nombre = fila.cells[1].textContent.toLowerCase();

            if (dni.includes(termino) || nombre.includes(termino)) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
    });
}

// Botón de Actualizar Datos
const btnActualizar = document.querySelector('.btn-primario');
if (btnActualizar) {
    btnActualizar.addEventListener('click', () => {
        if(inputBuscador) inputBuscador.value = ''; // Limpiar buscador
        cargarEstudiantes();
    });
}


// ==========================================
// GESTIÓN DEL MODAL DE PERFIL Y NOTAS
// ==========================================

let dniActualParaNota = '';
let nombreActualParaNota = '';
let idSimulacroEditando = null; // Guardará el ID si estamos editando, null si es nuevo

async function verPerfil(dniAlumno, nombreAlumno) {
    const modal = document.getElementById('modal-perfil');
    dniActualParaNota = dniAlumno;
    nombreActualParaNota = nombreAlumno;
    
    document.getElementById('modal-nombre-alumno').textContent = nombreAlumno;
    document.getElementById('modal-dni-alumno').textContent = dniAlumno;
    
    const cuerpoNotas = document.getElementById('modal-cuerpo-notas');
    cuerpoNotas.innerHTML = '<tr><td colspan="5" style="text-align:center;">Buscando registros en la base de datos...</td></tr>';
    
    modal.classList.remove('modal-oculto');
    modal.classList.add('modal-visible');
    try {
        const urlSimulacros = `https://pfmkygwbnbrdhykhrnao.supabase.co/rest/v1/simulacros?dni_estudiante=eq.${dniAlumno}&select=*&order=numero_simulacro.asc`;
        
        const respuesta = await fetch(urlSimulacros, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': 'Bearer ' + supabaseKey
            }
        });

        if (!respuesta.ok) throw new Error('Error al obtener notas');
        const notas = await respuesta.json();
        
        cuerpoNotas.innerHTML = '';

        if (notas.length === 0) {
            cuerpoNotas.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #666;">No se encontraron simulacros registrados para este alumno.</td></tr>';
            return;
        }

        // Dibujar cada nota y el botón de editar
        notas.forEach(nota => {
            const fila = document.createElement('tr');
            
            let mejoras = '';
            if (nota.accion_mejora_1) mejoras += `<p>• ${nota.accion_mejora_1}</p>`;
            if (nota.accion_mejora_2) mejoras += `<p>• ${nota.accion_mejora_2}</p>`;
            if (nota.accion_mejora_3) mejoras += `<p>• ${nota.accion_mejora_3}</p>`;
            
            // Creamos las celdas principales
            fila.innerHTML = `
                <td>${nota.fase}</td>
                <td>Simulacro N° ${nota.numero_simulacro}</td>
                <td><strong>${nota.puntaje_total}</strong> <br> <small>(M: ${nota.puntaje_matematica} | L: ${nota.puntaje_letras})</small></td>
                <td>${mejoras || '<span style="color:#aaa;">Sin acciones registradas</span>'}</td>
            `;

            // Botón de Editar
            const tdAcciones = document.createElement('td');
            const btnEditar = document.createElement('button');
            btnEditar.className = 'btn-secundario';
            btnEditar.style = 'padding: 5px; font-size: 12px;';
            btnEditar.textContent = '✏️ Editar';
            btnEditar.onclick = () => abrirFormularioEdicion(nota); // Llama a la función enviando los datos de la nota
            tdAcciones.appendChild(btnEditar);
            fila.appendChild(tdAcciones);

            cuerpoNotas.appendChild(fila);
        });

    } catch (error) {
        console.error('Error al cargar notas:', error);
        cuerpoNotas.innerHTML = '<tr><td colspan="5" style="text-align:center; color: red;">Hubo un error al cargar el historial de notas.</td></tr>';
    }
}

// ==========================================
// FUNCIONES PARA CERRAR MODALES (CORREGIDO)
// ==========================================

function cerrarModal() {
    const modal = document.getElementById('modal-perfil');
    modal.classList.remove('modal-visible');
    modal.classList.add('modal-oculto');
}

function cerrarModalSimulacro() {
    const modal = document.getElementById('modal-simulacro');
    modal.classList.remove('modal-visible');
    modal.classList.add('modal-oculto');
}

// Cierra SOLO el modal de perfil al hacer clic fuera.
window.onclick = function(event) {
    const modalPerfil = document.getElementById('modal-perfil');
    
    if (event.target === modalPerfil) {
        cerrarModal();
    }
}

// ==========================================
// REGISTRO Y EDICIÓN DE SIMULACROS
// ==========================================

function abrirFormularioNota() {
    idSimulacroEditando = null; // null significa que es un simulacro NUEVO
    document.getElementById('form-dni-alumno').textContent = dniActualParaNota;
    document.getElementById('form-notas').reset();
    document.querySelector('#modal-simulacro h2').textContent = 'Registrar Nuevo Simulacro';
    
    document.getElementById('modal-simulacro').classList.remove('modal-oculto');
    document.getElementById('modal-simulacro').classList.add('modal-visible');
}

function abrirFormularioEdicion(nota) {
    idSimulacroEditando = nota.id; // Guardamos el ID de la nota a editar
    document.getElementById('form-dni-alumno').textContent = dniActualParaNota;
    
    // Llenar el formulario con los datos existentes
    document.getElementById('sim-fase').value = nota.fase;
    document.getElementById('sim-numero').value = nota.numero_simulacro;
    document.getElementById('sim-mate').value = nota.puntaje_matematica;
    document.getElementById('sim-letras').value = nota.puntaje_letras;
    document.getElementById('sim-mejora1').value = nota.accion_mejora_1 || '';
    document.getElementById('sim-mejora2').value = nota.accion_mejora_2 || '';

    document.querySelector('#modal-simulacro h2').textContent = 'Editar Simulacro Registrado';
    
    document.getElementById('modal-simulacro').classList.remove('modal-oculto');
    document.getElementById('modal-simulacro').classList.add('modal-visible');
}

async function guardarNotaSimulacro(evento) {
    evento.preventDefault(); 
    
    const botonGuardar = document.getElementById('btn-guardar-nota');
    botonGuardar.textContent = 'Guardando...';
    botonGuardar.disabled = true;

    const mate = parseFloat(document.getElementById('sim-mate').value) || 0;
    const letras = parseFloat(document.getElementById('sim-letras').value) || 0;
    
    const payload = {
        dni_estudiante: dniActualParaNota,
        fase: document.getElementById('sim-fase').value,
        numero_simulacro: parseInt(document.getElementById('sim-numero').value),
        puntaje_matematica: mate,
        puntaje_letras: letras,
        puntaje_total: mate + letras,
        accion_mejora_1: document.getElementById('sim-mejora1').value,
        accion_mejora_2: document.getElementById('sim-mejora2').value
    };

    // Si estamos editando, usamos PATCH y apuntamos al ID. Si es nuevo, POST normal.
    const url = idSimulacroEditando 
        ? `https://pfmkygwbnbrdhykhrnao.supabase.co/rest/v1/simulacros?id=eq.${idSimulacroEditando}`
        : 'https://pfmkygwbnbrdhykhrnao.supabase.co/rest/v1/simulacros';
        
    const metodoHttp = idSimulacroEditando ? 'PATCH' : 'POST';

    try {
        const respuesta = await fetch(url, {
            method: metodoHttp,
            headers: {
                'apikey': supabaseKey,
                'Authorization': 'Bearer ' + supabaseKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal' 
            },
            body: JSON.stringify(payload)
        });

        if (!respuesta.ok) throw new Error('Error al guardar en Supabase');

        alert(idSimulacroEditando ? '¡Nota actualizada correctamente!' : '¡Nota guardada exitosamente!');
        cerrarModalSimulacro();
        
        // Recargar las notas en el modal del perfil
        verPerfil(dniActualParaNota, nombreActualParaNota);

    } catch (error) {
        console.error(error);
        alert('Hubo un error al guardar la nota. Revisa la consola.');
    } finally {
        botonGuardar.textContent = 'Guardar Nota';
        botonGuardar.disabled = false;
    }
}


/* ==========================================
   GESTIÓN DE ENTREVISTA DIAGNÓSTICA
========================================== */

let dniEntrevistaActual = '';
let valoracionGuardada = false;
let datosOriginalesValoracion = {};

// Campos de la valoración docente
const camposValoracion = {
    fortalezas: 'val-fortalezas',
    dificultades: 'val-dificultades',
    acuerdo_habitos: 'val-acuerdo-habitos',
    acuerdo_meta: 'val-acuerdo-meta'
};

// Obtener información del formulario
function obtenerDatosValoracion() {
    const datos = {};

    Object.entries(camposValoracion).forEach(([campo, id]) => {
        datos[campo] = document.getElementById(id).value;
    });

    return datos;
}

// Cargar información en el formulario
function cargarDatosValoracion(datos) {
    Object.entries(camposValoracion).forEach(([campo, id]) => {
        document.getElementById(id).value = datos[campo] || '';
    });
}

// Comprobar si existe una valoración registrada
function tieneValoracion(datos) {
    return Object.values(datos).some(valor =>
        String(valor || '').trim() !== ''
    );
}

// Cambiar estado visual
function actualizarEstadoValoracion(estado, mensaje) {
    const contenedor = document.getElementById('estado-valoracion');
    const texto = document.getElementById('texto-estado-valoracion');

    contenedor.className = `estado-valoracion ${estado}`;
    texto.textContent = mensaje;
}

// Activar o desactivar campos
function establecerEdicion(activo) {
    Object.values(camposValoracion).forEach(id => {
        document.getElementById(id).disabled = !activo;
    });

    document.getElementById('btn-guardar-valoracion').hidden = !activo;
    document.getElementById('btn-editar-valoracion').hidden = activo;
    document.getElementById('btn-cancelar-valoracion').hidden = !activo;
}

// Abrir entrevista
async function abrirEntrevista(dniAlumno, nombreAlumno) {

    dniEntrevistaActual = dniAlumno;
    valoracionGuardada = false;

    document.getElementById('entrevista-nombre-alumno').textContent =
        nombreAlumno;

    const panelAlumno = document.getElementById(
        'entrevista-respuestas-alumno'
    );

    const formulario = document.getElementById('form-valoracion');
    const botonGuardar = document.getElementById(
        'btn-guardar-valoracion'
    );

    formulario.reset();
    establecerEdicion(false);

    botonGuardar.disabled = true;
    actualizarEstadoValoracion('pendiente', 'Consultando evaluación...');

    panelAlumno.innerHTML = `
        <p class="mensaje-cargando">
            Consultando información del estudiante...
        </p>
    `;

    const modal = document.getElementById('modal-entrevista');
    modal.classList.remove('modal-oculto');
    modal.classList.add('modal-visible');

    try {

        const url = new URL(
            'https://pfmkygwbnbrdhykhrnao.supabase.co/rest/v1/entrevistas_diagnosticas'
        );

        url.searchParams.set('dni_estudiante', `eq.${dniAlumno}`);
        url.searchParams.set('select', '*');

        const respuesta = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': 'Bearer ' + supabaseKey
            }
        });

        if (!respuesta.ok) {
            throw new Error('No se pudieron consultar los datos.');
        }

        const datos = await respuesta.json();

        if (!datos.length) {

            panelAlumno.innerHTML = `
                <div class="entrevista-pendiente">
                    <strong>Entrevista pendiente</strong>
                    <p>
                        El alumno aún no ha completado el formulario
                        de diagnóstico.
                    </p>
                </div>
            `;

            actualizarEstadoValoracion(
                'pendiente',
                'Esperando respuestas del estudiante'
            );

            return;
        }

        const entrevista = datos[0];

       // Mostrar TODAS las respuestas del estudiante
const escapar = valor => String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

// Mostrar valores sin perder los datos 0 o false
const mostrarValor = valor => {
    if (valor === null || valor === undefined || valor === '') {
        return 'No especificado';
    }

    if (typeof valor === 'boolean') {
        return valor ? 'Sí' : 'No';
    }

    return escapar(valor);
};

// Definir todos los campos del diagnóstico
const camposEntrevista = [
    {
        titulo: 'Experiencia en secundaria',
        campo: 'experiencia_secundaria'
    },
    {
        titulo: 'Cursos en los que destaca',
        campo: 'cursos_fortaleza'
    },
    {
        titulo: 'Cursos que presentan dificultades',
        campo: 'cursos_dificultad'
    },
    {
        titulo: 'Horas de estudio al día',
        campo: 'horas_estudio'
    },
    {
        titulo: '¿Tiene un horario de estudio?',
        campo: 'tiene_horario'
    },
    {
        titulo: 'Técnicas de estudio',
        campo: 'tecnicas_estudio'
    },
    {
        titulo: '¿Qué le interrumpe durante el estudio?',
        campo: 'interrupciones_estudio'
    },
    {
        titulo: 'Organización del tiempo',
        campo: 'organizacion_tiempo'
    },
    {
        titulo: 'Motivación para ingresar a San Marcos',
        campo: 'motivo_san_marcos'
    },
    {
        titulo: 'Carrera de primera opción',
        campo: 'carrera_primera_opcion'
    },
    {
        titulo: 'Carrera de segunda opción',
        campo: 'carrera_segunda_opcion'
    },
    {
        titulo: 'Reacción ante una calificación baja',
        campo: 'reaccion_baja_nota'
    },
    {
        titulo: 'Manejo de ansiedad',
        campo: 'manejo_ansiedad'
    },
    {
        titulo: 'Compromiso con el programa',
        campo: 'compromiso_programa'
    }
];

// Generar automáticamente las respuestas
panelAlumno.innerHTML = `
    <div class="entrevista-respuestas-completas">

        <div class="entrevista-seccion-titulo">
            <h3>Diagnóstico del estudiante</h3>
            <span>Información proporcionada por el alumno</span>
        </div>

        <div class="entrevista-respuestas-grid">

            ${camposEntrevista.map(item => `
                <div class="respuesta-item">
                    <strong>${escapar(item.titulo)}</strong>
                    <span>${mostrarValor(entrevista[item.campo])}</span>
                </div>
            `).join('')}

        </div>

        <div class="entrevista-fecha">
            <strong>Fecha de entrevista:</strong>
            <span>
                ${entrevista.fecha_entrevista
                    ? escapar(new Date(entrevista.fecha_entrevista)
                        .toLocaleString('es-PE'))
                    : 'No especificada'}
            </span>
        </div>

    </div>
`;

        // Recuperar valoración anterior
        const valoracion = {
            fortalezas: entrevista.docente_fortalezas || '',
            dificultades: entrevista.docente_dificultades || '',
            acuerdo_habitos: entrevista.acuerdo_habitos || '',
            acuerdo_meta: entrevista.acuerdo_meta || ''
        };

        cargarDatosValoracion(valoracion);

        datosOriginalesValoracion = { ...valoracion };

        valoracionGuardada = tieneValoracion(valoracion);

        botonGuardar.disabled = false;

        if (valoracionGuardada) {

            establecerEdicion(false);

            actualizarEstadoValoracion(
                'registrada',
                'Evaluación registrada'
            );

        } else {

            establecerEdicion(true);

            actualizarEstadoValoracion(
                'pendiente',
                'Pendiente de valoración docente'
            );
        }

    } catch (error) {

        console.error('Error al abrir entrevista:', error);

        panelAlumno.innerHTML = `
            <p class="error-entrevista">
                No fue posible cargar la información.
                Intenta nuevamente.
            </p>
        `;

        actualizarEstadoValoracion(
            'error',
            'Error al consultar la información'
        );
    }
}


// Guardar o actualizar valoración
async function guardarValoracion(evento) {

    evento.preventDefault();

    if (!dniEntrevistaActual) {
        alert('No se ha seleccionado un estudiante.');
        return;
    }

    const boton = document.getElementById(
        'btn-guardar-valoracion'
    );

    const botonEditar = document.getElementById(
        'btn-editar-valoracion'
    );

    const botonCancelar = document.getElementById(
        'btn-cancelar-valoracion'
    );

    const datos = obtenerDatosValoracion();

    // Evitar guardar un formulario completamente vacío
    if (!tieneValoracion(datos)) {
        alert('Completa al menos un campo de la valoración docente.');
        return;
    }

    boton.disabled = true;
    boton.textContent = 'Guardando...';

    botonEditar.disabled = true;
    botonCancelar.disabled = true;

    actualizarEstadoValoracion(
        'guardando',
        'Guardando evaluación...'
    );

    try {

        const url = new URL(
            'https://pfmkygwbnbrdhykhrnao.supabase.co/rest/v1/entrevistas_diagnosticas'
        );

        url.searchParams.set(
            'dni_estudiante',
            `eq.${dniEntrevistaActual}`
        );

        const respuesta = await fetch(url, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': 'Bearer ' + supabaseKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                docente_fortalezas: datos.fortalezas,
                docente_dificultades: datos.dificultades,
                acuerdo_habitos: datos.acuerdo_habitos,
                acuerdo_meta: datos.acuerdo_meta
            })
        });

        if (!respuesta.ok) {
            const error = await respuesta.text();
            throw new Error(error || 'Error al actualizar.');
        }

        const registrosActualizados = await respuesta.json();

        // Verificar que Supabase realmente haya actualizado una fila
        if (!Array.isArray(registrosActualizados) ||
            registrosActualizados.length === 0) {
            throw new Error(
                'No se encontró el registro del estudiante o no tienes permisos para modificarlo.'
            );
        }

        // Actualizar estado local
        datosOriginalesValoracion = { ...datos };
        valoracionGuardada = true;

        establecerEdicion(false);

        actualizarEstadoValoracion(
            'registrada',
            'Evaluación guardada correctamente'
        );

        // Mensaje visual sin interrumpir al docente
        mostrarNotificacion(
            'Evaluación guardada correctamente.',
            'success'
        );

    } catch (error) {

        console.error('Error al guardar:', error);

        actualizarEstadoValoracion(
            'error',
            'No se pudo guardar la evaluación'
        );

        mostrarNotificacion(
            error.message || 'Ocurrió un error al guardar.',
            'error'
        );

    } finally {

        boton.textContent = 'Guardar Evaluación';
        boton.disabled = false;

        botonEditar.disabled = false;
        botonCancelar.disabled = false;
    }
}


// Activar edición
function editarValoracion() {

    establecerEdicion(true);

    actualizarEstadoValoracion(
        'editando',
        'Estás editando una evaluación registrada'
    );

    document.getElementById('btn-guardar-valoracion').textContent =
        'Guardar cambios';
}


// Cancelar edición
function cancelarEdicionValoracion() {

    // Recuperar los datos guardados anteriormente
    cargarDatosValoracion(datosOriginalesValoracion);

    establecerEdicion(false);

    actualizarEstadoValoracion(
        'registrada',
        'Evaluación registrada'
    );

    document.getElementById('btn-guardar-valoracion').textContent =
        'Guardar Evaluación';
}


// Notificaciones visuales
function mostrarNotificacion(mensaje, tipo = 'success') {

    let notificacion = document.getElementById(
        'notificacion-valoracion'
    );

    if (!notificacion) {

        notificacion = document.createElement('div');
        notificacion.id = 'notificacion-valoracion';

        document.body.appendChild(notificacion);
    }

    notificacion.className = `notificacion-valoracion ${tipo}`;
    notificacion.textContent = mensaje;

    notificacion.classList.add('mostrar');

    clearTimeout(window.timeoutNotificacion);

    window.timeoutNotificacion = setTimeout(() => {
        notificacion.classList.remove('mostrar');
    }, 3500);
}


// Cerrar modal
function cerrarModalEntrevista() {

    const modal = document.getElementById('modal-entrevista');

    modal.classList.remove('modal-visible');
    modal.classList.add('modal-oculto');
}


/* ============================================================
   MÓDULO INDEPENDIENTE: BASE DE DATOS
   Se añade sin reemplazar las funciones existentes del portal.
   Incluye: consultas, estadísticas, gráficos, filtros y CSV.
============================================================ */
(() => {
    'use strict';

    const DB_API = 'https://pfmkygwbnbrdhykhrnao.supabase.co/rest/v1';
    const DB_HEADERS = {
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey
    };

    const state = {
        estudiantes: [],
        entrevistas: [],
        simulacros: [],
        tab: 'resumen',
        search: '',
        carrera: '',
        fase: '',
        loading: false,
        loaded: false
    };

    const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);

    const fmtDate = value => {
        if (!value) return '—';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-PE');
    };

    const fullName = student =>
        `${student?.nombres || ''} ${student?.apellidos || ''}`.trim() || 'Sin nombre';

    async function fetchTable(table, query = {}) {
        const url = new URL(`${DB_API}/${table}`);
        Object.entries({ select: '*', limit: '10000', ...query }).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });

        const response = await fetch(url, { headers: DB_HEADERS });
        if (!response.ok) {
            const detail = await response.text();
            throw new Error(`${table}: HTTP ${response.status} — ${detail}`);
        }
        return response.json();
    }
    async function loadDatabase(force = false) {
        if (state.loading) return;
        if (state.loaded && !force) {
            renderModule();
            return;
        }

        state.loading = true;
        renderLoading();

        try {
            const [estudiantes, entrevistas, simulacros] = await Promise.all([
                fetchTable('estudiantes', { order: 'fecha_registro.desc' }),
                fetchTable('entrevistas_diagnosticas', { order: 'fecha_entrevista.desc' }),
                fetchTable('simulacros', { order: 'fecha_registro.desc' })
            ]);

            state.estudiantes = estudiantes;
            state.entrevistas = entrevistas;
            state.simulacros = simulacros;
            state.loaded = true;
            renderModule();
        } catch (error) {
            console.error('Error en módulo Base de datos:', error);
            const body = document.getElementById('db-module-content');
            if (body) {
                body.innerHTML = `
                    <div class="db-error">
                        <strong>No se pudo consultar la información.</strong>
                        <p>${esc(error.message)}</p>
                        <button class="db-btn db-btn-primary" id="db-retry">Reintentar</button>
                        <small>Verifica la conexión, las políticas RLS y los permisos de lectura en Supabase.</small>
                    </div>`;
                document.getElementById('db-retry')?.addEventListener('click', () => loadDatabase(true));
            }
        } finally {
            state.loading = false;
        }
    }

    function ensureModule() {
        if (document.getElementById('db-module-overlay')) return;

        const style = document.createElement('style');
        style.id = 'db-module-styles';
        style.textContent = `
            #db-module-overlay{position:fixed;inset:0;z-index:99990;background:#f4f6fb;color:#172033;display:none;overflow:auto;font-family:inherit}
            #db-module-overlay.db-open{display:block}
            .db-shell{max-width:1500px;margin:auto;padding:26px}
            .db-top{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:24px}
            .db-title h1{font-size:clamp(24px,3vw,34px);margin:0 0 5px;color:#172033}
            .db-title p{margin:0;color:#64748b;font-size:14px}
            .db-actions{display:flex;gap:9px;flex-wrap:wrap}
            .db-btn{border:1px solid #d9e0eb;background:#fff;color:#243047;border-radius:10px;padding:10px 14px;cursor:pointer;font-weight:600}
            .db-btn:hover{filter:brightness(.97)}
            .db-btn-primary{background:#2457d6;color:#fff;border-color:#2457d6}
            .db-btn-dark{background:#172033;color:#fff;border-color:#172033}
            .db-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;border-bottom:1px solid #dfe5ee;padding-bottom:12px}
            .db-tab{border:0;background:transparent;color:#64748b;padding:11px 15px;border-radius:9px;cursor:pointer;font-weight:700}
            .db-tab.active{background:#e7edff;color:#244fc0}
            .db-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;margin-bottom:20px}
            .db-card,.db-panel{background:#fff;border:1px solid #e5eaf2;border-radius:15px;padding:18px;box-shadow:0 4px 15px rgba(20,35,70,.035)}
            .db-card span{display:block;color:#64748b;font-size:13px;margin-bottom:9px}
            .db-card strong{font-size:29px;color:#172033}
            .db-panel{margin-bottom:18px}
            .db-panel h3{margin:0 0 15px;font-size:17px}
            .db-toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:15px}
            .db-toolbar input,.db-toolbar select{min-width:180px;flex:1;border:1px solid #d8e0eb;border-radius:9px;padding:11px;background:#fff;color:#172033}
            .db-table-wrap{overflow:auto;border:1px solid #e8edf4;border-radius:10px}
            .db-table{width:100%;border-collapse:collapse;min-width:760px;background:#fff}
            .db-table th,.db-table td{padding:12px 13px;text-align:left;border-bottom:1px solid #edf0f5;font-size:13px;vertical-align:top}
            .db-table th{background:#f7f9fc;color:#526078;font-weight:700;position:sticky;top:0}
            .db-table tr:last-child td{border-bottom:0}
            .db-table td small{color:#64748b}
            .db-link{border:0;background:none;color:#2457d6;font-weight:700;cursor:pointer;padding:0}
            .db-empty,.db-loading,.db-error{padding:35px;text-align:center;color:#64748b;background:#fff;border-radius:12px}
            .db-error{color:#a12b35;border:1px solid #f1c8cc}
            .db-error p{font-size:13px;overflow-wrap:anywhere}
            .db-charts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
            .db-chart{width:100%;height:250px;display:block}
            .db-bars{display:flex;flex-direction:column;gap:12px}
            .db-bar-row{display:grid;grid-template-columns:minmax(100px,1fr) 3fr 42px;align-items:center;gap:10px;font-size:13px}
            .db-bar-track{height:10px;background:#edf1f7;border-radius:20px;overflow:hidden}
            .db-bar-fill{height:100%;background:#3567df;border-radius:20px}
            .db-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
            .db-field{padding:12px;background:#f7f9fc;border-radius:9px;min-width:0}
            .db-field label{display:block;font-size:11px;color:#718096;margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em}
            .db-field div{font-size:13px;overflow-wrap:anywhere;white-space:pre-wrap}
            .db-badge{display:inline-block;padding:4px 8px;border-radius:30px;background:#e8efff;color:#3158b7;font-size:11px;font-weight:700}
            .db-floating-trigger{position:fixed;right:22px;bottom:22px;z-index:99980;border:0;border-radius:999px;background:#172033;color:#fff;padding:13px 18px;box-shadow:0 8px 25px #17203340;font-weight:700;cursor:pointer}
            .db-modal-backdrop{position:fixed;inset:0;background:#10182899;z-index:100000;display:flex;align-items:center;justify-content:center;padding:18px}
            .db-detail-modal{background:#fff;border-radius:16px;max-width:900px;width:100%;max-height:90vh;overflow:auto;padding:22px}
            .db-detail-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:18px}
            .db-detail-head h2{margin:0 0 5px}

            /* Expediente académico integral */
            .db-profile{max-width:1180px;padding:0;overflow:auto;max-height:94vh}
            .db-profile-hero{padding:28px;background:linear-gradient(125deg,#142d4e,#2457a6);color:#fff;border-radius:16px 16px 0 0}
            .db-profile-hero-top{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}
            .db-profile-kicker{font-size:10px;letter-spacing:.16em;font-weight:800;opacity:.72}
            .db-profile-hero h2{font-size:clamp(23px,3vw,34px);margin:8px 0 5px;color:#fff}
            .db-profile-hero p{margin:0;color:#dbeafe;font-size:13px}
            .db-profile-avatar{width:54px;height:54px;border-radius:16px;background:#ffffff20;display:grid;place-items:center;font-size:22px;font-weight:800;flex-shrink:0}
            .db-profile-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
            .db-profile-actions .db-btn{border-color:#ffffff55;background:#ffffff12;color:#fff}
            .db-profile-actions .db-btn:hover{background:#ffffff25}
            .db-profile-body{padding:22px;background:#f4f6fb}
            .db-profile-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px;margin-bottom:17px}
            .db-profile-metric{background:#fff;border:1px solid #e5eaf2;border-radius:13px;padding:15px}
            .db-profile-metric span{display:block;color:#718096;font-size:11px;margin-bottom:7px}
            .db-profile-metric strong{font-size:23px;color:#172033}
            .db-profile-section{background:#fff;border:1px solid #e5eaf2;border-radius:14px;padding:18px;margin-bottom:15px}
            .db-profile-section-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:14px}
            .db-profile-section-head h3{margin:0;font-size:16px;color:#172033}
            .db-profile-section-head small{color:#8290a5}
            .db-profile-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
            .db-profile-fields .db-field{background:#f7f9fc}
            .db-profile-fields .db-field.wide{grid-column:1/-1}
            .db-profile-chart{display:flex;align-items:flex-end;gap:12px;min-height:190px;padding:14px 8px 4px;border-bottom:1px solid #e8edf4;overflow-x:auto}
            .db-profile-chart-col{min-width:58px;flex:1;text-align:center;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:175px;gap:6px}
            .db-profile-chart-value{font-size:11px;font-weight:800;color:#334155}
            .db-profile-chart-bar{width:min(34px,70%);min-height:3px;border-radius:7px 7px 2px 2px;background:linear-gradient(180deg,#5b8df0,#2457d6)}
            .db-profile-chart-label{font-size:10px;color:#718096;white-space:nowrap}
            .db-profile-legend{display:flex;gap:14px;flex-wrap:wrap;color:#64748b;font-size:11px;margin-top:12px}
            .db-profile-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:#3567df}
            .db-profile-note{border-left:3px solid #3567df;background:#f5f8ff;padding:12px 14px;border-radius:0 9px 9px 0;margin:8px 0;color:#334155;font-size:13px;white-space:pre-wrap}
            .db-profile-empty{padding:20px;text-align:center;background:#f8fafc;border:1px dashed #d6deea;border-radius:10px;color:#718096;font-size:13px}
            .db-profile-status{display:inline-flex;align-items:center;gap:6px;border-radius:30px;padding:5px 9px;font-size:11px;font-weight:700;background:#e8f7ef;color:#18794e}
            .db-profile-status.pending{background:#fff4df;color:#946200}
            .db-profile-table{width:100%;border-collapse:collapse;min-width:650px}
            .db-profile-table th,.db-profile-table td{padding:10px;border-bottom:1px solid #edf0f5;text-align:left;font-size:12px;vertical-align:top}
            .db-profile-table th{color:#64748b;background:#f8fafc}
            .db-profile-footer{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:#8a96a8;font-size:10px;padding:0 3px 5px}
            @media(max-width:760px){.db-profile-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.db-profile-fields{grid-template-columns:repeat(2,minmax(0,1fr))}.db-profile-hero{padding:20px}.db-profile-body{padding:13px}}
            @media(max-width:480px){.db-profile-fields{grid-template-columns:1fr}.db-profile-fields .db-field.wide{grid-column:auto}.db-profile-metric strong{font-size:20px}.db-profile-section{padding:13px}}

            @media(max-width:900px){.db-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.db-charts{grid-template-columns:1fr}}
            @media(max-width:600px){.db-shell{padding:15px}.db-top{align-items:flex-start;flex-direction:column}.db-actions{width:100%}.db-actions .db-btn{flex:1}.db-grid{gap:9px}.db-card{padding:13px}.db-card strong{font-size:23px}.db-detail-grid{grid-template-columns:1fr}.db-floating-trigger{right:12px;bottom:12px}}
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('section');
        overlay.id = 'db-module-overlay';
        overlay.innerHTML = `
            <div class="db-shell">
                <header class="db-top">
                    <div class="db-title">
                        <h1>Base de datos</h1>
                        <p>Centro independiente de consulta, análisis y seguimiento académico</p>
                    </div>
                    <div class="db-actions">
                        <button class="db-btn" id="db-refresh">↻ Actualizar datos</button>
                        <button class="db-btn db-btn-dark" id="db-close">Cerrar módulo ✕</button>
                    </div>
                </header>
                <nav class="db-tabs" aria-label="Secciones de base de datos">
                    <button class="db-tab active" data-tab="resumen">Resumen</button>
                    <button class="db-tab" data-tab="estudiantes">Estudiantes</button>
                    <button class="db-tab" data-tab="entrevistas">Entrevistas</button>
                    <button class="db-tab" data-tab="simulacros">Simulacros</button>
                    <button class="db-tab" data-tab="valoraciones">Valoraciones</button>
                </nav>
                <main id="db-module-content"><div class="db-loading">Preparando módulo...</div></main>
            </div>`;
        document.body.appendChild(overlay);

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'db-floating-trigger';
        trigger.id = 'db-open';
        trigger.textContent = '▦ Base de datos';
        document.body.appendChild(trigger);

        trigger.addEventListener('click', openModule);
        document.getElementById('db-close').addEventListener('click', closeModule);
        document.getElementById('db-refresh').addEventListener('click', () => loadDatabase(true));
        overlay.querySelectorAll('.db-tab').forEach(button => {
            button.addEventListener('click', () => {
                state.tab = button.dataset.tab;
                renderModule();
            });
        });
    }

    function openModule() {
        ensureModule();
        document.getElementById('db-module-overlay').classList.add('db-open');
        document.body.style.overflow = 'hidden';
        loadDatabase();
    }


// Permite abrir el expediente sin mostrar el módulo Base de datos.
window.abrirExpedienteIntegral = async function(dni) {
    ensureModule();

    // Mantener cerrado el módulo principal de Base de datos.
    closeModule();

    // Si los datos aún no se han cargado, consultarlos en segundo plano.
    if (!state.loaded) {
        await loadDatabase();
    }

    // Mostrar únicamente el expediente del estudiante.
    showStudentDetail(String(dni));
};


    function closeModule() {
        document.getElementById('db-module-overlay')?.classList.remove('db-open');
        document.body.style.overflow = '';
    }

    function renderLoading() {
        const content = document.getElementById('db-module-content');
        if (content) content.innerHTML = '<div class="db-loading">Consultando estudiantes, entrevistas y simulacros en Supabase...</div>';
    }

    function metricCard(label, value, detail = '') {
        return `<article class="db-card"><span>${esc(label)}</span><strong>${esc(value)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</article>`;
    }

    function groupCounts(values) {
        const counts = {};
        values.forEach(value => {
            const key = String(value || '').trim() || 'No especificado';
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }

    function barChart(title, entries) {
        const max = Math.max(1, ...entries.map(item => item[1]));
        return `<section class="db-panel"><h3>${esc(title)}</h3><div class="db-bars">
            ${entries.length ? entries.slice(0, 8).map(([label, count]) => `
                <div class="db-bar-row"><span title="${esc(label)}">${esc(label.length > 25 ? label.slice(0, 25) + '…' : label)}</span>
                    <div class="db-bar-track"><div class="db-bar-fill" style="width:${(count / max) * 100}%"></div></div><strong>${count}</strong>
                </div>`).join('') : '<div class="db-empty">Sin información disponible</div>'}
        </div></section>`;
    }

    function renderSummary() {
        const students = state.estudiantes;
        const interviews = state.entrevistas;
        const exams = state.simulacros;
        const rated = interviews.filter(item =>
            [item.docente_fortalezas, item.docente_dificultades, item.acuerdo_habitos, item.acuerdo_meta]
                .some(value => String(value || '').trim())
        ).length;
        const avg = exams.length
            ? (exams.reduce((sum, item) => sum + (Number(item.puntaje_total) || 0), 0) / exams.length).toFixed(2)
            : '—';
        const completed = interviews.length;
        const pending = Math.max(0, students.length - completed);
        const carreras = groupCounts(students.map(item => item.carrera_interes));
        const fases = groupCounts(exams.map(item => item.fase));

        return `
            <div class="db-grid">
                ${metricCard('Estudiantes registrados', students.length)}
                ${metricCard('Entrevistas registradas', completed, `${pending} estudiantes sin entrevista registrada`)}
                ${metricCard('Simulacros registrados', exams.length)}
                ${metricCard('Promedio general de puntaje', avg)}
            </div>
            <div class="db-grid">
                ${metricCard('Valoraciones docentes', rated)}
                ${metricCard('Entrevistas sin valoración', Math.max(0, completed - rated))}
                ${metricCard('Carreras identificadas', carreras.filter(([name]) => name !== 'No especificado').length)}
                ${metricCard('Fases registradas', fases.length)}
            </div>
            <div class="db-charts">
                ${barChart('Estudiantes por carrera de interés', carreras)}
                ${barChart('Simulacros por fase', fases)}
                ${barChart('Cursos de mayor dificultad declarados', groupCounts(interviews.flatMap(item => String(item.cursos_dificultad || '').split(/[,;\n]+/))))}
                ${barChart('Primera opción de carrera', groupCounts(interviews.map(item => item.carrera_primera_opcion)))}
            </div>
            <p style="color:#64748b;font-size:12px;margin:8px 2px">Los indicadores se calculan sobre los registros disponibles. “Sin entrevista” significa que no existe una fila asociada en entrevistas_diagnosticas. Los campos vacíos no se interpretan como respuestas negativas.</p>`;
    }

    function filteredStudents() {
        return state.estudiantes.filter(item => {
            const haystack = `${item.dni} ${fullName(item)} ${item.correo || ''} ${item.carrera_interes || ''}`.toLowerCase();
            return (!state.search || haystack.includes(state.search.toLowerCase())) &&
                (!state.carrera || item.carrera_interes === state.carrera);
        });
    }

    function tableMarkup(headers, rows) {
        if (!rows.length) return '<div class="db-empty">No se encontraron registros con los filtros seleccionados.</div>';
        return `<div class="db-table-wrap"><table class="db-table"><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
    }

    function renderStudents() {
        const careers = [...new Set(state.estudiantes.map(item => item.carrera_interes).filter(Boolean))].sort();
        const rows = filteredStudents().map(item => `
            <tr>
                <td><strong>${esc(item.dni)}</strong></td>
                <td>${esc(fullName(item))}</td>
                <td>${esc(item.correo || '—')}</td>
                <td>${esc(item.whatsapp || '—')}</td>
                <td>${esc(item.carrera_interes || '—')}</td>
                <td>${esc(fmtDate(item.fecha_registro))}</td>
                <td><button class="db-link" data-student="${esc(item.dni)}">Ver ficha</button></td>
            </tr>`);
        return `
            <section class="db-panel">
                <h3>Registro completo de estudiantes</h3>
                <div class="db-toolbar">
                    <input id="db-search" type="search" placeholder="Buscar por DNI, nombre, correo o carrera..." value="${esc(state.search)}">
                    <select id="db-career"><option value="">Todas las carreras</option>${careers.map(c => `<option value="${esc(c)}" ${state.carrera === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
                    <button class="db-btn db-btn-primary" id="db-export-students">Exportar CSV</button>
                </div>
                ${tableMarkup(['DNI','Estudiante','Correo','WhatsApp','Carrera','Registro','Detalle'], rows)}
                <p style="color:#64748b;font-size:12px">Mostrando ${rows.length} de ${state.estudiantes.length} estudiantes.</p>
            </section>`;
    }

    function renderInterviews() {
        const interviewMap = new Map(state.entrevistas.map(item => [item.dni_estudiante, item]));
        const rows = state.estudiantes.map(student => {
            const interview = interviewMap.get(student.dni);
            const status = interview ? 'Registrada' : 'Pendiente';
            return `<tr><td>${esc(student.dni)}</td><td>${esc(fullName(student))}</td>
                <td><span class="db-badge">${status}</span></td>
                <td>${esc(interview?.carrera_primera_opcion || '—')}</td>
                <td>${esc(interview?.horas_estudio ?? '—')}</td>
                <td>${esc(fmtDate(interview?.fecha_entrevista))}</td>
                <td>${interview ? `<button class="db-link" data-interview="${esc(student.dni)}">Ver respuestas</button>` : '—'}</td></tr>`;
        });
        return `<section class="db-panel"><h3>Entrevistas diagnósticas</h3>
            <div class="db-toolbar"><input id="db-search" type="search" placeholder="Buscar por DNI o nombre..." value="${esc(state.search)}">
            <button class="db-btn db-btn-primary" id="db-export-interviews">Exportar CSV</button></div>
            ${tableMarkup(['DNI','Estudiante','Estado','Primera carrera','Horas de estudio','Fecha','Detalle'], rows.filter(row => !state.search || row.toLowerCase().includes(state.search.toLowerCase())))}
        </section>`;
    }

function renderExams() {
    const phases = [...new Set(state.simulacros.map(item => item.fase).filter(Boolean))].sort();
    const exams = state.simulacros.filter(item => !state.fase || item.fase === state.fase);
    const rows = exams.map(item => {
        const student = state.estudiantes.find(s => s.dni === item.dni_estudiante);
        return `<tr><td>${esc(item.dni_estudiante)}</td><td>${esc(student ? fullName(student) : 'Estudiante no encontrado')}</td>
            <td>${esc(item.fase)}</td><td>${esc(item.numero_simulacro)}</td>
            <td><strong>${esc(item.puntaje_total ?? '—')}</strong></td>
            <td>${esc(item.puntaje_matematica ?? '—')}</td><td>${esc(item.puntaje_letras ?? '—')}</td>
            <td>${esc(fmtDate(item.fecha_registro))}</td>
            <td>${esc([item.accion_mejora_1,item.accion_mejora_2,item.accion_mejora_3].filter(Boolean).join(' | ') || '—')}</td></tr>`;
    });
    return `<section class="db-panel"><h3>Historial de simulacros</h3>
        <div class="db-toolbar"><select id="db-phase"><option value="">Todas las fases</option>${phases.map(p => `<option value="${esc(p)}" ${state.fase === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
        <button class="db-btn db-btn-primary" id="db-export-exams">Exportar CSV</button></div>
        ${tableMarkup(['DNI','Estudiante','Fase','N.º','Total','Matemática','Letras','Fecha','Acciones de mejora'], rows)}
    </section>`;
}

function renderRatings() {
    const rated = state.entrevistas.filter(item =>
        [item.docente_fortalezas,item.docente_dificultades,item.acuerdo_habitos,item.acuerdo_meta]
            .some(value => String(value || '').trim())
    );
    const rows = rated.map(item => {
        const student = state.estudiantes.find(s => s.dni === item.dni_estudiante);
        return `<tr><td>${esc(item.dni_estudiante)}</td><td>${esc(student ? fullName(student) : '—')}</td>
            <td>${esc(item.docente_fortalezas || '—')}</td><td>${esc(item.docente_dificultades || '—')}</td>
            <td>${esc(item.acuerdo_habitos || '—')}</td><td>${esc(item.acuerdo_meta || '—')}</td></tr>`;
    });
    const pending = state.entrevistas.filter(item => !rated.includes(item)).length;
    return `<section class="db-panel"><h3>Valoraciones y acuerdos docentes</h3>
        <p style="color:#64748b;font-size:13px">${rated.length} entrevistas con al menos un campo de valoración completado · ${pending} entrevistas sin valoración registrada.</p>
        <div class="db-toolbar"><input id="db-search" type="search" placeholder="Buscar en valoraciones..." value="${esc(state.search)}">
        <button class="db-btn db-btn-primary" id="db-export-ratings">Exportar CSV</button></div>
        ${tableMarkup(['DNI','Estudiante','Fortalezas','Dificultades','Acuerdo de hábitos','Acuerdo de meta'], rows.filter(row => !state.search || row.toLowerCase().includes(state.search.toLowerCase())))}
    </section>`;
}

function renderModule() {
    const content = document.getElementById('db-module-content');
    if (!content) return;
    document.querySelectorAll('.db-tab').forEach(button => {
        button.classList.toggle('active', button.dataset.tab === state.tab);
    });

    const views = {
        resumen: renderSummary,
        estudiantes: renderStudents,
        entrevistas: renderInterviews,
        simulacros: renderExams,
        valoraciones: renderRatings
    };
    content.innerHTML = (views[state.tab] || renderSummary)();
    bindViewEvents();
}

function bindViewEvents() {
    document.getElementById('db-search')?.addEventListener('input', event => {
        state.search = event.target.value;
        const cursor = event.target.selectionStart;
        renderModule();
        const input = document.getElementById('db-search');
        input?.focus();
        input?.setSelectionRange(cursor, cursor);
    });
    document.getElementById('db-career')?.addEventListener('change', event => {
        state.carrera = event.target.value;
        renderModule();
    });
    document.getElementById('db-phase')?.addEventListener('change', event => {
        state.fase = event.target.value;
        renderModule();
    });

    document.getElementById('db-export-students')?.addEventListener('click', () =>
        exportCSV('estudiantes.csv', state.estudiantes, [
            'dni','nombres','apellidos','correo','whatsapp','fecha_nacimiento','domicilio',
            'carrera_interes','nombre_tutor','apellido_tutor','dni_tutor','telefono_tutor','fecha_registro'
        ]));
    document.getElementById('db-export-interviews')?.addEventListener('click', () =>
        exportCSV('entrevistas_diagnosticas.csv', state.entrevistas, Object.keys(state.entrevistas[0] || {})));
    document.getElementById('db-export-exams')?.addEventListener('click', () =>
        exportCSV('simulacros.csv', state.simulacros, Object.keys(state.simulacros[0] || {})));
    document.getElementById('db-export-ratings')?.addEventListener('click', () => {
        const data = state.entrevistas.map(item => ({
            dni_estudiante: item.dni_estudiante,
            docente_fortalezas: item.docente_fortalezas,
            docente_dificultades: item.docente_dificultades,
            acuerdo_habitos: item.acuerdo_habitos,
            acuerdo_meta: item.acuerdo_meta,
            fecha_entrevista: item.fecha_entrevista
        }));
        exportCSV('valoraciones_docentes.csv', data, Object.keys(data[0] || {}));
    });

    document.querySelectorAll('[data-student]').forEach(button =>
        button.addEventListener('click', () => showStudentDetail(button.dataset.student)));
    document.querySelectorAll('[data-interview]').forEach(button =>
        button.addEventListener('click', () => showInterviewDetail(button.dataset.interview)));
}

function exportCSV(filename, records, columns) {
    if (!records.length || !columns.length) {
        alert('No hay registros para exportar.');
        return;
    }
    const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = '\uFEFF' + [
        columns.map(quote).join(';'),
        ...records.map(record => columns.map(column => quote(record[column])).join(';'))
    ].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function field(label, value) {
    return `<div class="db-field"><label>${esc(label)}</label><div>${esc(value || 'No especificado')}</div></div>`;
}

function showDetail(title, subtitle, fields) {
    document.getElementById('db-detail-backdrop')?.remove();
    const modal = document.createElement('div');
    modal.id = 'db-detail-backdrop';
    modal.className = 'db-modal-backdrop';
    modal.innerHTML = `<section class="db-detail-modal">
        <div class="db-detail-head"><div><h2>${esc(title)}</h2><small>${esc(subtitle)}</small></div>
        <button class="db-btn" id="db-detail-close">Cerrar ✕</button></div>
        <div class="db-detail-grid">${fields.join('')}</div>
    </section>`;
    document.body.appendChild(modal);
    modal.querySelector('#db-detail-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', event => { if (event.target === modal) modal.remove(); });
}

function showStudentDetail(dni) {
    const student = state.estudiantes.find(item => String(item.dni) === String(dni));
    if (!student) return;

    const interviews = state.entrevistas
        .filter(item => String(item.dni_estudiante) === String(dni))
        .sort((a, b) => new Date(b.fecha_entrevista || 0) - new Date(a.fecha_entrevista || 0));
    const interview = interviews[0] || null;
    const exams = state.simulacros
        .filter(item => String(item.dni_estudiante) === String(dni))
        .sort((a, b) => {
            const dateDiff = new Date(a.fecha_registro || 0) - new Date(b.fecha_registro || 0);
            return dateDiff || (Number(a.numero_simulacro) || 0) - (Number(b.numero_simulacro) || 0);
        });
    const ratings = interview ? [
        ['Fortalezas identificadas', interview.docente_fortalezas],
        ['Dificultades / necesidades', interview.docente_dificultades],
        ['Acuerdo: hábitos de estudio', interview.acuerdo_habitos],
        ['Acuerdo: meta personal', interview.acuerdo_meta]
    ] : [];
    const hasRating = ratings.some(([, value]) => String(value || '').trim());
    const average = exams.length
        ? (exams.reduce((sum, item) => sum + (Number(item.puntaje_total) || 0), 0) / exams.length).toFixed(2)
        : '—';
    const latest = exams.length ? Number(exams[exams.length - 1].puntaje_total) || 0 : null;
    const first = exams.length ? Number(exams[0].puntaje_total) || 0 : null;
    const progress = exams.length > 1 ? latest - first : null;
    const initials = `${student.nombres || ''} ${student.apellidos || ''}`.trim().split(/\s+/).slice(0, 2).map(word => word[0] || '').join('').toUpperCase() || 'ES';

    const interviewLabels = {
        experiencia_secundaria: 'Experiencia en secundaria',
        cursos_fortaleza: 'Cursos de fortaleza',
        cursos_dificultad: 'Cursos de dificultad',
        horas_estudio: 'Horas de estudio al día',
        tiene_horario: '¿Tiene horario de estudio?',
        tecnicas_estudio: 'Técnicas de estudio',
        interrupciones_estudio: 'Interrupciones durante el estudio',
        organizacion_tiempo: 'Organización del tiempo',
        motivo_san_marcos: 'Motivo para elegir San Marcos',
        carrera_primera_opcion: 'Primera opción de carrera',
        carrera_segunda_opcion: 'Segunda opción de carrera',
        reaccion_baja_nota: 'Reacción ante una nota baja',
        manejo_ansiedad: 'Manejo de ansiedad',
        compromiso_programa: 'Compromiso con el programa'
    };
    const interviewFields = interview ? Object.entries(interviewLabels)
        .filter(([key]) => interview[key] !== null && interview[key] !== undefined && String(interview[key]).trim() !== '')
        .map(([key, label]) => field(label, key === 'tiene_horario' ? (interview[key] === true ? 'Sí' : interview[key] === false ? 'No' : interview[key]) : interview[key]))
        : [];


        const chart = exams.length ? `
            <div class="db-profile-chart" role="img" aria-label="Evolución de puntajes totales por simulacro">
                ${exams.map((exam, index) => {
                    const value = Number(exam.puntaje_total) || 0;
                    const max = Math.max(1, ...exams.map(row => Number(row.puntaje_total) || 0));
                    const height = Math.max(3, value / max * 135);
                    return `<div class="db-profile-chart-col"><span class="db-profile-chart-value">${esc(value.toFixed(2))}</span><div class="db-profile-chart-bar" style="height:${height}px" title="${esc(exam.fase || '')} · Simulacro ${esc(exam.numero_simulacro)}"></div><span class="db-profile-chart-label">S${esc(exam.numero_simulacro || index + 1)}</span></div>`;
                }).join('')}
            </div><div class="db-profile-legend"><span><i class="db-profile-dot"></i>Puntaje total por evaluación</span><span>Orden cronológico según fecha de registro / número</span></div>`
            : '<div class="db-profile-empty">Todavía no hay simulacros registrados. Cuando agregues evaluaciones, aquí aparecerá su evolución.</div>';

        const examRows = exams.slice().reverse().map(exam => `
            <tr><td>${esc(exam.fase || '—')}</td><td>${esc(exam.numero_simulacro || '—')}</td>
            <td><strong>${esc(exam.puntaje_total ?? '—')}</strong></td><td>${esc(exam.puntaje_matematica ?? '—')}</td>
            <td>${esc(exam.puntaje_letras ?? '—')}</td><td>${esc(fmtDate(exam.fecha_registro))}</td>
            <td>${esc([exam.accion_mejora_1,exam.accion_mejora_2,exam.accion_mejora_3].filter(Boolean).join(' · ') || 'Sin indicaciones')}</td></tr>`).join('');

        document.getElementById('db-detail-backdrop')?.remove();
        const modal = document.createElement('div');
        modal.id = 'db-detail-backdrop';
        modal.className = 'db-modal-backdrop';
        modal.innerHTML = `
            <section class="db-detail-modal db-profile" role="dialog" aria-modal="true" aria-label="Expediente académico integral">
                <header class="db-profile-hero">
                    <div class="db-profile-hero-top">
                        <div><span class="db-profile-kicker">CÍRCULO DE ALTO RENDIMIENTO CHILCA · EXPEDIENTE 2027</span>
                            <h2>${esc(fullName(student))}</h2>
                            <p>DNI ${esc(student.dni)} &nbsp;·&nbsp; ${esc(student.carrera_interes || 'Carrera por definir')}</p></div>
                        <div class="db-profile-avatar">${esc(initials)}</div>
                    </div>
                    <div class="db-profile-actions">
                        <button class="db-btn" id="db-profile-interview">Abrir entrevista</button>
                        <button class="db-btn" id="db-profile-grades">Gestionar simulacros</button>
                        <button class="db-btn" id="db-profile-close">Cerrar expediente ✕</button>
                    </div>
                </header>
                <div class="db-profile-body">
                    <div class="db-profile-metrics">
                        <article class="db-profile-metric"><span>SIMULACROS REGISTRADOS</span><strong>${exams.length}</strong></article>
                        <article class="db-profile-metric"><span>PROMEDIO ACUMULADO</span><strong>${esc(average)}</strong></article>
                        <article class="db-profile-metric"><span>ÚLTIMO PUNTAJE</span><strong>${latest === null ? '—' : esc(latest.toFixed(2))}</strong></article>
                        <article class="db-profile-metric"><span>VARIACIÓN INICIAL → ÚLTIMO</span><strong style="color:${progress === null ? '#172033' : progress >= 0 ? '#16845b' : '#c04b55'}">${progress === null ? '—' : `${progress > 0 ? '+' : ''}${progress.toFixed(2)}`}</strong></article>
                    </div>

                    <section class="db-profile-section">
                        <div class="db-profile-section-head"><h3>01 · Información personal</h3><span class="db-badge">Registro del estudiante</span></div>
                        <div class="db-profile-fields">
                            ${field('DNI', student.dni)}${field('Nombres', student.nombres)}${field('Apellidos', student.apellidos)}
                            ${field('Correo electrónico', student.correo)}${field('WhatsApp', student.whatsapp)}${field('Fecha de nacimiento', fmtDate(student.fecha_nacimiento))}
                            ${field('Domicilio', student.domicilio)}${field('Carrera de interés', student.carrera_interes)}${field('Fecha de inscripción', fmtDate(student.fecha_registro))}
                            ${field('Nombre del tutor', `${student.nombre_tutor || ''} ${student.apellido_tutor || ''}`.trim())}${field('DNI del tutor', student.dni_tutor)}${field('Teléfono del tutor', student.telefono_tutor)}
                        </div>
                    </section>

                    <section class="db-profile-section">
                        <div class="db-profile-section-head"><h3>02 · Entrevista diagnóstica</h3><span class="db-profile-status ${interview ? '' : 'pending'}">${interview ? '● Entrevista registrada' : '● Pendiente'}</span></div>
                        ${interview ? `<p style="font-size:12px;color:#718096;margin:-5px 0 13px">Último registro: ${esc(fmtDate(interview.fecha_entrevista))} · ${interviews.length} registro(s) encontrado(s)</p><div class="db-profile-fields">${interviewFields.join('')}</div>` : '<div class="db-profile-empty">Este estudiante aún no cuenta con una entrevista diagnóstica registrada.</div>'}
                    </section>

                    <section class="db-profile-section">
                        <div class="db-profile-section-head"><h3>03 · Valoración docente y acuerdos</h3><span class="db-profile-status ${hasRating ? '' : 'pending'}">${hasRating ? '● Valoración registrada' : '● Sin valoración'}</span></div>
                        ${hasRating ? ratings.map(([label, value]) => `<div class="db-profile-note"><strong>${esc(label)}</strong><br>${esc(value || 'No registrado')}</div>`).join('') : '<div class="db-profile-empty">La valoración docente todavía no ha sido completada para la entrevista más reciente.</div>'}
                    </section>

                    <section class="db-profile-section">
                        <div class="db-profile-section-head"><h3>04 · Evolución del rendimiento</h3><small>${exams.length} evaluación(es)</small></div>
                        ${chart}
                    </section>

                    <section class="db-profile-section">
                        <div class="db-profile-section-head"><h3>05 · Historial de simulacros</h3><small>Del más reciente al más antiguo</small></div>
                        ${exams.length ? `<div class="db-table-wrap"><table class="db-profile-table"><thead><tr><th>Fase</th><th>N.º</th><th>Total</th><th>Matemática</th><th>Letras/RM</th><th>Fecha</th><th>Acciones de mejora</th></tr></thead><tbody>${examRows}</tbody></table></div>` : '<div class="db-profile-empty">No existen resultados para mostrar.</div>'}
                    </section>
                    <div class="db-profile-footer"><span>Expediente generado con los registros disponibles en Supabase.</span><span>Los datos no registrados se muestran como pendientes, no como resultados negativos.</span></div>
                </div>
            </section>`;
        document.body.appendChild(modal);
        const close = () => modal.remove();
        modal.querySelector('#db-profile-close').addEventListener('click', close);
        modal.addEventListener('click', event => { if (event.target === modal) close(); });
        modal.querySelector('#db-profile-interview').addEventListener('click', () => {
            close();
            if (typeof window.abrirEntrevista === 'function') window.abrirEntrevista(student.dni, fullName(student));
        });
        modal.querySelector('#db-profile-grades').addEventListener('click', () => {
            close();
            if (typeof window.verPerfil === 'function') window.verPerfil(student.dni, fullName(student));
        });
    }

    function showInterviewDetail(dni) {
        const item = state.entrevistas.find(interview => interview.dni_estudiante === dni);
        const student = state.estudiantes.find(s => s.dni === dni);
        if (!item) return;
        const labels = {
            experiencia_secundaria: 'Experiencia en secundaria',
            cursos_fortaleza: 'Cursos de fortaleza',
            cursos_dificultad: 'Cursos de dificultad',
            horas_estudio: 'Horas de estudio',
            tiene_horario: 'Tiene horario de estudio',
            tecnicas_estudio: 'Técnicas de estudio',
            interrupciones_estudio: 'Interrupciones durante el estudio',
            organizacion_tiempo: 'Organización del tiempo',
            motivo_san_marcos: 'Motivo para elegir San Marcos',
            carrera_primera_opcion: 'Primera opción de carrera',
            carrera_segunda_opcion: 'Segunda opción de carrera',
            reaccion_baja_nota: 'Reacción ante una nota baja',
            manejo_ansiedad: 'Manejo de ansiedad',
            compromiso_programa: 'Compromiso con el programa',
            docente_fortalezas: 'Fortalezas identificadas por el docente',
            docente_dificultades: 'Dificultades identificadas por el docente',
            acuerdo_habitos: 'Acuerdo sobre hábitos',
            acuerdo_meta: 'Acuerdo sobre metas',
            fecha_entrevista: 'Fecha de entrevista'
        };
        const fields = Object.entries(labels).map(([key, label]) =>
            field(label, key === 'fecha_entrevista' ? fmtDate(item[key]) :
                key === 'tiene_horario' ? (item[key] === true ? 'Sí' : item[key] === false ? 'No' : 'No especificado') : item[key]));
        showDetail(student ? fullName(student) : `Estudiante ${dni}`, `Entrevista diagnóstica · DNI ${dni}`, fields);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureModule, { once: true });
    } else {
        ensureModule();
    }
})();
