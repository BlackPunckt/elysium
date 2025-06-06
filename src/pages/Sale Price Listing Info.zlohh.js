import wixWindow from 'wix-window';

$w.onReady(function () {

    // Format the sale price when the user is typing
    $w('#salePriceInputTextBox').onInput(() => {
        formatSalePriceInput();
    });

    // Format and send the data when the user leaves the input field
    $w('#salePriceInputTextBox').onBlur(() => {
        formatSalePriceInput();
        //sendFormattedDataToMainPage();
    });

    $w('#saleCommisionAmountInput').onBlur(() => handleCommissionInput()); // Validate when input loses focus
    $w('#saleAgencyCommisionDropdown').onChange(() => {
        handleCommissionTypeChange(); // Clear input when switching types
        handleCommissionInput(); // Validate on dropdown change
    });
});


export function saleSwitchButton_change(event) {

	const saleToglleOn = $w("#saleSwitchButton").checked;

    if (saleToglleOn) {

        $w("#saleCurrencyDropdown").enable();
         

        //Required
        $w("#salePriceInputTextBox").required = true;

    } else {
        $w("#salePriceInputTextBox").disable();
        //$w("#saleCurrencyDropdown").disable();
        $w("#salePriceBaseOnRadioGroup").disable();
        $w("#saleAgencyCommisionDropdown").disable();
        $w("#saleCommisionAmountInput").disable();

        //Not Required
        $w("#salePriceInputTextBox").required = false;
        $w("#saleCurrencyDropdown").required = false;
        $w("#salePriceBaseOnRadioGroup").required = false;
        $w("#saleAgencyCommisionDropdown").required = false;
        $w("#saleCommisionAmountInput").required = false;

    }
}

export function saleCurrencyDropdown_change(event) {

	$w("#salePriceInputTextBox").enable();

}

//*******Price Input change to enable Radio Group Data**********/
$w('#salePriceInputTextBox').onChange((event) => {
   
   $w("#salePriceBaseOnRadioGroup").enable();      
})

//*******Radio group change to enable commisions data input*******/
$w('#salePriceBaseOnRadioGroup').onChange((event) => {

        $w("#saleAgencyCommisionDropdown").enable();
        $w("#saleCommisionAmountInput").enable();
        
})



function formatSalePriceInput() {
    let inputValue = $w('#salePriceInputTextBox').value;

    // Remove all non-numeric characters except for decimal point
    let cleanValue = inputValue.replace(/[^0-9.]/g, '');

    // Split the value into integer and decimal parts
    let parts = cleanValue.split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] ? parts[1].substring(0, 2) : ''; // Limit to 2 decimal places

    // Format the integer part with commas
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Combine integer and decimal parts
    let formattedValue = '$' + integerPart;
    if (decimalPart) {
        formattedValue += '.' + decimalPart;
    }

    // Update the input field value with the formatted result
    $w('#salePriceInputTextBox').value = formattedValue;
}


/*****************SEND SALE BUTTON******************************/
export function sendSaleInfoButton_click(event) {
	//sendFormattedDataToMainPage();

    //Function to send formatted data to the resultTestText TextBox and display it
    //function sendFormattedDataToMainPage() {
    let salePriceValue = $w('#salePriceInputTextBox').value;
    let currencyPrefix = $w('#saleCurrencyDropdown').value;
    
    //priced base on
    let salePriceBasedOn = $w("#salePriceBaseOnRadioGroup").value;
    
    let commissionType = $w("#saleAgencyCommisionDropdown").value;
    let saleCommission = $w("#saleCommisionAmountInput").value;
    
    // Concatenate with the currency Prefix
    let saleFinalPrice = currencyPrefix + ' ' + salePriceValue;

    // Declare the commission variable to be used later
    let saleFinalCommission = '';
    
    // Concatenate with the currency Prefix
    if (commissionType === '% del precio total'){
        
        saleFinalCommission = saleCommission;
        
    }else if (commissionType === 'Cantidad Fija'){

        saleFinalCommission = currencyPrefix + ' ' + saleCommission;

    }

    // Create an object to pass both sale price and commission
    let saleData = {
        salePrice: saleFinalPrice,
        salePriceBasedOn: salePriceBasedOn,
        saleCommissionType: commissionType, 
        saleCommissionAmount: saleFinalCommission,
    };

    // Close the lightbox and send the finalValue to the main page
    wixWindow.lightbox.close(saleData);

}
/*****************END OF SEND SALE BUTTON**********************/




