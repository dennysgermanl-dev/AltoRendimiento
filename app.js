
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

            // Agregar botones a la celda
            tdAcciones.appendChild(btnNotas);
            tdAcciones.appendChild(btnEntrevista);

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

        // Mostrar respuestas del estudiante
        const escapar = valor => String(valor ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        panelAlumno.innerHTML = `
            <div class="respuesta-item">
                <strong>Horas de estudio al día:</strong>
                <span>${escapar(entrevista.horas_estudio || 'No especificado')}</span>
            </div>

            <div class="respuesta-item">
                <strong>Carrera 1ra Opción:</strong>
                <span>${escapar(entrevista.carrera_primera_opcion || 'No especificado')}</span>
            </div>

            <div class="respuesta-item">
                <strong>¿Qué le interrumpe?</strong>
                <span>${escapar(entrevista.interrupciones_estudio || 'No especificado')}</span>
            </div>

            <div class="respuesta-item">
                <strong>Manejo de Ansiedad:</strong>
                <span>${escapar(entrevista.manejo_ansiedad || 'No especificado')}</span>
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
