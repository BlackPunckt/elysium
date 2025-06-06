import wixData from 'wix-data';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import { v4 as uuidv4 } from 'uuid';
import { deleteUnusedFiles } from 'backend/PropertiesMedia';
import { getEnabledFields } from 'backend/typeOfPropertySettings.jsw';

let globalSaleData;
let globalRentData;
let globalShortTermRentData;
let selectedImageIndex;
let uploadedFiles;
let galleryItems;
let initialPhotoCount = 0;

let deletedItems = [];

$w.onReady(function () {

    propertyCategories();

    $w("#uploadedPhotosGallery").onItemClicked((event) => {
        const selectedImageSource = event.item.src;
        $w("#selectedImage").src = selectedImageSource;
        selectedImageIndex = event.itemIndex;

    })

    /*****Area Surface Validation*************************/

    // Attach change events to dropdowns to enable input fields and validate them
    $w('#constructionSizeDropdown').onChange(() => handleUnitSelection('constructionSizeDropdown', 'constructionAreaInputTextBox', true));
    $w('#lotSizeDropdown').onChange(() => handleUnitSelection('lotSizeDropdown', 'lotSizeInputTextBox', true));
    $w('#frontSizeDropdown').onChange(() => handleUnitSelection('frontSizeDropdown', 'frontSizeInputTextBox', false));
    $w('#lengthSizeDropdown').onChange(() => handleUnitSelection('lengthSizeDropdown', 'lengthSizeInputTextBox', false));

    // Validate input while typing
    $w('#constructionAreaInputTextBox').onInput(() => validateInput('constructionAreaInputTextBox'));
    $w('#lotSizeInputTextBox').onInput(() => validateInput('lotSizeInputTextBox'));
    $w('#frontSizeInputTextBox').onInput(() => validateInput('frontSizeInputTextBox'));
    $w('#lengthSizeInputTextBox').onInput(() => validateInput('lengthSizeInputTextBox'));

    // Add suffix and format on blur
    $w('#constructionAreaInputTextBox').onBlur(() => updateAreaInput('constructionSizeDropdown', 'constructionAreaInputTextBox'));
    $w('#lotSizeInputTextBox').onBlur(() => updateAreaInput('lotSizeDropdown', 'lotSizeInputTextBox'));
    $w('#frontSizeInputTextBox').onBlur(() => updateAreaInput('frontSizeDropdown', 'frontSizeInputTextBox'));
    $w('#lengthSizeInputTextBox').onBlur(() => updateAreaInput('lengthSizeDropdown', 'lengthSizeInputTextBox'));
    //***********End Amount Validation**************/

    /***************************Location section********************************/

    /***************************End of Location section**************************/

    wixData.query('PropertyAmenities') // Replace with your dataset ID
        .find()
        .then(results => {
            if (results.items.length > 0) {
                const amenities = results.items.map(item => item.amenityName); // Replace 'name' with the field that contains amenity names
                $w('#amenitiesChecboxGroup').options = amenities.map(amenity => {
                    return { label: amenity, value: amenity };
                });
            }
        })
        .catch(error => {
            console.error('Error fetching amenities:', error);
        });

    // Store the initial count of uploaded photos in the gallery
    initialPhotoCount = $w("#uploadedPhotosGallery").items.length;

});

//Bring the categories 
function propertyCategories() {
    wixData.query("TypeofProperty")
        .limit(100)
        .find()
        .then(results => {
            const categories = getPropertyCategories(results.items);
            $w("#propertyCategoriesDropdown").options = buildOptions(categories);
        });

    function getPropertyCategories(items) {
        const categoriesOnly = items.map(item => item.propertyCategories);
        return [...new Set(categoriesOnly)];
    }

    function buildOptions(categoriesList) {
        return categoriesList.map(curr => {
            return { label: curr, value: curr };
        });
    }

}

$w('#propertyCategoriesDropdown').onChange((event) => {
    typeOfProperties();
    $w("#typeOfPropertiesDropdown").enable();
})

