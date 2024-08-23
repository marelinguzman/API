document.addEventListener("DOMContentLoaded", cargarTodasLasComidas);

const botonBusqueda = document.getElementById('boton-busqueda');
const listaComida = document.getElementById('comida');
const contenidoDetalles = document.querySelector('.contenido-detalles');
const botonCerrarDetalles = document.getElementById('cerrar-detalles');
const filtroQueso = document.getElementById('queso');
const filtroHuevo = document.getElementById('huevo');
const filtroLeche = document.getElementById('leche');

// Eventos
botonBusqueda.addEventListener('click', buscarComidas);
listaComida.addEventListener('click', mostrarReceta);
botonCerrarDetalles.addEventListener('click', cerrarReceta);
filtroQueso.addEventListener('click', () => filtrarPorIngrediente('cheese'));
filtroHuevo.addEventListener('click', () => filtrarPorIngrediente('egg'));
filtroLeche.addEventListener('click', () => filtrarPorIngrediente('milk'));

function cargarTodasLasComidas() {
    fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=')
        .then(response => response.json())
        .then(data => mostrarComidas(data.meals));
}

function buscarComidas() {
    const entradaBusqueda = document.getElementById('entrada-busqueda').value.trim();
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${entradaBusqueda}`)
        .then(response => response.json())
        .then(data => mostrarComidas(data.meals));
}

function filtrarPorIngrediente(ingrediente) {
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingrediente}`)
        .then(response => response.json())
        .then(data => mostrarComidas(data.meals));
}

function mostrarComidas(comidas) {
    let html = "";
    if (comidas) {
        comidas.forEach(comida => {
            html += `
                <div class="comida-item" data-id="${comida.idMeal}">
                    <div class="comida-img">
                        <img src="${comida.strMealThumb}" alt="Imagen de comida">
                    </div>
                    <div class="comida-nombre">
                        <h3>${comida.strMeal}</h3>
                        <button class="boton-receta">Ver Receta</button>
                    </div>
                </div>
            `;
        });
    } else {
        html = "No se encontraron comidas.";
    }
    listaComida.innerHTML = html;
}

function mostrarReceta(e) {
    if (e.target.classList.contains('boton-receta')) {
        const comidaId = e.target.closest('.comida-item').dataset.id;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${comidaId}`)
            .then(response => response.json())
            .then(data => mostrarModalReceta(data.meals[0]));
    }
}

function mostrarModalReceta(comida) {
    const html = `
        <div class="nombres">
            <h2>${comida.strMeal}</h2>
        <p>${comida.strCategory}</p>
        </div>
        <h3>Instrucciones:</h3>
        <div class="ventana">
            <p>${comida.strInstructions}</p>
            <img src="${comida.strMealThumb}" alt="">
        </div>
    `;
    contenidoDetalles.innerHTML = html;
    document.querySelector('.detalles-comida').style.display = 'block';
}

function cerrarReceta() {
    document.querySelector('.detalles-comida').style.display = 'none';
}

function filtrarPorIngrediente() {
    // Verificar el estado de las checkboxes
    const filtros = [];
    if (filtroQueso.checked) filtros.push('cheese');
    if (filtroHuevo.checked) filtros.push('egg');
    if (filtroLeche.checked) filtros.push('milk');

    // Si no hay filtros seleccionados, cargar todas las comidas
    if (filtros.length === 0) {
        cargarTodasLasComidas();
    } else {
        // Filtrar comidas por los ingredientes seleccionados
        let promesas = filtros.map(filtro => fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${filtro}`)
            .then(response => response.json())
            .then(data => data.meals)
        );

        // Ejecutar todas las promesas de fetch y combinar los resultados
        Promise.all(promesas)
            .then(resultados => {
                // Combinar los arrays de comidas de todos los filtros
                let comidasFiltradas = [].concat(...resultados);
                mostrarComidas(comidasFiltradas);
            });
    }
}