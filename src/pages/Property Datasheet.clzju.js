// Import necessary modules in Wix
import wixLocation from 'wix-location';
import { jsPDF } from 'jspdf';
import "jspdf-autotable"; // Import the autoTable plugin
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import { currentMember } from 'wix-members';

/*

$w.onReady(function () {
    console.log("Page is ready");

    // Check if the user is logged in
    if (wixUsers.currentUser.loggedIn) {
        console.log("User is signed in");

        // Example propertyId (you can change this to be dynamic)
        const propertyId = 'ELY-10245'; // Fetch or dynamically get the propertyId

        if (propertyId) {
            // Query the ElysiumProperties dataset for the property with this ID
            wixData.query('ElysiumProperties')
                .eq('propertyId', propertyId)
                .find()
                .then((results) => {
                    if (results.items.length > 0) {
                        // Property data found
                        const property = results.items[0];

                        // Display property data in page elements
                        $w("#propertyIdText").text = property.propertyId;
                        $w('#adTitleText').text = property.adTitle;
                        $w("#propertyDescriptionText").text = property.propertyDescription;
                        $w("#propertyMainImage").src = property.propertyMainImage;

                        // Populate the photosGallery with images from propertyPhotosGallery
                        const images = property.propertyPhotosGallery || []; // Fallback to empty array
                        console.log("Images retrieved:", images); // Log the images

                        // Format the images to fit the photos gallery
                        const formattedImages = images
                            .filter(image => image.src) // Ensure the image has a 'src' property
                            .map(image => {
                                const cleanedUrl = cleanWixImageUrl(image.src); // Use image.src
                                return {
                                    src: cleanedUrl, // Use the cleaned URL
                                    title: "Property Image" // Optional: Set a title for each image
                                };
                            })
                            .filter(img => img.src); // Filter out any null URLs

                        // Set the formatted images to the photosGallery
                        $w("#photosGallery").items = formattedImages;

                        // Retrieve amenities
                        const amenitiesTags = property.amenities || [];
                        console.log("Amenities found:", amenitiesTags);

                        const repeaterData = [];
                        const promises = amenitiesTags.map(amenity => {
                            console.log("Querying PropertyAmenities for amenity:", amenity);

                            return wixData.query('PropertyAmenities')
                                .eq('amenityName', amenity.trim())
                                .find()
                                .then((iconResults) => {
                                    console.log("Icon results for:", amenity, iconResults.items);

                                    if (iconResults.items.length > 0) {
                                        const icon = iconResults.items[0].icon; // Adjust field name if needed
                                        console.log(`Raw icon URL for amenity ${amenity}:`, icon); // Log the raw icon URL

                                        // Check if the icon is null or undefined
                                        if (!icon) {
                                            console.warn(`Icon URL for amenity ${amenity} is null or undefined`);
                                        }

                                        // Clean the icon URL (assuming there's a function for this)
                                        const cleanedIconUrl = cleanWixImageUrl(icon);
                                        console.log(`Cleaned icon URL for amenity ${amenity}:`, cleanedIconUrl);

                                        repeaterData.push({
                                            _id: amenity.replace(/[^A-Za-z0-9-]/g, '-'), // Create a unique ID for the repeater
                                            amenityName: amenity,
                                            iconImage: cleanedIconUrl // Set cleaned icon URL
                                        });
                                        console.log(`Found icon for amenity: ${amenity}, icon URL: ${cleanedIconUrl}`);
                                    } else {
                                        console.log(`No icon found for amenity: ${amenity}`);
                                    }
                                })
                                .catch((err) => {
                                    console.error("Error querying icons:", err);
                                });
                        });

                        // Set repeater data after all promises are resolved
                        Promise.all(promises).then(() => {
                            console.log("Final repeater data:", repeaterData);

                            $w('#amenitiesRepeater').data = repeaterData;

                            $w('#amenitiesRepeater').onItemReady(($item, itemData) => {
                                console.log("Setting repeater item:", itemData);
                                $item('#amenityName').text = itemData.amenityName || 'N/A';
                                $item('#iconImage').src = itemData.iconImage || ''; // Set the icon image source
                            });
                        });
                    }
                })
                .catch((err) => {
                    console.error("Error querying property:", err);
                });
        }
    }
});
//**********************************************/

/*********************Amenities ***************************/

