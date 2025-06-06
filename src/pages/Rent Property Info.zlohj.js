import wixWindow from 'wix-window';

$w.onReady(function () {

    // Format the sale price when the user is typing
    $w('#rentPriceInputTextBox').onInput(() => {
        formatRentPriceInput();
    });

    // Format and send the data when the user leaves the input field
    $w('#rentPriceInputTextBox').onBlur(() => {
        formatRentPriceInput();
        //sendFormattedDataToMainPage();
    });

    $w('#rentCommisionAmountInput').onBlur(() => handleCommissionInput()); // Validate when input loses focus
    $w('#rentAgencyCommisionDropdown').onChange(() => {
        handleCommissionTypeChange(); // Clear input when switching types
        handleCommissionInput(); // Validate on dropdown change
    });

});

export function rentSwitchButton_change(event) {

    const rentToglleOn = $w("#rentSwitchButton").checked;

    if (rentToglleOn) {

        $w("#rentCurrencyDropdown").enable();

    } else {
        $w("#rentPriceInputTextBox").disable();
        $w("#rentCurrencyDropdown").disable();
        $w("#rentPriceBasedOnRadioGroup").disable();
        $w("#rentAgencyCommisionDropdown").disable();
        $w("#rentCommisionAmountInput").disable();
    }
}

export function rentCurrencyDropdown_change(event) {

    $w("#rentPriceInputTextBox").enable();

}

$w('#rentPriceInputTextBox').onChange((event) => {

    $w("#rentPriceBasedOnRadioGroup").enable();

})

$w('#rentPriceBasedOnRadioGroup').onChange((event) => {
    $w("#rentAgencyCommisionDropdown").enable();
    $w("#rentCommisionAmountInput").enable();
})

function formatRentPriceInput() {
    let inputValue = $w('#rentPriceInputTextBox').value;

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
    $w('#rentPriceInputTextBox').value = formattedValue;

}

/**********Send Rent Button**********/
export function sendRentPriceInfo_click(event) {
    //sendFormattedDataToMainPage();

    //Function to send formatted data to the resultTestText TextBox and display it
    //function sendFormattedDataToMainPage() {
    let rentPriceValue = $w('#rentPriceInputTextBox').value;
    let currencyPrefix = $w('#rentCurrencyDropdown').value;

    //priced base on
    let rentPricedBasedOn = $w("#rentPriceBasedOnRadioGroup").value;

    let rentCommissionType = $w("#rentAgencyCommisionDropdown").value;
    let rentCommission = $w("#rentCommisionAmountInput").value;

    // Concatenate with the currency Prefix
    let rentFinalPrice = currencyPrefix + ' ' + rentPriceValue;

    // Declare the commission variable to be used later
    let rentFinalCommission = '';

    // Concatenate with the currency Prefix
    if (rentCommissionType === '% del precio total') {

        rentFinalCommission = rentCommission;

    } else if (rentCommissionType === 'Cantidad Fija') {

        rentFinalCommission = currencyPrefix + ' ' + rentCommission;

    }

    // Create an object to pass both sale price and commission
    let rentData = {
        rentPrice: rentFinalPrice,
        rentPriceBasedOn: rentPricedBasedOn,
        rentCommissionType: rentCommissionType,
        rentCommissionAmount: rentFinalCommission,
    };

    // Close the lightbox and send the finalValue to the main page
    wixWindow.lightbox.close(rentData);
}

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

// Function to handle validation and formatting for rent commission amount
function handleCommissionInput() {
    const rentPriceInput = $w('#rentPriceInputTextBox').value.replace(/[^0-9.]/g, '');
    //const rentCurrency = $w('#rentCurrencyDropdown').value;
    const cleanValue = parseFloat(rentPriceInput) || 0;

    const commissionType = $w('#rentAgencyCommisionDropdown').value;
    let rentCommissionInput = $w('#rentCommisionAmountInput').value;
    let rentCommissionValue = parseFloat(rentCommissionInput.replace(/[^0-9.]/g, '')) || 0;

    if (commissionType === '% del precio total') {
        // Format the percentage with the '%' symbol if the input is valid
        if (rentCommissionValue > 10) {
            $w('#rentCommisionAmountInput').style.borderColor = "red";
            $w("#rentCommissionErrorText").show();
            $w('#rentCommissionErrorText').text = `Error: La comisión no puede exceder el 10%.`;

            setTimeout(() => {
                $w('#rentCommisionAmountInput').value = '';
                $w('#rentCommisionAmountInput').style.borderColor = "#ccc";
                $w("#rentCommissionErrorText").hide();
                $w('#rentCommissionErrorText').text = '';
            }, 5000);
        } else {
            // Valid percentage, display with % symbol
            $w('#rentCommisionAmountInput').style.borderColor = "green";
            $w('#rentCommisionAmountInput').value = `${rentCommissionValue}%`; // Display formatted percentage
            $w("#rentCommissionErrorText").hide(); // Hide error text
        }
    } else if (commissionType === 'Cantidad Fija') {
        const maxFixedAmount = 0.15 * cleanValue;

        // Format the input amount with $ sign and commas
        let formattedInputValue = formatAmount(rentCommissionInput);
        let formattedMaxFixedAmount = formatAmount(maxFixedAmount.toFixed(2));

        if (rentCommissionValue > maxFixedAmount) {
            $w('#rentCommisionAmountInput').style.borderColor = "red";
            $w("#rentCommissionErrorText").show();
            $w('#rentCommissionErrorText').text = `Error: La cantidad no puede exceder el 15% o ${formattedMaxFixedAmount}.`;

            setTimeout(() => {
                $w('#rentCommisionAmountInput').value = '';
                $w('#rentCommisionAmountInput').style.borderColor = "#ccc";
                $w("#rentCommissionErrorText").hide();
                $w('#rentCommissionErrorText').text = '';
            }, 5000);
        } else {
            // Valid fixed commission, format it with $ and commas
            $w('#rentCommisionAmountInput').style.borderColor = "green";
            $w('#rentCommisionAmountInput').value = formattedInputValue; // Display formatted amount with $
            $w('#rentCommissionErrorText').hide(); // Hide error message
        }
    }
}

// Function to handle clearing input and error message when switching commission types
function handleCommissionTypeChange() {
    $w('#rentCommisionAmountInput').value = ''; // Clear the input
    $w('#rentCommisionAmountInput').style.borderColor = "#ccc"; // Reset border color
    $w("#rentCommissionErrorText").hide(); // Hide error text
    $w('#rentCommissionErrorText').text = ''; // Clear error message
}