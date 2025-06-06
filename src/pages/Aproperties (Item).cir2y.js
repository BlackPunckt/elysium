import wixData from 'wix-data';

$w.onReady(function () {

    // Cambiar al estado 'Open'
    $w("#openButton").onClick(() => {
        $w("#morePropertyDetailsStateBox").changeState("Open");
    });

    // Cambiar al estado 'Closed'
    $w("#closedButton").onClick(() => {
        $w("#morePropertyDetailsStateBox").changeState("Closed");
    });

    $w("#dynamicDataset").onReady(() => {
        const item = $w("#dynamicDataset").getCurrentItem();

        // Paso 1
        const exteriorNumber = item.exteriorNumber || "";
        const street = item.street || "";
        $w("#addressOneText").text = `${exteriorNumber}, ${street}`.trim();

        // Paso 2
        const neighborhood = item.areaNeighborhood || "";
        const state = item.state || "";
        const zip = item.zipCode || "";
        $w("#addressTwoText").text = `${neighborhood}, ${state}, ${zip}`.trim();

        // Paso 3
        const currency = item.salePriceCurrency || "";
        const price = item.salePrice || "";
        $w("#salePriceText").text = `${currency}${price}`;

        // Paso 4
        const cantidad = item.numberOfBedrooms;
        const totalBedrooms = `${cantidad} habitaciones`;
        $w("#numberOfBedrooms").text = totalBedrooms;

		// Paso 5
        const baths = item.numberOfBathrooms;
        const totalBaths = `${baths} baños`;
        $w("#numberOfBaths").text = totalBaths;

		// Paso 6
        const halfBaths = item.numberOfHalfBathrooms;
        const totalHalfBaths = `${halfBaths} medios baños`;
        $w("#numberOfHaldBedrooms").text = totalHalfBaths;

		// Paso 7
        const constructionArea = item.constructionArea;
        const construction = `${constructionArea} de construcción`;
        $w("#construtionAreaText").text = construction;

		// Paso 8
        const landArea = item.landArea;
        const land = `${landArea} de terreno`;
        $w("#landAreaText").text = land;

    });
});