// Function to add amenities to the PDF
function addAmenities(doc) {
    const propertyId = 'ELY-10245'; // Specify the property ID to query
    const amenities = []; // Array to store amenity IDs
    const amenityNames = []; // Array to store amenity names and icons

    // First, query the ElysiumProperties dataset to get the amenities field
    wixData.query('ElysiumProperties')
        .eq('propertyId', propertyId) // Filter by propertyId
        .find() // Execute the query
        .then((propertyResults) => {
            // Check if we found any properties
            if (propertyResults.items.length > 0) {
                const property = propertyResults.items[0]; // Get the first property

                // Check if the amenities field exists and is an array
                if (Array.isArray(property.amenities)) {
                    amenities.push(...property.amenities); // Populate the amenities array
                }
            } else {
                console.log("No property found with the specified ID.");
            }

            console.log("Retrieved amenities from ElysiumProperties:", amenities);

            // Now, query the Property Amenities dataset
            let query = wixData.query('PropertyAmenities'); // Replace with actual dataset name

            // Build query using eq() for each amenity
            amenities.forEach((amenityId, index) => {
                query = index === 0 ? query.eq('amenityId', amenityId) : query.or(query.eq('amenityId', amenityId));
            });

            return query.find(); // Execute the query
        })
        .then((propertyAmenitiesResults) => {
            // Prepare to retrieve amenity names and icons
            propertyAmenitiesResults.items.forEach(item => {
                if (item.amenityName && item.icon) {
                    amenityNames.push({ name: item.amenityName, icon: item.icon });
                }
            });

            console.log("Retrieved amenity names and icons:", amenityNames);

            // Prepare the data for the PDF
            const startY = 130; // Starting Y position for the list
            doc.setFontSize(12);
            doc.setTextColor(0, 51, 102); // Dark blue color
            doc.text("Amenities:", 10, startY);
            let currentY = startY + 10; // Adjust Y position for list items

            // Loop through the amenity names and add them to the PDF
            amenityNames.forEach(amenity => {
                doc.text(`- ${amenity.name}`, 15, currentY);
                currentY += 10; // Increment Y position for the next item
            });

            if (amenityNames.length === 0) {
                doc.text("No amenities available.", 15, currentY); // Notify if no amenities
            }

            console.log("Amenities added to PDF successfully."); // Success log
        })
        .catch((err) => {
            console.error("Error retrieving property or amenity data:", err); // Log any errors
            doc.text("Error retrieving amenities", 10, 130); // Notify in PDF if there was an error
        });
}

/*********************Amenities ***************************/

// Function to generate the PDF with data and footer
function generatePDF() {
    const doc = new jsPDF();

    // Set the document title and add some content
    doc.setFontSize(18);
    doc.text("Property Information", 10, 20);
    doc.setFontSize(12);

    // Add dynamic content from page elements
    doc.text(`Property ID: ${$w("#propertyIdText").text}`, 10, 40);
    doc.text(`Ad Title: ${$w("#adTitleText").text}`, 10, 50);

    // Adjust the description to fit within the page
    const description = $w("#propertyDescriptionText").text;
    const splitDescription = doc.splitTextToSize(description, 180); // Split the text to fit within 180 width
    doc.text(splitDescription, 10, 60);

    // Optionally add an image if available
    const imgSrc = $w("#propertyMainImage").src;
    if (imgSrc) {
        doc.addImage(imgSrc, 'JPEG', 10, 70, 60, 40); // Adjust size and positioning
    }

    // Add property amenites in a 5-column table
    addAmenities(doc);

    // Add property images in a 2-column table
    addImagesToPDF(doc);

    // Call the footer function to add the footer design
    addFooterToPDF(doc);

    // Save the generated PDF as a Blob and create a URL
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Log the Blob and URL for debugging
    console.log("PDF Blob created:", pdfBlob); // Log the Blob
    console.log("PDF URL generated:", pdfUrl); // Log the URL

    // Navigate to the PDF display page and pass the URL as a query parameter
    console.log("Navigating to PDF display page...");
    wixLocation.to(`/pdf-viewer-09?pdfUrl=${encodeURIComponent(pdfUrl)}`);

}

// Function to clean the Wix image URLs that comes into de page through onReady
function cleanWixImageUrl(wixImageUrl) {

    console.log("Original Wix Image URL:", wixImageUrl); // Log the original URL

    // Check if the URL starts with 'wix:image://'
    if (typeof wixImageUrl === 'string' && wixImageUrl.includes('wix:image://')) {
        const urlWithoutPrefix = wixImageUrl.split('wix:image://')[1]; // Remove the 'wix:image://' prefix
        console.log("URL without prefix:", urlWithoutPrefix); // Log the URL without prefix

        const staticUrl = `https://static.wixstatic.com/media/${urlWithoutPrefix}`;
        const cleanedUrl = staticUrl.replace(/\/v1/, ''); // Remove '/v1' if it exists
        console.log("Cleaned URL:", cleanedUrl); // Log the static URL

        // Ensure it returns .jpg or .png
        const extensionMatch = cleanedUrl.match(/\.jpe?g|\.png/);

        if (extensionMatch) {
            const finalUrl = cleanedUrl.substring(0, extensionMatch.index + extensionMatch[0].length);
            console.log("Final cleaned URL:", finalUrl); // Log the final cleaned URL
            return finalUrl;
        } else {
            console.warn("No valid image extension found in URL:", cleanedUrl); // Warn if no valid extension found
        }
    }

    // If it's already a static URL, return it as is
    if (typeof wixImageUrl === 'string' && wixImageUrl.startsWith('https://static.wixstatic.com/media/')) {
        return wixImageUrl; // Return static URL as is
    }

    console.warn("Invalid URL format:", wixImageUrl); // Warn about invalid URL format
    return null; // Return null for invalid URLs

}

