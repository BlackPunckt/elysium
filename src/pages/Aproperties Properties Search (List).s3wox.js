/*
$w.onReady(() => {
 
});*/

import wixData from 'wix-data';
import { session } from 'wix-storage';
import wixWindow from 'wix-window';

$w.onReady(() => {

    // Utilidad para ocultar todas las cajas
    function hideAllBoxes() {
        const boxes = ["#locationBoxSearch", "#statusBox", "#assignedToBox", "#priceFilterBox", "#typeOfPropertyBox"];
        boxes.forEach(box => {
            $w(box).hide();
            $w(box).collapse();
        });
    }

    // Mostrar una caja y ocultar las demás
    function toggleBox(targetBoxSelector) {
        if ($w(targetBoxSelector).hidden) {
            hideAllBoxes(); // Oculta las demás
            $w(targetBoxSelector).show();
            $w(targetBoxSelector).expand();
        } else {
            $w(targetBoxSelector).hide();
            $w(targetBoxSelector).collapse();
        }
    }

    // Botones de búsqueda con lógica de alternancia
    $w('#searchLocationButton').onClick(() => {
        toggleBox("#locationBoxSearch");
    });

    $w('#statusSearchButton').onClick(() => {
        toggleBox("#statusBox");
    });

    $w('#assignedToSearchButton').onClick(() => {
        toggleBox("#assignedToBox");
    });

    $w('#priceSearchFilterButton').onClick(() => {
        toggleBox("#priceFilterBox");
    });

    $w('#typeSearchFilterButton').onClick(() => {
        toggleBox("#typeOfPropertyBox");
    });

    $w('#moreFilterSearchButton').onClick(() => {
        hideAllBoxes(); // Oculta todas las cajas abiertas
        //wixWindow.openLightbox("#myPropertiesMoreFiltersLightbox"); 
    });




    ///__________Filtros de ubicación
    $w("#locationBoxSearch").collapse();
    $w("#cleanLocationSearchButton").hide();
    $w("#searchDisplaySmallRepeater").collapse();

    // Mostrar la caja de búsqueda cuando se hace clic
    $w("#searchLocationButton").onClick(() => {
        $w("#locationBoxSearch").expand();
        $w("#searchLocationInputBox2").value = "";
    });

    // Aplicar búsqueda al dar clic en el botón de aplicar
    $w("#locationApplyFilterButton").onClick(() => {
        const inputValue = $w("#searchLocationInputBox2").value.trim();
        if (!inputValue) return;

        applyLocationFilter(inputValue);
        saveLocationSearch(inputValue);
    });

    // Limpiar todas las búsquedas
    $w("#cleanLocationSearchButton").onClick(() => {
        session.removeItem("recentLocationSearches");
        $w("#searchDisplaySmallRepeater").collapse();
        $w("#cleanLocationSearchButton").hide();
        $w("#searchLocationInputBox2").value = " ";
        $w("#myPropertiesDynamicDataset").setFilter(wixData.filter());
    });

    loadRecentSearches();

});

function applyLocationFilter(inputValue) {
    const terms = inputValue.split(/\s+/);

    let combinedFilter = wixData.filter();

    terms.forEach(term => {
        const singleTermFilter = wixData.filter()
            .contains("country", term)
            .or(wixData.filter().contains("state", term))
            .or(wixData.filter().contains("areaNeighborhood", term))
            .or(wixData.filter().contains("street", term));
        combinedFilter = combinedFilter.and(singleTermFilter);
    });

    $w("#myPropertiesDynamicDataset").setFilter(combinedFilter)
        .then(() => {
            console.log("Ubicación filtrada.");
            $w("#searchDisplaySmallRepeater").expand();
        })
        .catch(err => {
            console.error("Error al aplicar el filtro:", err);
        });
}

function saveLocationSearch(term) {
    let searches = JSON.parse(session.getItem("recentLocationSearches") || "[]");

    // Eliminar duplicados y agregar al inicio
    searches = [term, ...searches.filter(t => t !== term)];
    // Limitar a 4
    if (searches.length > 4) searches = searches.slice(0, 4);

    session.setItem("recentLocationSearches", JSON.stringify(searches));
    loadRecentSearches();
}

function loadRecentSearches() {
    const searches = JSON.parse(session.getItem("recentLocationSearches") || "[]");

    if (searches.length === 0) {
        $w("#searchDisplaySmallRepeater").collapse();
        $w("#cleanLocationSearchButton").hide();
        return;
    }

    const formattedItems = searches.map(term => ({
        searchText: term.length > 60 ? term.substring(0, 57) + "..." : term,
        fullText: term,
        timestamp: new Date().toLocaleString()
    }));

    $w("#searchDisplaySmallRepeater").data = formattedItems;
    $w("#cleanLocationSearchButton").show();
    $w("#searchDisplaySmallRepeater").expand();
}

