// ===============================
// DATA GLOBAL
// ===============================
let rawDataStore = [];

const USUARIO = "gpgobbi4";
const REPO = "OEE-y-GE-Planta-RII";

// ===============================
// UTILIDADES
// ===============================
const mesesNombre = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

// ===============================
// ACTUALIZAR SELECTOR AÑO
// ===============================
function actualizarSelectorAnio() {
    const sel = document.getElementById("selector-anio");
    if (!sel) return;

    const anios = [...new Set(
        rawDataStore.map(d => {
            const f = d.fecha instanceof Date ? d.fecha : new Date(d.fecha);
            return f.getFullYear();
        })
    )].sort((a,b)=>a-b);

    sel.innerHTML = '<option value="">Seleccione año</option>';
    anios.forEach(a => sel.innerHTML += `<option value="${a}">${a}</option>`);
}

document.getElementById("selector-anio").addEventListener("change", e => {
    const anio = parseInt(e.target.value);
    if (!anio) {
        document.getElementById("resumen-anual").style.display = "none";
        return;
    }
    mostrarResumenAnual(anio);
});

// ===============================
// RESUMEN ANUAL
// ===============================
function mostrarResumenAnual(anio) {
    const datos = rawDataStore.filter(d => {
        const f = d.fecha instanceof Date ? d.fecha : new Date(d.fecha);
        return f.getFullYear() === anio;
    });

    if (!datos.length) return;

    document.getElementById("resumen-anual").style.display = "block";

    // KPIs
    const totalNom = datos.reduce((a,b)=>a+b.nom,0);
    const totalProd = datos.reduce((a,b)=>a+b.sap,0);

    document.getElementById("kpis-anuales").innerHTML = `
        <div class="card">
            <h4>OEE Anual</h4>
            <div>${calcOEE(totalNom,totalProd).toFixed(1)}%</div>
        </div>
        <div class="card">
            <h4>Producción Total</h4>
            <div>${totalProd.toLocaleString()}</div>
        </div>
    `;

    // Resumen mensual
    const meses = {};
    datos.forEach(d => {
        const f = d.fecha instanceof Date ? d.fecha : new Date(d.fecha);
        const m = f.getMonth();
        if(!meses[m]) meses[m] = {n:0,p:0};
        meses[m].n += d.nom;
        meses[m].p += d.sap;
    });

    let html = `<table>
        <thead><tr><th>Mes</th><th>OEE</th><th>Producción</th></tr></thead><tbody>`;

    const x=[],y=[];
    Object.keys(meses).sort((a,b)=>a-b).forEach(m=>{
        html+=`
        <tr onclick="aplicarFiltroMes(${anio},${m})" style="cursor:pointer">
            <td>${mesesNombre[m]}</td>
            <td>${calcOEE(meses[m].n,meses[m].p).toFixed(1)}%</td>
            <td>${meses[m].p.toLocaleString()}</td>
        </tr>`;
        x.push(mesesNombre[m]);
        y.push(meses[m].p);
    });
    html+="</tbody></table>";

    document.getElementById("tabla-resumen-mes").innerHTML = html;

    Plotly.newPlot("grafico-anual",[{
        x,y,type:"bar"
    }],{title:`Producción mensual ${anio}`});
}

// ===============================
// BAJAR A VISTA MENSUAL
// ===============================
function aplicarFiltroMes(anio, mes) {
    const filtrado = rawDataStore.filter(d => {
        const f = d.fecha instanceof Date ? d.fecha : new Date(d.fecha);
        return f.getFullYear() === anio && f.getMonth() === mes;
    });

    procesarInformacion(filtrado);
    renderTablaOriginal(filtrado);
}

// ===============================
// EL RESTO DE TU SCRIPT ORIGINAL
// (cargarDesdeReservorio, procesarFilasDirecto,
// calcOEE, procesarInformacion, renderGrafico, etc.)
// ===============================