function typeOfProperties() {
    // Query based on selected property category
    wixData.query("TypeofProperty")
        .contains("propertyCategories", $w("#propertyCategoriesDropdown").value) // Filter by propertyCategories
        .limit(100)
        .find()
        .then(results => {
            const uniqueProperties = getUniqueProperties(results.items);
            $w("#typeOfPropertiesDropdown").options = buildOptions(uniqueProperties); // Update type dropdown with results
        });

    function getUniqueProperties(items) {
        const propertiesOnly = items.map(item => item.propertyType); // Extract propertyType from items
        return [...new Set(propertiesOnly)]; // Remove duplicates
    }

    function buildOptions(propertiesList) {
        return propertiesList.map(curr => {
            return { label: curr, value: curr }; // Map propertyType values to dropdown options
        });
    }

}

/***************Open Sale Lightbox**********************/
$w('#saleDatatButton').onClick((event) => {

    // Open the lightbox and handle the received data
    wixWindow.openLightbox('Sale Price Listing Info').then((saleData) => {
        console.log("Lightbox opened, data received:", saleData); // Log to check if lightbox opened
        if (saleData) {
            // Save the received data to the global variable
            globalSaleData = {
                salePrice: saleData.salePrice || '',
                salePriceBasedOn: saleData.salePriceBasedOn || '',
                saleCommissionType: saleData.saleCommissionType || '', // Ensure this matches the field name in lightbox
                saleCommissionAmount: saleData.saleCommissionAmount || '' // Ensure this matches the field name in lightbox
            };

            //Show Review data 
            $w("#reviewDataSignText").show();

            //Display data
            $w('#salePriceText').show(); // Display sale price
            $w('#salePricedBasedOnText').show(); // Display sale price base
            $w('#saleCommissionTypeText').show(); // Display commission
            $w('#saleCommissionAmountText').show(); // Display commission

            // Optionally display the received sale price and commission in text elements for user confirmation
            $w('#salePriceText').text = saleData.salePrice || ''; // Display sale price
            $w('#salePricedBasedOnText').text = saleData.salePriceBasedOn || ''; // Display sale price base
            $w('#saleCommissionTypeText').text = saleData.saleCommissionType || ''; // Display commission
            $w('#saleCommissionAmountText').text = saleData.saleCommissionAmount || ''; // Display commission

        } else {
            console.log("No data received from the lightbox");
        }
    }).catch((error) => {
        console.error("Error opening lightbox:", error); // Log any errors
    });
})
/***************end Opening Sale Light Box**********************/

/******************Open Rent Info LightBox**************/

export function rentInfoButton_click(event) {

    // Open the lightbox and handle the received data
    wixWindow.openLightbox('Rent Property Info').then((rentData) => {
        console.log("Lightbox opened, data received:", rentData); // Log to check if lightbox opened
        if (rentData) {
            // Save the received data to the global variable
            globalRentData = {
                rentPrice: rentData.rentPrice || '',
                rentPriceBasedOn: rentData.rentPriceBasedOn || '',
                rentCommissionType: rentData.rentCommissionType || '', // Ensure this matches the field name in lightbox
                rentCommissionAmount: rentData.rentCommissionAmount || '' // Ensure this matches the field name in lightbox
            };

            //Show Review data 
            $w("#reviewDataSignText").show();

            //Display data
            $w('#rentPriceText').show(); // Display sale price
            $w('#rentPricedBasedOnText').show(); // Display sale price base
            $w('#rentCommissionTypeText').show(); // Display commission
            $w('#rentCommissionAmountText').show(); // Display commission

            // Optionally display the received sale price and commission in text elements for user confirmation
            $w('#rentPriceText').text = rentData.rentPrice || ''; // Display rent price
            $w('#rentPricedBasedOnText').text = rentData.rentPriceBasedOn || ''; // Display rent price base
            $w('#rentCommissionTypeText').text = rentData.rentCommissionType || ''; // Display commission type
            $w('#rentCommissionAmountText').text = rentData.rentCommissionAmount || ''; // Display commission

        } else {
            console.log("No data received from the lightbox");
        }
    }).catch((error) => {
        console.error("Error opening lightbox:", error); // Log any errors
    });

}
/******************End Rent Info LightBox**************/

