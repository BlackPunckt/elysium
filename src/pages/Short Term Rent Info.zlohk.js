import wixWindow from 'wix-window';

$w.onReady(function () {

    // Attach an onInput event to the dailyFeesAmountInputTextBox
    $w('#dailyFeesAmountInputTextBox').onInput(() => {
        formatAmountInput($w('#dailyFeesAmountInputTextBox'));
    });

    // Attach onInput event to weeklyFeesAmountInputTextBox
    $w('#weeklyFeesAmountInputTextBox').onInput(() => {
        formatAmountInput($w('#weeklyFeesAmountInputTextBox'));
    });

    // Attach onInput event to monthlyFeesAmountInputTextBox
    $w('#monthlyFeesAmountInputTextBox').onInput(() => {
        formatAmountInput($w('#monthlyFeesAmountInputTextBox'));
    });

    $w('#shortRentMinimumStayInput').onInput(() => {
        formatAndValidateStayInput($w('#shortRentMinimumStayInput'));
    });

    $w('#shortTimeRentGuestAmountInput').onInput(() => {
        formatAndValidateGuestInput($w('#shortTimeRentGuestAmountInput'));
    });

});

export function shortRentTimeSwitch_change(event) {

    const shortTermRentToglleOn = $w("#shortRentTimeSwitch").checked;

    if (shortTermRentToglleOn) {

        $w("#shortRentCurrencyDropdown").enable();

        //Required
        $w("#shortRentCurrencyDropdown").required = true;

    } else {
        $w("#shortRentCurrencyDropdown").disable();
        $w("#dailyFeesAmountInputTextBox").disable();
        $w("#weeklyFeesAmountInputTextBox").disable();
        $w("#monthlyFeesAmountInputTextBox").disable();
        $w("#shortRentMinimumStayInput").disable();
        $w("#shortTimeRentGuestAmountInput").disable();
        $w("#shortTermRentSendInfoButton").disable();

        //Not Required
        $w("#shortRentCurrencyDropdown").required = false;
        $w("#dailyFeesAmountInputTextBox").required = false;
        $w("#weeklyFeesAmountInputTextBox").required = false;
        $w("#monthlyFeesAmountInputTextBox").required = false;
        $w("#shortRentMinimumStayInput").required = false;
        $w("#shortTimeRentGuestAmountInput").required = false;

    }

}

$w('#shortRentCurrencyDropdown').onChange((event) => {

    $w("#dailyFeesAmountInputTextBox").enable();
    $w("#weeklyFeesAmountInputTextBox").enable();
    $w("#monthlyFeesAmountInputTextBox").enable();
    $w("#shortRentMinimumStayInput").enable();
    $w("#shortTimeRentGuestAmountInput").enable();
    $w("#shortTermRentSendInfoButton").enable();

})

/**************Send data button******************/

export function shortTermRentSendInfoButton_click(event) {
    // Format and validate inputs
    formatAmountInput($w('#dailyFeesAmountInputTextBox'));
    formatAmountInput($w('#weeklyFeesAmountInputTextBox'));
    formatAmountInput($w('#monthlyFeesAmountInputTextBox'));
    formatAndValidateStayInput($w('#shortRentMinimumStayInput'));
    formatAndValidateGuestInput($w('#shortTimeRentGuestAmountInput'));

    validateFees();
    validateStayAndGuestInputs();

    //sendFormattedDataToMainPage();
    //function sendFormattedDataToMainPage() 
    //daily fee
    let dailyShortTermRentPriceValue = $w('#dailyFeesAmountInputTextBox').value;
    let shortTermRentCurrencyPrefix = $w('#shortRentCurrencyDropdown').value;

    //weekly fee
    let weeklyShortTermRentPriceValue = $w('#weeklyFeesAmountInputTextBox').value;

    //monthly fee
    let monthlyShortTermRentPriceValue = $w('#monthlyFeesAmountInputTextBox').value;

    // Concatenate the daily fee with the currency Prefix
    let dailyFeeFinalPrice = shortTermRentCurrencyPrefix + ' ' + dailyShortTermRentPriceValue;

    // Concatenate the weekly fee with the currency Prefix
    let weeklyFeeFinalPrice = shortTermRentCurrencyPrefix + ' ' + weeklyShortTermRentPriceValue;

    // Concatenate the monthly fee with the currency Prefix
    let monthlyFeeFinalPrice = shortTermRentCurrencyPrefix + ' ' + monthlyShortTermRentPriceValue;

    // Declare the minimum nights ti stay
    let minumumDaysToStay = $w("#shortRentMinimumStayInput").value + ' ' + "noches";

    // Declare the minimum nights ti stay
    let numberOfGuests = $w("#shortTimeRentGuestAmountInput").value + ' ' + "personas";

    // Create an object to pass both sale price and commission
    let shortTermRentData = {
        dailyShortTermRentPrice: dailyFeeFinalPrice,
        weeklyShortTermRentPrice: weeklyFeeFinalPrice,
        monthlyShortTermRentPrice: monthlyFeeFinalPrice,
        minimumStay: minumumDaysToStay,
        numberOfGuests: numberOfGuests,
    };

    // Close the lightbox and send the finalValue to the main page
    wixWindow.lightbox.close(shortTermRentData);

}

/**************Send data button******************/

