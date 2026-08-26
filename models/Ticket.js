<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mesa de Ayuda - ManagerTI</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Paleta Corporativa Oficial Pantone -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              blue: '#00537E',        /* Pantone 7691C (Header) */
              blueHover: '#003E5F',   /* Hover de Botones */
              grayDark: '#63666A',    /* Pantone Cool Gray 10 C */
              silver: '#D1D5DB',      /* Línea Plateada / Separador */
              bgLight: '#F8FAFC',     /* Fondo Claro de la Página */
              cardLight: '#FFFFFF'    /* Tarjetas / Modal Blanco */
            }
          }
        }
      }
    }
  </script>

  <!-- Editor Quill -->
  <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
  <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>

  <!-- Compresión de Imagen y ZIP -->
  <script src="https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>

  <style>
    .ql-toolbar.ql-snow {
      background-color: #F1F5F9;
      border-color: #CBD5E1 !important;
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
    }
    .ql-container.ql-snow {
      border-color: #CBD5E1 !important;
      background-color: #FFFFFF;
      color: #1E293B;
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
      min-height: 120px;
    }
  </style>
</head>
<body class="bg-brand-bgLight text-slate-800 min-h-screen flex flex-col">

  <!-- HEADER PRINCIPAL: Con Logo Unificado al Dashboard -->
  <header class="bg-brand-blue text-white py-4 px-8 shadow-md">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      
      <!-- LOGO Y TÍTULO UNIFICADO -->
      <div class="flex items-center gap-4">
        <div class="bg-white/10 p-2.5 rounded-xl border border-white/20 backdrop-blur-sm">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">ManagerTI</h1>
          <p class="text-blue-200 text-xs">Mesa de Ayuda & Soporte Técnico</p>
        </div>
      </div>

      <!-- BOTONES DE ACCIÓN -->
      <div class="flex items-center gap-3">
        <button onclick="abrirModalCrear()" class="px-5 py-2.5 bg-white text-brand-blue font-semibold text-sm rounded-xl shadow hover:bg-blue-50 transition flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Nuevo Ticket
        </button>
        <a href="/dashboard.html" class="px-4 py-2.5 bg-brand-blueHover hover:bg-slate-900 text-white text-sm rounded-xl border border-blue-400/30 transition flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
          Dashboard
        </a>
      </div>
    </div>
  </header>

  <!-- LÍNEA SEPARADORA PLATEADA -->
  <div class="w-full h-1 bg-gradient-to-r from-gray-300 via-slate-400 to-gray-300 shadow-sm"></div>

  <!-- PANEL PRINCIPAL -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
    <div class="bg-brand-cardLight border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-100 text-brand-grayDark uppercase text-xs font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">ID Ticket</th>
              <th class="px-6 py-4">Usuario</th>
              <th class="px-6 py-4">Asunto</th>
              <th class="px-6 py-4">Estado</th>
              <th class="px-6 py-4">Prioridad</th>
              <th class="px-6 py-4">Fecha y Hora</th>
              <th class="px-6 py-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody id="tabla-tickets-body" class="divide-y divide-slate-200 text-sm text-slate-700">
            <tr>
              <td colspan="7" class="px-6 py-8 text-center text-slate-400">Cargando registros...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- MODAL 1: CREAR TICKET -->
  <div id="modalTicket" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 z-50">
    <div class="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
      <div class="px-6 py-4 bg-brand-blue text-white flex justify-between items-center">
        <h3 class="text-lg font-bold">Ingresar Nuevo Ticket</h3>
        <button onclick="cerrarModalCrear()" class="text-blue-200 hover:text-white text-xl">&times;</button>
      </div>

      <form id="formNuevoTicket" onsubmit="guardarTicket(event)" class="p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-brand-grayDark uppercase tracking-wider mb-1">Usuario / Solicitante</label>
            <input type="text" id="ticketUsuario" required placeholder="Ej. Ana Martinez" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-brand-blue transition text-sm">
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-grayDark uppercase tracking-wider mb-1">Asunto</label>
            <input type="text" id="ticketAsunto" required placeholder="Ej. Falla en impresora" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-brand-blue transition text-sm">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-brand-grayDark uppercase tracking-wider mb-1">Estado</label>
            <select id="ticketEstado" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-brand-blue transition text-sm">
              <option value="Abierto">Abierto</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-grayDark uppercase tracking-wider mb-1">Prioridad</label>
            <select id="ticketPrioridad" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-brand-blue transition text-sm">
              <option value="Baja">Baja</option>
              <option value="Media" selected>Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fecha y Hora</label>
            <input type="text" id="ticketFecha" readonly class="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 text-sm cursor-not-allowed">
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-brand-grayDark uppercase tracking-wider mb-1">Descripción del Incidente</label>
          <div id="editorDescripcion"></div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-brand-grayDark uppercase tracking-wider mb-1">Adjuntar Archivos (Zipeado Automático)</label>
          <input type="file" id="ticketAdjuntos" multiple class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-600 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-blue file:text-white hover:file:bg-brand-blueHover file:cursor-pointer transition">
          <p id="estadoCompresion" class="text-xs text-brand-blue mt-1 hidden font-medium">⚡ Procesando archivos y creando ZIP...</p>
        </div>

        <div class="pt-4 flex justify-end gap-3 border-t border-slate-200">
          <button type="button" onclick="cerrarModalCrear()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-xl transition">Cancelar</button>
          <button type="submit" id="btnGuardar" class="px-5 py-2 bg-brand-blue hover:bg-brand-blueHover text-white text-sm font-semibold rounded-xl transition">Guardar Ticket</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL 2: VISTA DETALLADA DEL TICKET -->
  <div id="modalDetalle" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 z-50">
    <div class="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
      
      <!-- Header Detalle -->
      <div class="px-6 py-4 bg-brand-blue text-white flex justify-between items-center">
        <div>
          <span id="detIdCorrelativo" class="text-xs font-mono bg-blue-900/50 px-2 py-1 rounded text-blue-200 font-bold"></span>
          <h3 id="detAsunto" class="text-lg font-bold mt-1"></h3>
        </div>
        <button onclick="cerrarModalDetalle()" class="text-blue-200 hover:text-white text-2xl">&times;</button>
      </div>

      <!-- Cuerpo Detalle -->
      <div class="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
        
        <!-- Metadatos Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <p class="text-xs font-semibold text-brand-grayDark uppercase">Solicitante</p>
            <p id="detUsuario" class="font-medium text-slate-900 mt-0.5"></p>
          </div>
          <div>
            <p class="text-xs font-semibold text-brand-grayDark uppercase">Estado</p>
            <div id="detEstadoContainer" class="mt-0.5"></div>
          </div>
          <div>
            <p class="text-xs font-semibold text-brand-grayDark uppercase">Prioridad</p>
            <p id="detPrioridad" class="font-medium text-slate-900 mt-0.5"></p>
          </div>
          <div>
            <p class="text-xs font-semibold text-brand-grayDark uppercase">Fecha y Hora</p>
            <p id="detFecha" class="text-xs text-slate-600 mt-0.5"></p>
          </div>
        </div>

        <!-- Contenido Descripción HTML -->
        <div>
          <h4 class="text-xs font-semibold text-brand-grayDark uppercase tracking-wider mb-2">Descripción Detallada</h4>
          <div id="detDescripcion" class="bg-slate-50 border border-slate-200 p-4 rounded-xl min-h-[100px] prose text-slate-800"></div>
        </div>

        <!-- Área de Adjuntos ZIP -->
        <div id="detSeccionAdjuntos" class="border-t border-slate-200 pt-4 hidden">
          <h4 class="text-xs font-semibold text-brand-grayDark uppercase tracking-wider mb-2">Archivos Adjuntos</h4>
          <button id="btnDescargarZip" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Descargar Archivos Adjuntos (.ZIP)
          </button>
        </div>

      </div>

      <!-- Footer Detalle -->
      <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
        <button onclick="cerrarModalDetalle()" class="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-xl transition">Cerrar</button>
      </div>

    </div>
  </div>

  <script>
    let quill;
    let listaTicketsCache = [];

    document.addEventListener('DOMContentLoaded', () => {
      quill = new Quill('#editorDescripcion', {
        theme: 'snow',
        placeholder: 'Escriba la descripción detallada...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
          ]
        }
      });

      cargarTickets();
    });

    function abrirModalCrear() {
      const ahora = new Date();
      document.getElementById('ticketFecha').value = ahora.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
      document.getElementById('modalTicket').classList.remove('hidden');
      document.getElementById('modalTicket').classList.add('flex');
    }

    function cerrarModalCrear() {
      document.getElementById('modalTicket').classList.add('hidden');
      document.getElementById('modalTicket').classList.remove('flex');
      document.getElementById('formNuevoTicket').reset();
      quill.setText('');
    }

    async function cargarTickets() {
      const tbody = document.getElementById('tabla-tickets-body');
      try {
        const res = await fetch('/api/tickets');
        let tickets = await res.json();

        if (!Array.isArray(tickets) || tickets.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-400">No hay tickets registrados.</td></tr>`;
          return;
        }

        // Ordenar cronológicamente (antiguo -> nuevo) para asignar correlativo constante
        tickets.sort((a, b) => new Date(a.creadoEn || a.fecha || 0) - new Date(b.creadoEn || b.fecha || 0));

        // Mapear correlativo
        listaTicketsCache = tickets.map((t, index) => {
          const num = String(index + 1).padStart(3, '0');
          return { ...t, correlativo: `TK-${num}` };
        });

        // Mostrar en la tabla en orden inverso (más reciente primero)
        const ticketsInvertidos = [...listaTicketsCache].reverse();

        tbody.innerHTML = ticketsInvertidos.map(t => {
          const usuario = t.usuario || t.nombre || t.solicitante || 'N/A';
          const asunto = t.asunto || t.titulo || 'Sin asunto';
          const estado = t.estado || 'Abierto';
          const prioridad = t.prioridad || 'Media';
          const fecha = t.fecha_creacion_formateada || t.fecha || 'Reciente';

          return `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
              <td class="px-6 py-4 font-mono font-bold text-xs text-brand-blue">${t.correlativo}</td>
              <td class="px-6 py-4 font-medium text-slate-900">${usuario}</td>
              <td class="px-6 py-4 text-slate-700">${asunto}</td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${obtenerBadge(estado)}">
                  ${estado}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-600">${prioridad}</td>
              <td class="px-6 py-4 text-xs text-slate-500">${fecha}</td>
              <td class="px-6 py-4 text-center">
                <button onclick="verDetalleTicket('${t.id}')" class="px-3 py-1.5 bg-brand-blue hover:bg-brand-blueHover text-white text-xs font-medium rounded-lg transition">
                  Ver Detalle
                </button>
              </td>
            </tr>
          `;
        }).join('');

      } catch (err) {
        console.error("Error cargando tickets:", err);
      }
    }

    function verDetalleTicket(id) {
      const ticket = listaTicketsCache.find(t => t.id === id);
      if (!ticket) return;

      document.getElementById('detIdCorrelativo').innerText = ticket.correlativo;
      document.getElementById('detAsunto').innerText = ticket.asunto || ticket.titulo || 'Sin Asunto';
      document.getElementById('detUsuario').innerText = ticket.usuario || ticket.nombre || 'N/A';
      document.getElementById('detPrioridad').innerText = ticket.prioridad || 'Media';
      document.getElementById('detFecha').innerText = ticket.fecha_creacion_formateada || ticket.fecha || 'N/A';
      
      const estado = ticket.estado || 'Abierto';
      document.getElementById('detEstadoContainer').innerHTML = `
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${obtenerBadge(estado)}">${estado}</span>
      `;

      document.getElementById('detDescripcion').innerHTML = ticket.descripcion_html || '<p class="text-slate-400 italic">Sin descripción registrada.</p>';

      // Manejo de adjuntos en ZIP
      const seccionAdjuntos = document.getElementById('detSeccionAdjuntos');
      const btnDescargar = document.getElementById('btnDescargarZip');

      if (ticket.archivo_zip) {
        seccionAdjuntos.classList.remove('hidden');
        btnDescargar.onclick = () => descargarZip(ticket.archivo_zip, ticket.correlativo);
      } else {
        seccionAdjuntos.classList.add('hidden');
      }

      document.getElementById('modalDetalle').classList.remove('hidden');
      document.getElementById('modalDetalle').classList.add('flex');
    }

    function cerrarModalDetalle() {
      document.getElementById('modalDetalle').classList.add('hidden');
      document.getElementById('modalDetalle').classList.remove('flex');
    }

    function descargarZip(base64Data, nombreTicket) {
      const link = document.createElement('a');
      link.href = 'data:application/zip;base64,' + base64Data;
      link.download = `Adjuntos_${nombreTicket}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    async function guardarTicket(e) {
      e.preventDefault();
      const btn = document.getElementById('btnGuardar');
      const msgCompresion = document.getElementById('estadoCompresion');
      btn.disabled = true;

      try {
        const archivos = document.getElementById('ticketAdjuntos').files;
        let zipBase64 = null;

        if (archivos.length > 0) {
          msgCompresion.classList.remove('hidden');
          const zip = new JSZip();

          for (let file of archivos) {
            let archivoAProcesar = file;
            if (file.type.startsWith('image/')) {
              const opciones = { maxSizeMB: 0.4, maxWidthOrHeight: 1000, useWebWorker: true };
              archivoAProcesar = await imageCompression(file, opciones);
            }
            zip.file(file.name, archivoAProcesar);
          }

          zipBase64 = await zip.generateAsync({ type: 'base64', compression: 'DEFLATE' });
        }

        const nuevoTicket = {
          usuario: document.getElementById('ticketUsuario').value,
          asunto: document.getElementById('ticketAsunto').value,
          estado: document.getElementById('ticketEstado').value,
          prioridad: document.getElementById('ticketPrioridad').value,
          fecha_creacion_formateada: document.getElementById('ticketFecha').value,
          descripcion_html: quill.root.innerHTML,
          archivo_zip: zipBase64
        };

        const res = await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoTicket)
        });

        if (res.ok) {
          cerrarModalCrear();
          cargarTickets();
        } else {
          alert("Error guardando el ticket.");
        }
      } catch (error) {
        console.error("Error al guardar:", error);
      } finally {
        btn.disabled = false;
        msgCompresion.classList.add('hidden');
      }
    }

    function obtenerBadge(estado) {
      switch (estado) {
        case 'Abierto': return 'bg-red-100 text-red-700 border border-red-200';
        case 'En Proceso': return 'bg-amber-100 text-amber-700 border border-amber-200';
        case 'Cerrado': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
        default: return 'bg-slate-100 text-slate-600';
      }
    }
  </script>
</body>
</html>