/******************Open Short Rent Info LightBox**************/
$w('#shorTimeRentButton').onClick((event) => {

    // Open the lightbox and handle the received data
    wixWindow.openLightbox('Short Term Rent Info').then((shortTermRentData) => {
        console.log("Lightbox opened, data received:", shortTermRentData); // Log to check if lightbox opened
        if (shortTermRentData) {

            globalShortTermRentData = {

                dailyShortTermRentPrice: shortTermRentData.dailyShortTermRentPrice || '',
                weeklyShortTermRentPrice: shortTermRentData.weeklyShortTermRentPrice || '',
                monthlyShortTermRentPrice: shortTermRentData.monthlyShortTermRentPrice || '',
                minimumStay: shortTermRentData.minimumStay || '',
                numberOfGuests: shortTermRentData.numberOfGuests || '',

            };

            //Show Review data 
            $w("#reviewDataSignText").show();

            //Show data
            $w('#dailyFeeTextBox').show(); // Display sale price
            $w('#weeklyFeeTextbox').show(); // Display sale price
            $w('#monthlyFeeTextbox').show(); // Display commission
            $w('#nightStayTextbox').show(); // Display commission
            $w('#guestNumbersText').show(), // Display commission

                // Display the data
                $w('#dailyFeeTextBox').text = shortTermRentData.dailyShortTermRentPrice || ''; // Display sale price
            $w('#weeklyFeeTextbox').text = shortTermRentData.weeklyShortTermRentPrice || ''; // Display sale price
            $w('#monthlyFeeTextbox').text = shortTermRentData.monthlyShortTermRentPrice || ''; // Display commission
            $w('#nightStayTextbox').text = shortTermRentData.minimumStay || ''; // Display commission
            $w('#guestNumbersText').text = shortTermRentData.numberOfGuests || ''; // Display commission

        }
    }).catch((error) => {
        console.error("Error opening lightbox:", error); // Log any errors
    });

})
/******************End of Short Term Rent Info LightBox**************/

