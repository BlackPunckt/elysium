import wixData from 'wix-data';

$w.onReady(async function () {
  const result = await wixData.query("Aproperties").limit(1000).find();
  const properties = result.items;

  const mapMarkers = [];

  const propertiesWithData = properties.map((property, index) => {
    // Dirección corta
    const shortAddress = [
      property.exteriorNumber,
      property.street
    ]
      .filter(part => part && part.trim() !== "")
      .join(" ");

    // Precio formateado
    let formattedPrice = "Precio no disponible";
    if (property.salePrice && property.salePriceCurrency) {
      let numericPrice = Number(
        String(property.salePrice).replace(/[^0-9.]/g, "")
      );
      if (!isNaN(numericPrice)) {
        formattedPrice = `${property.salePriceCurrency} $${numericPrice.toLocaleString()}`;
      }
    }

    const fullText = `${index + 1}. ${shortAddress} - ${formattedPrice}`;

    // Si hay coordenadas válidas, agregarlas al arreglo de marcadores
    if (property.latitude && property.longitude) {
      mapMarkers.push({
        latitude: property.latitude,
        longitude: property.longitude,
        description: property.propertyTitle || "Propiedad sin título"
      });
    }

    return {
      ...property,
      fullText
    };
  });

  // Mostrar en el repeater
  $w("#propertiesAddressesRepeater").data = propertiesWithData;

  $w("#propertiesAddressesRepeater").onItemReady(($item, itemData) => {
    $item("#addressText1").text = itemData.fullText || "Datos no disponibles";
  });

  // Mostrar todos los marcadores en el mapa
  if (mapMarkers.length > 0) {
    $w("#googleMaps1").markers = mapMarkers;
  } else {
    console.warn("No se encontraron coordenadas válidas para las propiedades.");
  }
});


$w("#propertiesAddressesRepeater").onItemReady(($item, itemData) => {
  $item("#addressText1").text = itemData.fullText || "Datos no disponibles";

  $item("#addressText1").onClick(() => {
    if (itemData.latitude && itemData.longitude) {
      $w("#googleMaps1").location = {
        latitude: itemData.latitude,
        longitude: itemData.longitude,
        description: itemData.propertyTitle || "Sin título"
      };
    }
  });
});
