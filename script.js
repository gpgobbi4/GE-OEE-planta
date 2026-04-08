// ===============================
// DETECCIÓN DE DISPOSITIVO
// ===============================
const ES_CELULAR = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ===============================
// MAPEO DE MESES (estructura repo)
// ===============================
const MESES = {
    "01": "01_Enero",
    "02": "02_Febrero",
    "03": "03_Marzo",
    "04": "04_Abril",
    "05": "05_Mayo",
    "06": "06_Junio",
    "07": "07_Julio",
    "08": "08_Agosto",
    "09": "09_Septiembre",
    "10": "10_Octubre",
    "11": "11_Noviembre",
    "12": "12_Diciembre"
};

// ===============================
// CARGA AUTOMÁTICA AL ABRIR
// ===============================
window.addEventListener('DOMContentLoaded', async () => {
    if (ES_CELULAR) {
        await cargarMesCalendarioActual();
    } else {
        await cargarAnioCompleto();
    }
});

// ===============================
// BÚSQUEDA MANUAL POR FECHA
// (NO SE TOCA COMPORTAMIENTO)
// ===============================
async function buscarArchivo() {
    const fechaInput = document.getElementById('fechaBusqueda').value;
    const contenedor = document.getElementById('resultado');

    if (!fechaInput) {
        alert("Por favor, selecciona una fecha.");
        return;
    }

    const [anio, mes, dia] = fechaInput.split('-');
    const carpetaMes = MESES[mes];
    const nombreArchivo = `${dia}-${mes}-${anio}.xlsx`;
    const rutaFinal = `data/${anio}/${carpetaMes}/${nombreArchivo}`;

    contenedor.innerHTML = "<p>Buscando archivo...</p>";

    try {
        const response = await fetch(rutaFinal);
        if (!response.ok) {
            throw new Error("No existe registro para esta fecha.");
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const htmlTable = XLSX.utils.sheet_to_html(worksheet);
        contenedor.innerHTML = htmlTable;

    } catch (error) {
        contenedor.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
}

// ===============================
// CARGA AÑO COMPLETO (PC)
// ===============================
async function cargarAnioCompleto() {
    const anio = new Date().getFullYear();

    for (const mesNum in MESES) {
        await cargarMes(anio, mesNum);
    }
}

// ===============================
// CARGA MES CALENDARIO ACTUAL (CELULAR)
// ===============================
async function cargarMesCalendarioActual() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mesNum = String(hoy.getMonth() + 1).padStart(2, '0');

    await cargarMes(anio, mesNum);
}

// ===============================
// CARGA GENÉRICA DE UN MES
// (MISMA LÓGICA QUE ANTES)
// ===============================
async function cargarMes(anio, mesNum) {
    const carpetaMes = MESES[mesNum];
    const promesas = [];

    for (let d = 1; d <= 31; d++) {
        const dia = String(d).padStart(2, '0');
        const archivo = `${dia}-${mesNum}-${anio}.xlsx`;
        const url = `data/${anio}/${carpetaMes}/${archivo}`;
        promesas.push(fetchSilencioso(url));
    }

    await Promise.all(promesas);
}

// ===============================
// FETCH SILENCIOSO
// ===============================
async function fetchSilencioso(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) return;
        await response.arrayBuffer();
    } catch {
        return;
    }
}