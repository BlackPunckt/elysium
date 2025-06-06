import wixData from 'wix-data';


$w.onReady(() => {
   // Consultar precio máximo
   wixData.query("aproperties")
       .descending("salePriceValue")
       .limit(1)
       .find()
       .then((result) => {
           if (result.items.length > 0) {
               const highestPrice = result.items[0].salePriceValue;
               const minPrice = 10000;
               const maxPrice = highestPrice + 10000;


               // Configurar slider
               $w("#priceSearchSlider").min = minPrice;
               $w("#priceSearchSlider").max = maxPrice;
               $w("#priceSearchSlider").step = 10000;


               // Asignar valor inicial como array [min, max]
               $w("#priceSearchSlider").value = [minPrice, maxPrice];


               // Actualizar etiqueta al inicio
               updateSliderLabel(minPrice, maxPrice);
           }
       });


   // Evento al mover slider
   $w("#priceSearchSlider").onChange((event) => {
       const value = event.target.value;
       const [min, max] = Array.isArray(value) ? value : [value, value];
       updateSliderLabel(min, max);
   });


});


// Función para actualizar etiqueta con formato
function updateSliderLabel(min, max) {
   const formattedMin = formatCurrency(min);
   const formattedMax = formatCurrency(max);
   $w("#priceSearchSlider").label = `MXN$${formattedMin} - MXN$${formattedMax}`;
}


// Función para formatear número como moneda
function formatCurrency(value) {
   return value
       .toFixed(2)
       .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
