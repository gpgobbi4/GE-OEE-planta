// ===============================
// DETECCIÓN DE DISPOSITIVO
// ===============================
const ES_CELULAR = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const FILAS_INICIALES = ES_CELULAR ? 200 : 2000;
const STEP = 200;

let rowsGlobales = [];
let offset = 0;

// ===============================
// FUNCIÓN PRINCIPAL
// ===============================
async function buscarArchivo() {
    const fechaInput = document.getElementById('fechaBusqueda').value;
    const contenedor = document.getElementById('resultado');

    if (!fechaInput) {
        alert("Por favor, selecciona una fecha.");
        return;
    }

    const [anio, mes, dia] = fechaInput.split('-');

    const mesesMap = {
        "01": "01_Enero", "02": "02_Febrero", "03": "03_Marzo",
        "04": "04_Abril", "05": "05_Mayo", "06": "06_Junio",
        "07": "07_Julio", "08": "08_Agosto", "09": "09_Septiembre",
        "10": "10_Octubre", "11": "11_Noviembre", "12": "12_Diciembre"
    };

    const carpetaMes = mesesMap[mes];
    const nombreArchivo = `${dia}-${mes}-${anio}.xlsx`;
    const rutaFinal = `data/${anio}/${carpetaMes}/${nombreArchivo}`;

    contenedor.innerHTML = "<p>Buscando archivo...</p>";

    try {
        const response = await fetch(rutaFinal);
        if (!response.ok) throw new Error("No existe registro para esta fecha.");

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        rowsGlobales = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            blankrows: false
        });

        offset = 0;
        renderizarTabla(contenedor, true);

    } catch (error) {
        contenedor.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
}

// ===============================
// RENDER DE TABLA
// ===============================
function renderizarTabla(contenedor, reset = false) {
    if (reset) {
        contenedor.innerHTML = `
            ${ES_CELULAR ? `
            <p style="color:#b45309; font-weight:bold;">
                📱 Vista optimizada para celular – archivo con ${rowsGlobales.length} filas
            </p>` : ''}
            <div class="table-container">
                <table>
                    <tbody id="tabla-body"></tbody>
                </table>
            </div>
            ${ES_CELULAR ? `
            <button id="btn-mas" onclick="mostrarMasFilas()"
                style="margin-top:15px; padding:10px 20px;
                       background:#27ae60; color:#fff;
                       border:none; border-radius:6px;
                       font-weight:bold; cursor:pointer;">
                Mostrar más filas
            </button>` : ''}
        `;
    }

    mostrarMasFilas();
}

// ===============================
// MOSTRAR MÁS FILAS (SOLO CELULAR)
// ===============================
function mostrarMasFilas() {
    const tbody = document.getElementById('tabla-body');
    const slice = rowsGlobales.slice(offset, offset + (ES_CELULAR ? STEP : FILAS_INICIALES));

    slice.forEach(fila => {
        const tr = document.createElement('tr');
        fila.forEach(celda => {
            const td = document.createElement('td');
            td.textContent = celda ?? '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    offset += slice.length;

    if (ES_CELULAR && offset >= rowsGlobales.length) {
        const btn = document.getElementById('btn-mas');
        if (btn) btn.style.display = 'none';
    }
}