//************************WORKING CODE ************************************/
// Function to add images to the PDF in a table layout (3 columns, 5 rows) on the second page with rounded corners
function addImagesToPDF(doc) {
    // Add a new page for the images
    doc.addPage();

    // Set the title for the photos gallery
    doc.setFontSize(16);
    doc.text("Photos Gallery | Galería de Fotos", 20, 20); // Adjusted position for the title
    doc.setFontSize(12); // Reset font size for the images

    // Retrieve items from the gallery
    const images = $w("#photosGallery").items;
    console.log("Retrieved images:", images); // Log the retrieved items

    // Format the images to fit the photos gallery and clean URLs
    const formattedImages = images
        .filter(image => image.src) // Ensure the image has a 'src' property
        .map(image => {
            const cleanedUrl = cleanGalleryImageUrl(image.src); // Use the new cleanGalleryImageUrl function
            console.log("Cleaned image URL:", cleanedUrl); // Log each cleaned image URL
            return {
                title: "Property Image", // Optional: Set a title for each image
                src: cleanedUrl, // Use the cleaned URL
            };
        })
        .filter(img => img.src); // Filter out any null URLs

    // Table layout configuration
    const startX = 20; // Starting X position (adjusted for page margin)
    let startY = 40; // Starting Y position (adjusted for page margin to allow space for the title)
    const imgWidth = 50; // Width of each image (adjusted)
    const imgHeight = 35; // Height of each image (adjusted)
    const cols = 3; // Number of columns
    const rows = 5; // Number of rows
    const spacingX = 8; // Horizontal space between images
    const spacingY = 10; // Vertical space between images
    const cornerRadius = 5; // Radius for rounded corners

    for (let i = 0; i < formattedImages.length; i++) {
        const imgUrl = formattedImages[i].src; // Get the cleaned URL
        const x = startX + (i % cols) * (imgWidth + spacingX); // Calculate X position for the current image (with spacing)
        const y = startY + Math.floor(i / cols) * (imgHeight + spacingY); // Calculate Y position for the current image (with spacing)

        if (imgUrl) {
            console.log(`Adding image at ${x}, ${y}: ${imgUrl}`); // Log the image position and URL

            // Clip to create rounded corners before adding the image
            doc.roundedRect(x, y, imgWidth, imgHeight, cornerRadius, cornerRadius); // Define rounded rectangle

            // Add the image within the clipped area
            doc.addImage(imgUrl, 'JPEG', x, y, imgWidth, imgHeight); // Add the image to the PDF
        }

        // If we reach the limit of images per page (3 columns x 5 rows), add a new page
        if ((i + 1) % (cols * rows) === 0) {
            doc.addPage(); // Add a new page if needed
            startY = 20; // Reset Y position for the new page
        }
    }
}

// New function to clean Wix image URLs specifically for the photo gallery
function cleanGalleryImageUrl(url) {
    if (!url) return '';

    // The base URL for Wix images
    const wixMediaUrl = "https://static.wixstatic.com/media/";

    // Remove any duplicate 'https://static.wixstatic.com/media/' from the URL
    if (url.includes(wixMediaUrl)) {
        const parts = url.split(wixMediaUrl);
        url = wixMediaUrl + parts[parts.length - 1]; // Reconstruct the URL without duplication
    }

    // Use regex to remove any suffix after the image extension (jpg, png, jpeg, etc.)
    return url.replace(/(\.jpg|\.png|\.jpeg).*/i, '$1');
}

// Function to design and add the footer to the PDF
function addFooterToPDF(doc) {
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Add a line separator above the footer
        doc.setDrawColor(0, 0, 0);
        doc.line(10, 280, 200, 280); // Adjust positioning for the line

        // Add footer text (page number and company information)
        doc.setFontSize(10);

        // Get the width of the page for positioning
        const pageWidth = doc.internal.pageSize.getWidth(); // Correct method to get page width

        // Right-align the page number in the bottom right corner
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, 290); // Page number in the bottom right

        doc.text('Elysium Luxury Real Estate | www.elysium.mx | contact@elysium.mx', 100, 290, { align: 'center' });
    }
}
//************************WORKING CODE ************************************/

$w('#generatePDFButton').onClick((event) => {

    generatePDF();

})

$w('#multistateButtonBox1').onClick((event) => {
    
        $w("#myMultistateBox1").changeState("Open");
    

})

$w('#multistateButtonBox2').onClick((event) => {

    $w("#myMultistateBox1").changeState("Closed");
    
})

$w('#button3').onClick((event) => {
    $w("#box19").show();    
})

$w('#button3').onDblClick((event) => {
    $w("#box19").hide();
})