/******************************************** */
//--- Button to save the property-------
/******************************************** */
export async function submitInfoButton_click(event) {

    // Create a property ID
    const propertyId = createPropertyId(); // Invisible

    // Get other property details
    const adTitle = $w("#adTitleInputText").value;
    const typeOfProperty = $w("#typeOfPropertiesDropdown").value;
    const propertyDescription = $w("#propertyDescriptionTextBox").value;

    // Safely get sale, rent, and short-term rent data from global variables (lightbox)
    const salePrice = globalSaleData?.salePrice || ''; // Use optional chaining and fallback to empty string
    const salePriceBasedOn = globalSaleData?.salePriceBasedOn || '';
    const saleCommissionType = globalSaleData?.saleCommissionType || '';
    const saleCommissionAmount = globalSaleData?.saleCommissionAmount || '';

    const rentPrice = globalRentData?.rentPrice || '';
    const rentPriceBasedOn = globalRentData?.rentPriceBasedOn || '';
    const rentCommissionType = globalRentData?.rentCommissionType || '';
    const rentCommissionAmount = globalRentData?.rentCommissionAmount || '';

    const shortTermRentDailyFee = globalShortTermRentData?.dailyShortTermRentPrice || '';
    const shortTermRentWeeklyFee = globalShortTermRentData?.weeklyShortTermRentPrice || '';
    const shortTermRentMonthlyFee = globalShortTermRentData?.monthlyShortTermRentPrice || '';
    const shortTermRentMinimumStay = globalShortTermRentData?.minimumStay || '';
    const shortTermRentGuestsAmount = globalShortTermRentData?.numberOfGuests || '';

    //Features data
    const numberOfRooms = $w("#roomsNumberDropdown").value;
    const numberOfBathrooms = $w("#bathroomNumbersDropdown").value;
    const numberOfHalfBathrooms = $w("#halfBathroomsNumberDropdown").value;
    const constructionSize = $w("#constructionAreaInputTextBox").value;

    const lotSize = $w("#lotSizeInputTextBox").value;
    const frontOfTheLotSize = $w("#frontSizeInputTextBox").value;
    const lenghtOfTheLotSize = $w("#lengthSizeInputTextBox").value;
    const yearOfConstruction = $w("#yearOfConstructionDropdown").value;
    const floorLevel = $w("#apartmentFloorLevelDropdwon").value;
    const monthlyMaintenanceFee = $w("#monthlyMaintenanceFeeInput").value;
    const numberOfFloors = $w("#numberOfLevelsInTheBuildingDropdown").value;
    const houseCode = $w("#houseCodeInputTextBox").value;
    const keyCode = $w("#keyCodeInputTextBox").value;

    //Location of the property
    const country = $w("#countryDropdown").value;
    const state = $w("#stateDropdown").value;
    const city = $w("#cityDropdown").value;
    const suburbName = $w("#suburbNameDropdown").value;
    const addressLocation = $w("#propertyAddressLocationInput").value;

    // Get selected amenities from the checkbox group
    const selectedAmenities = $w('#amenitiesChecboxGroup').value;

    // Ensure that selectedAmenities is an array of strings
    if (!Array.isArray(selectedAmenities)) {
        console.error('Selected amenities are not an array:', selectedAmenities);
        return;
    }
    // Get selected amenities from the checkbox group-----------

    // Get selected amenities from the checkbox group-----------
    let propertyMainImage = $w("#selectedImage").src;

    // Build the toInsert object with lightbox data and other property details
    const toInsert = {
        propertyId,
        adTitle,
        typeOfProperty,
        propertyDescription,
        propertyPhotosGallery: galleryItems, // Ensure this is defined elsewhere in your code
        propertyMainImage,
        salePrice,
        salePriceBasedOn,
        saleCommissionType,
        saleCommissionAmount,
        rentPrice,
        rentPriceBasedOn,
        rentCommissionType,
        rentCommissionAmount,
        shortTermRentDailyFee,
        shortTermRentWeeklyFee,
        shortTermRentMonthlyFee,
        shortTermRentMinimumStay,
        shortTermRentGuestsAmount,
        numberOfRooms,
        numberOfBathrooms,
        numberOfHalfBathrooms,
        constructionSize,
        lotSize,
        frontOfTheLotSize,
        lenghtOfTheLotSize,
        yearOfConstruction,
        floorLevel,
        monthlyMaintenanceFee,
        numberOfFloors,
        houseCode,
        keyCode,
        country,
        state,
        city,
        suburbName,
        addressLocation,
        amenities: selectedAmenities,
        //shareCommission,
    };

    try {
        // Insert the data into the ElysiumProperties dataset
        await wixData.insert("ElysiumProperties", toInsert);
        console.log("Data inserted successfully");

        // After successful registration, redirect the user to another page (e.g., a "success" page)
        wixLocation.to(`/ely-datasheet?propertyId=${propertyId}`); // Change "/property-success" to the actual page URL or slug

        // Optionally handle file deletion or other tasks after successful data insertion
        const fileUrls = deletedItems.map((item) => item.src); // Ensure deletedItems is defined
        await deleteUnusedFiles(fileUrls);
    } catch (error) {
        console.error("Error inserting data into the dataset:", error);
    }

}

export function createPropertyId() {
    const id = uuidv4();
    const shortenedId = id.substring(0, 5);
    return "ELY-" + shortenedId.toUpperCase(); //id.toString();

}
//-------------------------

//*********************************************/
export async function uploadPhotoButton_change(event) {

    uploadedFiles = await $w("#uploadPhotoButton").uploadFiles();
    console.log("uploadedFiles", uploadedFiles);
    galleryItems = uploadedFiles.map((file) => ({

        title: file.originalFileName,
        src: file.fileUrl,
        type: "image",

    }))
    console.log("galleryItems", galleryItems);

    $w("#uploadedPhotosGallery").items = galleryItems;

}

export function moveBackButton_click(event) {

    if (selectedImageIndex === 0) return;

    const selectedImage = galleryItems[selectedImageIndex];
    const previousItem = galleryItems[selectedImageIndex - 1];

    const tempGalleryItems = [...galleryItems];

    tempGalleryItems[selectedImageIndex - 1] = selectedImage;
    tempGalleryItems[selectedImageIndex] = previousItem;
    selectedImageIndex = selectedImageIndex - 1;

    galleryItems = tempGalleryItems;
    $w("#uploadedPhotosGallery").items = galleryItems;
}