/******Commission Value****************/
// Function to format amount with $ prefix and commas
function formatAmount(amount) {
    let cleanValue = amount.replace(/[^0-9.]/g, ''); // Remove all non-numeric characters except for decimal point
    let parts = cleanValue.split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] ? parts[1].substring(0, 2) : ''; // Limit to 2 decimal places

    // Format the integer part with commas
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Combine integer and decimal parts
    let formattedValue = '$' + integerPart;
    if (decimalPart) {
        formattedValue += '.' + decimalPart;
    }

    return formattedValue;
}

// Function to handle validation and formatting for sale commission amount
function handleCommissionInput() {
    const salePriceInput = $w('#salePriceInputTextBox').value.replace(/[^0-9.]/g, ''); // Clean value from sale price input
    const saleCurrency = $w('#saleCurrencyDropdown').value; // Get currency value
    const cleanValue = parseFloat(salePriceInput) || 0; // Ensure clean numeric value

    const commissionType = $w('#saleAgencyCommisionDropdown').value; // Get selected commission type
    let commissionInput = $w('#saleCommisionAmountInput').value;
    let commissionValue = parseFloat(commissionInput.replace(/[^0-9.]/g, '')) || 0;

    if (commissionType === '% del precio total') {
        if (commissionValue > 10) { // Check if the entered percentage is greater than 10
            $w('#saleCommisionAmountInput').style.borderColor = "red"; // Invalid commission
            $w("#saleCommissionTestText").show();
            $w('#saleCommissionTestText').text = `Error: The commission pertange cannot exceed 10%.`; // Display error message

            // Delay clearing the input for 5 seconds to allow user to read the error message
            setTimeout(() => {
                $w('#saleCommisionAmountInput').value = ''; // Clear input
                $w('#saleCommisionAmountInput').style.borderColor = "#ccc"; // Reset border color
                $w("#saleCommissionTestText").hide();
                $w('#saleCommissionTestText').text = ''; // Hide error message
            }, 5000); // 5000 milliseconds = 5 seconds
        } else {
            $w('#saleCommisionAmountInput').style.borderColor = "green"; // Valid commission
            $w('#saleCommisionAmountInput').value = `${commissionValue}%`; // Show value with percentage suffix
            //$w('#commissionResultTestText').text = `${commissionValue}% of the total sale price`; // Display valid result
        }
    } else if (commissionType === 'Cantidad Fija') {
        const maxFixedAmount = 0.40 * cleanValue; // 40% of the total sale amount

        // Format the input amount with $ sign and commas
        let formattedInputValue = formatAmount(commissionInput);
        let formattedMaxFixedAmount = formatAmount(maxFixedAmount.toFixed(2)); // Format the maximum allowed fixed amount

        if (commissionValue > maxFixedAmount) {
            $w('#saleCommisionAmountInput').style.borderColor = "red"; // Invalid commission
            $w("#saleCommissionTestText").show();
            $w('#saleCommissionTestText').text = `Error: Fixed amount cannot exceed ${formattedMaxFixedAmount}.`; // Display error message

            // Delay clearing the input for 5 seconds to allow user to read the error message
            setTimeout(() => {
                $w('#saleCommisionAmountInput').value = ''; // Clear input
                $w('#saleCommisionAmountInput').style.borderColor = "#ccc"; // Reset border color
                $w("#saleCommissionTestText").hide(); //hides the error message text
                $w('#saleCommissionTestText').text = ''; // Hide error message
            }, 5000); // 5000 milliseconds = 5 seconds
        } else {
            // Valid fixed commission
            $w('#saleCommisionAmountInput').style.borderColor = "green"; // Valid input
            $w('#saleCommisionAmountInput').value = formattedInputValue; // Show formatted amount
            $w('#saleCommissionTestText').text = `${formattedInputValue} ${saleCurrency}`; // Display with currency
        }
    }
}

// Function to handle clearing input and error message when switching commission types
function handleCommissionTypeChange() {
    $w('#saleCommisionAmountInput').value = ''; // Clear the input
    $w('#saleCommisionAmountInput').style.borderColor = "#ccc"; // Reset border color
    $w("#saleCommissionTestText").hide();
    $w('#saleCommissionTestText').text = ''; // Hide error message
}