//************************************** */

// Function to format the input with $ prefix and commas
function formatAmountInput(inputElement) {
    let inputValue = inputElement.value;

    // Remove non-numeric characters except for decimal point
    inputValue = inputValue.replace(/[^\d.]/g, '');

    if (inputValue) {
        // Parse to float and format with commas
        let formattedValue = parseFloat(inputValue).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });

        // Set the formatted value back to the input field with $ prefix
        inputElement.value = `$${formattedValue}`;
    } else {
        // If input is empty, clear the field
        inputElement.value = '';
    }
}

// Function to validate fees when button is clicked
function validateFees() {
    let dailyValue = getNumericValue($w('#dailyFeesAmountInputTextBox').value);
    let weeklyValue = getNumericValue($w('#weeklyFeesAmountInputTextBox').value);
    let monthlyValue = getNumericValue($w('#monthlyFeesAmountInputTextBox').value);

    let filledFields = [dailyValue, weeklyValue, monthlyValue].filter(value => value > 0).length;

    // Only validate if at least two fields are filled
    if (filledFields >= 2) {
        let errorMessage = '';

        switch (true) {
        case (dailyValue > weeklyValue && weeklyValue > 0):
            errorMessage = 'El precio de la cuota DIARIA no puede exceder la cuota SEMANAL';
            break;
        case (dailyValue > monthlyValue && monthlyValue > 0):
            errorMessage = 'El precio de la cuota DIARIA no puede exceder la cuota MENSUAL';
            break;
        case (weeklyValue > monthlyValue && monthlyValue > 0):
            errorMessage = 'El precio de la cuota SEMANAL no puede exceder la cuota MENSUAL';
            break;
        default:
            // Clear error message if all validations pass
            errorMessage = '';
        }

        if (errorMessage) {
            // Show the error message
            $w('#shortTermRentErrorMessageText').text = errorMessage;
            $w('#shortTermRentErrorMessageText').show();

            // Set a timer to clear the error message and input fields after 4 seconds
            setTimeout(() => {
                // Clear error message
                $w('#shortTermRentErrorMessageText').text = '';
                $w('#shortTermRentErrorMessageText').hide();

                // Clear the input fields
                $w('#dailyFeesAmountInputTextBox').value = '';
                $w('#weeklyFeesAmountInputTextBox').value = '';
                $w('#monthlyFeesAmountInputTextBox').value = '';
            }, 4000);
        }
    } else {
        // No validation if fewer than two fields are filled
        $w('#shortTermRentErrorMessageText').text = '';
        $w('#shortTermRentErrorMessageText').hide();
    }
}

//***************** */
// Function to format input to accept only numbers
function formatAndValidateStayInput(inputElement) {
    let inputValue = inputElement.value;

    // Remove non-numeric characters
    inputValue = inputValue.replace(/[^\d]/g, '');

    // Check if value is greater than 60
    if (inputValue) {
        let numericValue = parseInt(inputValue, 10);
        if (numericValue > 45) {
            setTimeout(() => {
                $w('#shortTermRentErrorMessageText').show();
                $w('#shortTermRentErrorMessageText').text = "Lo máximo que puedes registrar son 45 días";
                //$w("#shortRentMinimumStayInput").value = '';
                inputValue = '45'; // Set to max value if exceeded 
            }, 3000);
        }

        inputElement.value = inputValue;
    } else {
        $w('#shortTermRentErrorMessageText').hide();
        $w('#shortTermRentErrorMessageText').text = '';
        inputElement.value = '';
    }
}

// Function to format input to accept only numbers
function formatAndValidateGuestInput(inputElement) {
    let inputValue = inputElement.value;

    // Remove non-numeric characters
    inputValue = inputValue.replace(/[^\d]/g, '');

    // Check if value is greater than 20
    if (inputValue) {
        let numericValue = parseInt(inputValue, 10);
        if (numericValue > 20) {

            inputValue = '20'; // Set to max value if exceeded
        }
        inputElement.value = inputValue;
    } else {
        inputElement.value = '';
    }
}

// Function to validate all inputs
function validateStayAndGuestInputs() {
    let stayValue = getNumericValue($w('#shortRentMinimumStayInput').value);
    let guestValue = getNumericValue($w('#shortTimeRentGuestAmountInput').value);

    let errorMessage = '';

    if (stayValue > 45) {
        errorMessage = 'Minimum stay cannot exceed 60 days.';
    } else if (guestValue > 20) {
        errorMessage = 'Guest amount cannot exceed 20 guests.';
    }

    if (errorMessage) {
        // Show the error message
        $w('#shortTermRentErrorMessageText').text = errorMessage;
        $w('#shortTermRentErrorMessageText').show();

        // Set a timer to clear the error message and input fields after 4 seconds
        setTimeout(() => {
            // Clear error message
            $w('#shortTermRentErrorMessageText').text = '';
            $w('#shortTermRentErrorMessageText').hide();

            // Clear the input fields
            $w('#shortRentMinimumStayInput').value = '';
            $w('#shortTimeRentGuestAmountInput').value = '';
        }, 4000);
    }
}

/********** */

// Function to extract numeric value from formatted input
function getNumericValue(formattedValue) {
    return parseFloat(formattedValue.replace(/[^0-9.]/g, '')) || 0;
}