export function moveForwardButton_click(event) {

    if (selectedImageIndex === 0) return;

    const selectedImage = galleryItems[selectedImageIndex];
    const previousItem = galleryItems[selectedImageIndex + 1];

    const tempGalleryItems = [...galleryItems];

    tempGalleryItems[selectedImageIndex + 1] = selectedImage;
    tempGalleryItems[selectedImageIndex] = previousItem;
    selectedImageIndex = selectedImageIndex + 1;

    galleryItems = tempGalleryItems;
    $w("#uploadedPhotosGallery").items = galleryItems;
}

export function deletePhotosButton_click(event) {
    const itemToDelete = galleryItems.splice(selectedImageIndex, 1);
    deletedItems.push(itemToDelete[0]);
    $w("#uploadedPhotosGallery").items = galleryItems;
    $w("#selectedImage").src = null;
}

//*********************************************/

/************Area Surface Validation *********************/
// Suffixes for units (squared and linear)
const suffixes = {
    squareMeters: ' m²',
    squareFeet: ' ft²',
    acres: ' acres',
    hectares: ' ha',
    meters: ' m',
    feet: ' ft'
};

// Handle unit selection and enable the input field
function handleUnitSelection(dropdownId, inputId, isSquaredUnit) {
    let unitSelected = $w(`#${dropdownId}`).value; // Get selected unit

    if (unitSelected) {
        $w(`#${inputId}`).enable(); // Enable the input field
        $w(`#${inputId}`).value = ''; // Clear input field when new unit is selected
        $w(`#${inputId}`).required = true; // Make input required
    } else {
        // Disable and reset input field if no unit selected
        $w(`#${inputId}`).disable();
        $w(`#${inputId}`).value = '';
        $w(`#${inputId}`).required = false;
    }
}

// Validate input to ensure correct format
function validateInput(inputId) {
    let inputValue = $w(`#${inputId}`).value;

    // Regex to allow only numbers with up to two decimal places
    let numberRegex = /^\d*\.?\d{0,2}$/;

    // Change border color based on validation
    if (inputValue.trim() === '' || !numberRegex.test(inputValue)) {
        $w(`#${inputId}`).style.borderColor = "red"; // Show red border for invalid input
    } else {
        $w(`#${inputId}`).style.borderColor = "green"; // Show green border for valid input
    }
}

