
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

// ==========================================
// GESTIÓN DE LA ENTREVISTA DIAGNÓSTICA
// ==========================================

let dniEntrevistaActual = '';

async function abrirEntrevista(dniAlumno, nombreAlumno) {
    dniEntrevistaActual = dniAlumno;
    document.getElementById('entrevista-nombre-alumno').textContent = nombreAlumno;
    
    const panelAlumno = document.getElementById('entrevista-respuestas-alumno');
    panelAlumno.innerHTML = '<p style="text-align:center; margin-top: 50px;">Consultando base de datos...</p>';
    
    // Limpiar formulario docente
    document.getElementById('form-valoracion').reset();
    document.getElementById('btn-guardar-valoracion').disabled = true;

    // Mostrar Modal
    const modal = document.getElementById('modal-entrevista');
    modal.classList.remove('modal-oculto');
    modal.classList.add('modal-visible');

    try {
        const url = `https://pfmkygwbnbrdhykhrnao.supabase.co/rest/v1/entrevistas_diagnosticas?dni_estudiante=eq.${dniAlumno}&select=*`;
        
        const respuesta = await fetch(url, {
            method: 'GET',
            headers: { 'apikey': supabaseKey, 'Authorization': 'Bearer ' + supabaseKey }
        });

        const datos = await respuesta.json();

        if (datos.length === 0) {
            panelAlumno.innerHTML = `
                <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; text-align: center;">
                    <strong>Pendiente</strong><br>
                    El alumno aún no ha completado el formulario de diagnóstico en Google Forms.
                </div>`;
            return;
        }

        const entrevista = datos[0]; // Tomamos el primer registro

        // Renderizar respuestas del alumno (resumen de ejemplo)
        panelAlumno.innerHTML = `
            <div style="margin-bottom: 15px;">
                <strong>Horas de estudio al día:</strong> ${entrevista.horas_estudio || 'No especificado'}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Carrera 1ra Opción:</strong> ${entrevista.carrera_primera_opcion || 'No especificado'}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>¿Qué le interrumpe?:</strong> ${entrevista.interrupciones_estudio || 'No especificado'}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Manejo de Ansiedad:</strong> ${entrevista.manejo_ansiedad || 'No especificado'}
            </div>
        `;

        // Llenar formulario docente si ya lo había evaluado antes
        document.getElementById('val-fortalezas').value = entrevista.docente_fortalezas || '';
        document.getElementById('val-dificultades').value = entrevista.docente_dificultades || '';
        document.getElementById('val-acuerdo-habitos').value = entrevista.acuerdo_habitos || '';
        document.getElementById('val-acuerdo-meta').value = entrevista.acuerdo_meta || '';

        // Habilitar botón de guardado solo si el alumno ya respondió
        document.getElementById('btn-guardar-valoracion').disabled = false;

    } catch (error) {
        console.error(error);
        panelAlumno.innerHTML = '<p style="color:red; text-align:center;">Error al cargar datos.</p>';
    }
}

async function guardarValoracion(evento) {
    evento.preventDefault();
    const boton = document.getElementById('btn-guardar-valoracion');
    boton.textContent = 'Guardando...';
    
    const payload = {
        docente_fortalezas: document.getElementById('val-fortalezas').value,
        docente_dificultades: document.getElementById('val-dificultades').value,
        acuerdo_habitos: document.getElementById('val-acuerdo-habitos').value,
        acuerdo_meta: document.getElementById('val-acuerdo-meta').value
    };

    try {
        // Usamos PATCH para actualizar la fila existente del alumno
        const respuesta = await fetch(`https://pfmkygwbnbrdhykhrnao.supabase.co/rest/v1/entrevistas_diagnosticas?dni_estudiante=eq.${dniEntrevistaActual}`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': 'Bearer ' + supabaseKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });

        if (!respuesta.ok) throw new Error('Error al actualizar');
        alert('Valoración guardada correctamente');
        
    } catch (error) {
        console.error(error);
        alert('Error al guardar la valoración.');
    } finally {
        boton.textContent = 'Guardar Evaluación';
    }
}

function cerrarModalEntrevista() {
    const modal = document.getElementById('modal-entrevista');
    modal.classList.remove('modal-visible');
    modal.classList.add('modal-oculto');
}

// Añade la regla de cierre al window.onclick existente
const oldWindowClick = window.onclick;
window.onclick = function(event) {
    if (oldWindowClick) oldWindowClick(event); // Mantener clics anteriores
    const modalEntrevista = document.getElementById('modal-entrevista');
    // Para la entrevista, no queremos que se cierre accidentalmente si el docente está escribiendo
    // Así que NO agregamos el event.target === modalEntrevista para cerrarlo, forzamos a usar la X.
}