// Repeater item ready
export function searchDisplaySmallRepeater_itemReady($item, itemData) { //,index)
    $item("#searchResultsText1").text = itemData.searchText;
    $item("#timeClockImage1").alt = `Búsqueda guardada: ${itemData.timestamp}`;

    // Botón para borrar una búsqueda individual
    $item("#searchResultsDeleteButton1").onClick(() => {
        let searches = JSON.parse(session.getItem("recentLocationSearches") || "[]");
        searches = searches.filter(term => term !== itemData.fullText);
        session.setItem("recentLocationSearches", JSON.stringify(searches));
        loadRecentSearches();
    });

    // Hacer clic en el término re-aplica el filtro
    $item("#searchResultsText1").onClick(() => {
        $w("#searchLocationInputBox2").value = itemData.fullText;
        applyLocationFilter(itemData.fullText);
    });
}

/*

$w('#searchLocationButton').onClick((event) => {
    if ($w("#locationBoxSearch").hidden) {

        $w("#locationBoxSearch").show();
        $w("#locationBoxSearch").expand();

    } else {
        $w("#locationBoxSearch").hide();
        $w("#locationBoxSearch").collapse();
    }

})

$w('#statusSearchButton').onClick((event) => {

    if ($w("#statusBox").hidden) {

        $w("#statusBox").show();
        $w("#statusBox").expand();

    } else {

        $w("#statusBox").hide();
        $w("#statusBox").collapse();
    }
})


$w('#assignedToSearchButton').onClick((event) => {
    if ($w("#assignedToBox").hidden) {

        $w("#assignedToBox").show();
        $w("#assignedToBox").expand();

    } else {

        $w("#assignedToBox").hide();
        $w("#assignedToBox").collapse();
    }
})

$w('#priceSearchFilterButton').onClick((event) => {
    if ($w("#priceFilterBox").hidden) {

        $w("#priceFilterBox").show();
        $w("#priceFilterBox").expand();

    } else {

        $w("#priceFilterBox").hide();
        $w("#priceFilterBox").collapse();
    }
})*/

// Ocultar locationBoxSearch al perder foco fuera del contenedor
/*$w("#searchLocationInputBox2").onBlur(() => {
  setTimeout(() => {
    $w("#locationBoxSearch").collapse();
  }, 300); // Espera a que termine alguna interacción
});*/

//--------------------------------
/*
import wixData from 'wix-data';
//import { session } from 'wix-storage';
//import wixWindow from 'wix-window';

$w.onReady(() => {
  $w("#locationBoxSearch").collapse();
  $w("#cleanLocationSearchButton").hide();
  $w("#searchDisplaySmallRepeater").collapse();

  $w("#searchLocationButton").onClick(() => {
    $w("#locationBoxSearch").expand();
  });

  $w("#searchLocationInputBox2").onBlur(() => {
    $w("#locationBoxSearch").collapse();
  });

  $w("#locationApplyFilterButton").onClick(() => {
    const input = $w("#searchLocationInputBox2").value.trim();
    if (!input) return;

    let terms = input.toLowerCase().split(" ").filter(term => term.length > 0);
    if (terms.length === 0) return;

    let combinedFilter = wixData.filter(); // vacía inicialmente

    terms.forEach(term => {
      const singleTermFilter = wixData.filter()
        .contains("country", term)
        .or(wixData.filter().contains("state", term))
        .or(wixData.filter().contains("areaNeighborhood", term))
        .or(wixData.filter().contains("street", term));
      combinedFilter = combinedFilter.and(singleTermFilter);
    });

    $w("#myPropertiesDynamicDataset").setFilter(combinedFilter)
      .then(() => {
        console.log("Dataset filtrado con éxito por ubicación.");
        $w("#displayAllResultsRepeater").expand();
      })
      .catch((err) => {
        console.error("Error al aplicar el filtro:", err);
      });

    const displayText = input.length > 50 ? input.slice(0, 47) + "..." : input;
    $w("#searchResultsText1").text = displayText;

    $w("#searchDisplaySmallRepeater").expand();
    $w("#cleanLocationSearchButton").show();
  });

  $w("#cleanLocationSearchButton").onClick(() => {
    $w("#searchLocationInputBox2").value = "";
    $w("#searchResultsText1").text = "";
    $w("#myPropertiesDynamicDataset").setFilter(wixData.filter());
    $w("#searchDisplaySmallRepeater").collapse();
    $w("#cleanLocationSearchButton").hide();
    $w("#displayAllResultsRepeater").collapse();
  });
});
*/