// Format number with thousand separators
function formatNumber(value) {
    let parts = value.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

// Update input with formatted value and suffix
function updateAreaInput(dropdownId, inputId) {
    let inputValue = $w(`#${inputId}`).value;
    let unitSelected = $w(`#${dropdownId}`).value; // Get the selected unit

    // Get the appropriate suffix (both squared and linear units)
    let suffix = suffixes[unitSelected] || '';

    // Remove any existing suffix in the input field
    inputValue = inputValue.replace(/ m²| ft²| acres| ha| m| ft/g, '').trim();

    // Regex to allow only numbers with up to two decimal places
    let numberRegex = /^\d*\.?\d{0,2}$/;

    // Format number and add suffix if input is valid
    if (numberRegex.test(inputValue)) {
        let formattedInput = formatNumber(inputValue);
        $w(`#${inputId}`).value = formattedInput + suffix; // Append suffix (squared or linear units)
        $w(`#${inputId}`).style.borderColor = "green"; // Valid input
    } else {
        $w(`#${inputId}`).style.borderColor = "red"; // Invalid input
        $w(`#${inputId}`).value = ''; // Clear input if invalid
    }
}

/************************************************************************************/

/************SHORT TIME RENT BUTTON & EXTRAS********************/
export function shorTimeRentButton_click(event) {
    // Log a message to check if the button click is working
    console.log("Button clicked, attempting to open lightbox");

    // Open the lightbox and handle the received data
    wixWindow.openLightbox('Short Term Rent Info').then((saleData) => {
        console.log("Lightbox opened, data received:") //, saleData); // Log to check if lightbox opened
        /*if (saleData) {
            // Display the received sale price in the salePriceTestText text element
            $w('#salePriceTestText').text = saleData.salePrice || ''; // Display sale price

            // Display the received sale price in the salePriceTestText text element
            $w('#salePricedBasedOnTestText').text = saleData.salePriceBaseOn || ''; // Display sale price

            // Display the received commission info in the saleCommissionInfoTestText text element
            $w('#saleCommissionInfoTestText').text = saleData.commission || ''; // Display commission
        }
    }).catch((error) => {
        console.error("Error opening lightbox:", error); // Log any errors*/
    });
}

/*Go to the Features Section Button*/
export function nextButton1_click(event) {

    // Expand the next section
    $w("#featuresSection").show();
    $w("#featuresSection").expand();

    // Collapse and hide the general data section
    $w("#generalDataSection").collapse();
    $w("#generalDataSection").hide();

}

/*******************************************n********************************/
/***************************Location section********************************/
/*******************************************n********************************/
// Function to update the Google Maps with the address
/*function updateMapWithAddress(address) {
    // Ensure the Google Maps tool is available and update it with the address
    $w('#propertyMap').location = {
        address: address
    };

    console.log('Map updated with address:', address);
}*/

/*******************************************n********************************/
/***************************END OF Location section**************************/
/*******************************************n********************************/

export function nextButton2_click(event) {

    $w("#locationSection").show();
    $w("#locationSection").expand();

    //********** */
    $w("#featuresSection").collapse();
    $w("#featuresSection").hide();

}

export function nextButton3_click(event) {
    $w("#amenitiesSection").show();
    $w("#amenitiesSection").expand();

    //********** */
    $w("#locationSection").collapse();
    $w("#locationSection").hide();
}

/*********************************/

export function nextButton4_click(event) {
    $w("#uploadsGallery").show();
    $w("#uploadsGallery").expand();

    //********** */
    $w("#amenitiesSection").collapse();
    $w("#amenitiesSection").hide();
}

export function nextButton5_click(event) {

    // Get the current number of items in the gallery
    let currentPhotoGallery = $w("#uploadedPhotosGallery").items;

    // Debugging: log the initial and current gallery counts
    console.log("Initial photo count:", initialPhotoCount);
    console.log("Current photo count:", currentPhotoGallery.length);

    // Check if the current gallery has more items than the initial count (3)
    if (currentPhotoGallery.length > initialPhotoCount) {
        // User added new photos, proceed to the next sections
        $w("#commsionSection").show();
        $w("#commsionSection").expand();
        $w("#submitInfoSection").show();
        $w("#submitInfoSection").expand();

        // Hide the uploads gallery section
        $w("#uploadsGallery").collapse();
        $w("#uploadsGallery").hide();

        // Hide the error message
        $w("#noPhotosErrorMessageText").hide();
        $w("#noPhotosErrorMessageText").text = '';
    } else {
        // No new photos added, show the error message
        $w("#noPhotosErrorMessageText").show();
        $w("#noPhotosErrorMessageText").text = 'Antes de continuar, ingresa más fotos y/o videos de la propiedad';
    }

}

//---- Ad title input change--------
$w('#typeOfPropertiesDropdown').onChange((event) => {

    let typeOfProperty = $w("#typeOfPropertiesDropdown").value;

    $w("#adTitleInputText").enable();
    $w("#adTitleInputText").required = true;

    if (typeOfProperty === "Terreno Industrial" || typeOfProperty === "Nave Industrial" || typeOfProperty === "Bodega Industrial") {

        $w("#lotSizeDropdown").enable();
        $w("#lotSizeInputTextBox").enable();
        $w("#frontSizeDropdown").enable();
        $w("#frontSizeInputTextBox").enable();
        $w("#lengthSizeDropdown").enable();
        $w("#lengthSizeInputTextBox").enable();
        $w("#maintenanceCurrencyDropdown").enable();
        $w("#monthlyMaintenanceFeeInput").enable();
        //button
        $w("#nextButton2").enable();

    }

    if (typeOfProperty === "Terreno Comercial" || typeOfProperty === "Huerta" || typeOfProperty === "Edifcio") {

        $w("#lotSizeDropdown").enable();
        $w("#lotSizeInputTextBox").enable();
        $w("#frontSizeDropdown").enable();
        $w("#frontSizeInputTextBox").enable();
        $w("#lengthSizeDropdown").enable();
        $w("#lengthSizeInputTextBox").enable();
        $w("#maintenanceCurrencyDropdown").enable();
        $w("#monthlyMaintenanceFeeInput").enable();
        //button
        $w("#nextButton2").enable();

    }

    if (typeOfProperty === "Oficina" || typeOfProperty === "Local Comercial" || typeOfProperty === "Local en Centro Comercial" || typeOfProperty === "Local en Centro Comercial" || typeOfProperty === "Bodega comercial") {

        $w("#bathroomNumbersDropdown").enable();
        $w("#halfBathroomsNumberDropdown").enable();
        $w("#constructionSizeDropdown").enable();
        $w("#constructionAreaInputTextBox").enable();
        $w("#lotSizeDropdown").enable();
        $w("#lotSizeInputTextBox").enable();
        $w("#frontSizeDropdown").enable();
        $w("#frontSizeInputTextBox").enable();
        $w("#lengthSizeDropdown").enable();
        $w("#lengthSizeInputTextBox").enable();
        $w("#yearOfConstructionDropdown").enable();
        $w("#maintenanceCurrencyDropdown").enable();
        $w("#monthlyMaintenanceFeeInput").enable();
        $w("#houseCodeInputTextBox").enable();
        $w("#keyCodeInputTextBox").enable();
        //button
        $w("#nextButton2").enable();

    }

    if (typeOfProperty === "Casa" || typeOfProperty === "Casa en condominio" || typeOfProperty === "Villa" || typeOfProperty === "Casa con uso de suelo comercial") {

        $w("#roomsNumberDropdown").enable();
        $w("#bathroomNumbersDropdown").enable();
        $w("#halfBathroomsNumberDropdown").enable();
        $w("#constructionSizeDropdown").enable();
        $w("#constructionAreaInputTextBox").enable();
        $w("#lotSizeDropdown").enable();
        $w("#lotSizeInputTextBox").enable();
        $w("#frontSizeDropdown").enable();
        $w("#frontSizeInputTextBox").enable();
        $w("#lengthSizeDropdown").enable();
        $w("#lengthSizeInputTextBox").enable();
        $w("#yearOfConstructionDropdown").enable();
        $w("#maintenanceCurrencyDropdown").enable();
        $w("#monthlyMaintenanceFeeInput").enable();
        $w("#houseCodeInputTextBox").enable();
        $w("#keyCodeInputTextBox").enable();
        //button
        $w("#nextButton2").enable();

    }

    if (typeOfProperty === "Departamento") {

        $w("#roomsNumberDropdown").enable();
        $w("#bathroomNumbersDropdown").enable();
        $w("#halfBathroomsNumberDropdown").enable();
        $w("#constructionSizeDropdown").enable();
        $w("#constructionAreaInputTextBox").enable();
        $w("#apartmentFloorLevelDropdwon").enable();
        $w("#yearOfConstructionDropdown").enable();
        $w("#numberOfLevelsInTheBuildingDropdown").enable();
        $w("#maintenanceCurrencyDropdown").enable();
        $w("#monthlyMaintenanceFeeInput").enable();
        $w("#houseCodeInputTextBox").enable();
        $w("#keyCodeInputTextBox").enable();
        //button
        $w("#nextButton2").enable();
    }

})
//---- Type of Property Validation --------

//---- Ad title input change--------
$w('#adTitleInputText').onChange((event) => {

    $w("#propertyDescriptionTextBox").enable();
    $w("#propertyDescriptionTextBox").required = true;

})
//---- Ad title input change--------

//---- Ad title input change--------
$w('#propertyDescriptionTextBox').onChange((event) => {

    $w("#saleDatatButton").enable();
    $w("#rentInfoButton").enable();
    $w("#shorTimeRentButton").enable();

})
//---- Ad title input change--------

/*****Share commission section******/
$w('#yesShareCommissionButton').onClick((event) => {

    $w("#shareCommissionsConditionsText").enable();

})

$w('#noShareCommissionButton').onClick((event) => {

    $w("#shareCommissionsConditionsText").value = '';
    $w("#shareCommissionsConditionsText").disable();

})

/*****Share commission section******/

$w('#maintenanceCurrencyDropdown').onChange((event) => {
    $w("#maintenanceCurrencyDropdown").enable();
})