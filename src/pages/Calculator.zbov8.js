let globalMortgagePayment = 0;

$w.onReady(function () {

    formatAmountInputs();
    formatInterestRateInput();
    // Call the function to format the interest rate input
    formatInterestRateInput();
    formatLoanTermInput();

});

// Enable the switch button
$w('#selectedCurrencyDropdown').onChange((event) => {
    // Enable the toggle switch
    $w('#switchCalculationsButton').enable();

    // Enable the toggle switch
    $w("#selectOneOptionText").show();
    setTimeout(() => {
        $w("#selectOneOptionText").hide();
    }, 3000);

    // Calculations Buttons 
    $w('#calculationsButton').enable();

    // Show the annualSelectionText when the toggle is enabled
    $w('#annualSelectionText').show();
})

$w('#switchCalculationsButton').onChange((event) => {

    const isAnnual = event.target.checked;

    // Enable input fields
    $w('#propertyValueInput').enable();
    $w('#rentalIncomeInput').enable();
    $w('#operatingExpensesInput').enable();
    $w('#mortgageAmountInput').enable();
    $w('#interestRateInput').enable();
    $w('#loanTermInput').enable();

    // If the switch is checked (Annual), update the labels to Spanish
    if (isAnnual) {

        $w('#rentalIncomeInput').label = "Ingreso Anual de Renta";
        $w('#operatingExpensesInput').label = "Gastos Operativos Anuales";
        $w('#interestRateInput').label = "Tasa de Interés Anual";
        $w('#loanTermInput').label = "Plazo del Préstamo Anual";

    } else if (!isAnnual) {

        // Reset the labels back to original for monthly calculation
        $w('#rentalIncomeInput').label = "Ingreso Mensual de Renta";
        $w('#operatingExpensesInput').label = "Gastos Operativos Mensuales";
        $w('#interestRateInput').label = "Tasa de Interés Mensual";
        $w('#loanTermInput').label = "Plazo del Préstamo Mensual";

    }
    // Clear all data when switching
    clearDataOnSwitch();
})

// Function to clear all data when switching between annual and monthly
function clearDataOnSwitch() {
    // Clear loan term input and result
    $w('#loanTermInput').value = '';
    $w('#loanTermResultText').text = '';

    // Clear interest rate input and result
    $w('#interestRateInput').value = '';
    $w('#interestRateResultText').text = '';

    // Clear property value input and result
    $w('#propertyValueInput').value = '';

    // Clear rental income input and result
    $w('#rentalIncomeInput').value = '';
    $w('#rentalIncomeResultText').text = '';

    // Clear operating expenses input and result
    $w('#operatingExpensesInput').value = '';
    $w('#operatingExpensesResultText').text = '';

    // Clear mortgage amount input and result
    $w('#mortgageAmountInput').value = '';
    $w('#mortgageResultText').text = '';

    // Hide warning messages if they are visible
    $w('#loanTermWarningMessageText').hide();
    $w('#interestRateWarningMessageText').hide();
}

// Function to format all inputs in real-time
function formatAmountInputs() {
    // List of input fields to format
    const inputFields = ['#propertyValueInput', '#rentalIncomeInput', '#operatingExpensesInput', '#mortgageAmountInput'];

    // Apply the format to each input field
    inputFields.forEach((fieldId) => {
        $w(fieldId).onInput(() => {
            let inputValue = $w(fieldId).value;

            // Remove any non-numeric characters (except for numbers)
            inputValue = inputValue.replace(/[^0-9]/g, '');

            // Update the input field with formatted value
            $w(fieldId).value = formatCurrencyWithoutSymbol(inputValue);

            // Update results based on input field
            if (fieldId === '#rentalIncomeInput') {
                updateRentalIncomeResultText(inputValue);
            } else if (fieldId === '#operatingExpensesInput') {
                updateOperatingExpensesResultText(inputValue);
            }
        });
    });
}

// Helper function to format currency without the dollar sign
function formatCurrencyWithoutSymbol(value) {
    if (value === "") return ""; // If the input is empty, return an empty string
    // Convert to a number
    let numericValue = parseInt(value, 10);

    // Format the number with commas as thousand separators
    return `$${numericValue.toLocaleString('en-US')}`;
}

// Helper function to format currency with decimals and the selected currency
function formatCurrency(value, selectedCurrency) {
    if (value === "") return ""; // If the input is empty, return an empty string
    let numericValue = parseFloat(value); // Use parseFloat to keep decimals
    return `${selectedCurrency}$${numericValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Function to update the rental income result text based on the input value
function updateRentalIncomeResultText(inputValue) {
    const isAnnual = $w("#switchCalculationsButton").checked; // Check if calculations are for annual or monthly
    const selectedCurrency = $w('#selectedCurrencyDropdown').value || '$'; // Get selected currency

    if (inputValue === "") {
        $w('#rentalIncomeResultText').text = "";
        return; // If input is empty, clear the result text
    }

    // Calculate and format rental income result
    let rentalIncome = parseInt(inputValue, 10);
    let result;

    if (isAnnual) {
        // Calculate monthly from annual input
        let monthlyIncome = rentalIncome / 12;
        result = `Ingresos Mensuales de Renta: ${formatCurrency(monthlyIncome, selectedCurrency)}`;
    } else {
        // Calculate annual from monthly input
        let annualIncome = rentalIncome * 12;
        result = `Ingresos Anuales de Renta: ${formatCurrency(annualIncome, selectedCurrency)}`;
    }

    // Update the rental income result text
    $w('#rentalIncomeResultText').text = result;
}

// Function to update the operating expenses result text based on the input value
function updateOperatingExpensesResultText(inputValue) {
    const isAnnual = $w("#switchCalculationsButton").checked; // Check if calculations are for annual or monthly
    const selectedCurrency = $w('#selectedCurrencyDropdown').value || '$'; // Get selected currency

    if (inputValue === "") {
        $w('#operatingExpensesResultText').text = "";
        return; // If input is empty, clear the result text
    }

    // Calculate and format operating expenses result
    let operatingExpenses = parseInt(inputValue, 10);
    let result;

    if (isAnnual) {
        // Calculate monthly from annual operating expenses
        let monthlyExpenses = operatingExpenses / 12;
        result = `Gastos Mensuales Operativos: ${formatCurrency(monthlyExpenses, selectedCurrency)}`;
    } else {
        // Calculate annual from monthly operating expenses
        let annualExpenses = operatingExpenses * 12;
        result = `Gastos Anuales Operativos: ${formatCurrency(annualExpenses, selectedCurrency)}`;
    }

    // Update the operating expenses result text
    $w('#operatingExpensesResultText').text = result;
}

// Function to format interest rate input
function formatInterestRateInput() {
    const interestRateInput = $w('#interestRateInput');
    const isAnnualSwitch = $w("#switchCalculationsButton"); // Check if calculations are annual
    const interestRateResultText = $w('#interestRateResultText'); // Text element to display result

    interestRateInput.onInput(() => {
        let inputValue = interestRateInput.value;

        // Allow only numbers and one decimal point
        inputValue = inputValue.replace(/[^0-9.]/g, '');

        // Limit to two decimal places
        const parts = inputValue.split('.');
        if (parts.length > 2) {
            inputValue = parts[0] + '.' + parts.slice(1).join('').slice(0, 2); // Join first part and limit decimals
        } else if (parts.length === 2) {
            inputValue = parts[0] + '.' + parts[1].slice(0, 2); // Keep up to two decimal places
        }

        // Parse the cleaned input value as a float
        let interestRate = parseFloat(inputValue);

        // Validate the interest rate
        if (isNaN(interestRate) || interestRate < 0) {
            interestRateInput.value = ''; // Clear the input if invalid
            interestRateResultText.text = ''; // Clear result text if input is invalid
            $w('#interestRateWarningMessageText').hide();
            return;
        }

        // Check if the value exceeds 100%
        if (interestRate > 100) {
            showInterestRateWarning("Interest rate cannot exceed 100%. / La tasa de interés no puede superar el 100%.");
            return;
        } else {
            $w('#interestRateWarningMessageText').hide(); // Hide warning if valid
        }

        // Check for specific thresholds based on annual or monthly
        if (isAnnualSwitch.checked && interestRate > 20) {
            showInterestRateWarning("Algo no está bien. Annual interest rate should not exceed 20%. / La tasa de interés anual no debe superar el 20%.");
        } else if (!isAnnualSwitch.checked && interestRate > 2) {
            showInterestRateWarning("Algo no está bien. Monthly interest rate should not exceed 2%. / La tasa de interés mensual no debe superar el 2%.");
        } else {
            $w('#interestRateWarningMessageText').hide(); // Hide warning if valid
        }

        // Update the input field without suffix for calculations
        interestRateInput.value = inputValue; // Keep input value without '%'

        // Calculation logic for displaying interest rate result
        let resultText;
        if (isAnnualSwitch.checked) {
            const monthlyInterestRate = (interestRate / 12).toFixed(2); // Calculate monthly interest rate
            resultText = `La tasa de interés mensual es: ${monthlyInterestRate}%`;
        } else {
            const annualInterestRate = (interestRate * 12).toFixed(2); // Calculate annual interest rate
            resultText = `La tasa de interés anual es: ${annualInterestRate}%`;
        }
        interestRateResultText.text = resultText; // Display the result
    });

    // Append % sign when the user moves away from the input
    interestRateInput.onBlur(() => {
        let inputValue = interestRateInput.value;
        if (inputValue) {
            // Remove existing '%' sign if present and add the sign back
            inputValue = inputValue.replace(/%/g, '');
            interestRateInput.value = `${inputValue}%`;
        }
    });
}

// Function to show warnings with timeout
function showInterestRateWarning(message) {
    $w('#interestRateWarningMessageText').text = message;
    $w('#interestRateWarningMessageText').show();
    setTimeout(() => {
        $w('#interestRateWarningMessageText').hide();
        $w('#interestRateInput').value = ''; // Clear the input field after timeout
    }, 3000);
}

// Function to format and validate the loan term input
function formatLoanTermInput() {
    $w('#loanTermInput').onInput(() => {
        let inputValue = $w('#loanTermInput').value;

        // Remove any non-numeric characters
        inputValue = inputValue.replace(/[^0-9]/g, '');

        // Convert inputValue to a number for validation
        let loanTerm = parseInt(inputValue, 10);
        const isAnnual = $w("#switchCalculationsButton").checked; // Check if calculations are for annual or monthly

        // Validate the loan term input
        if (isNaN(loanTerm) || loanTerm < 0) {
            $w('#loanTermInput').value = ''; // Clear input if invalid
            $w('#loanTermWarningMessageText').hide();
            return;
        }

        // Check maximum loan term based on annual or monthly
        let maxLoanTerm = isAnnual ? 30 : 360; // 30 years for annual, 360 months for monthly

        if (loanTerm > maxLoanTerm) {
            let message = isAnnual ?
                "Loan term cannot exceed 30 years. / El plazo del préstamo no puede exceder los 30 años." :
                "Loan term cannot exceed 360 months. / El plazo del préstamo no puede exceder los 360 meses.";

            showLoanTermWarning(message);
            return;
        } else {
            $w('#loanTermWarningMessageText').hide(); // Hide warning if valid
        }

        // Update the input field with the valid loan term
        $w('#loanTermInput').value = loanTerm.toString(); // Keep the input as a number

        // Calculate and show results based on annual or monthly
        let loanTermResultText = $w('#loanTermResultText'); // Reference to the result text element
        if (isAnnual) {
            // Calculate monthly loan term
            let monthlyTerm = loanTerm * 12;
            loanTermResultText.text = `El Plazo del Préstamo Mensual es: ${monthlyTerm} meses.`;
        } else {
            // Calculate annual loan term
            let annualTerm = loanTerm / 12;
            loanTermResultText.text = `El Plazo del Préstamo en Años es: ${annualTerm} años.`;
        }
    });
}

// Function to show loan term warnings with timeout
function showLoanTermWarning(message) {
    $w('#loanTermWarningMessageText').text = message;
    $w('#loanTermWarningMessageText').show();
    setTimeout(() => {
        $w('#loanTermWarningMessageText').hide();
        $w('#loanTermInput').value = ''; // Clear the input field after timeout
    }, 3000);
}

// Helper function to clean input and format currency with decimals and the selected currency
function cleanAndParseInput(value) {
    if (value === "") return 0; // If the input is empty, return 0
    let cleanedValue = value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except decimal point
    return parseFloat(cleanedValue) || 0; // Convert to float or return 0 if NaN
}

// Helper function to format amounts with currency and commas
function formatAmount(amount, selectedCurrency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedCurrency }).format(amount);
}

// Main function to calculate mortgage payments
function calculateMortgagePayments() {
    // Clean user inputs using the unformatNumber helper function
    let propertyValue = cleanAndParseInput($w("#propertyValueInput").value);
    let rentalIncome = cleanAndParseInput($w("#rentalIncomeInput").value);
    let operatingExpenses = cleanAndParseInput($w("#operatingExpensesInput").value);
    let mortgageAmount = cleanAndParseInput($w("#mortgageAmountInput").value);
    let interestRate = cleanAndParseInput($w("#interestRateInput").value);
    let loanTerm = cleanAndParseInput($w("#loanTermInput").value);
    let isAnnual = $w("#switchCalculationsButton").checked; // Check if the user selected annual calculations
    let selectedCurrency = $w("#selectedCurrencyDropdown").value; // Get the selected currency

    // Validate inputs
    if (isNaN(propertyValue) || isNaN(rentalIncome) || isNaN(operatingExpenses) || isNaN(mortgageAmount) || isNaN(interestRate) || isNaN(loanTerm) || mortgageAmount === 0 || interestRate === 0) {
        // Show a warning message if any value is missing or invalid
        $w("#mortgagePaymentWarningText").text = "Please enter valid values for all required fields.";
        $w("#mortgagePaymentWarningText").show();
        setTimeout(() => {
            $w("#mortgagePaymentWarningText").hide();
        }, 4000); // Hide the message after 4 seconds
        return;
    }

    // Determine the interest rate and loan term based on the toggle (annual or monthly)
    let monthlyInterestRate, totalPayments;
    if (isAnnual) {
        monthlyInterestRate = (interestRate / 100) / 12; // Annual interest rate divided by 12
        totalPayments = loanTerm * 12; // Convert loan term in years to months
    } else {
        monthlyInterestRate = interestRate / 100; // Monthly interest rate directly input
        totalPayments = loanTerm; // Loan term in months
    }

    // Mortgage payment formula: M = P[r(1+r)^n] / [(1+r)^n - 1]
    let monthlyMortgagePayment = (mortgageAmount * monthlyInterestRate * Math.pow((1 + monthlyInterestRate), totalPayments)) / (Math.pow((1 + monthlyInterestRate), totalPayments) - 1);

    // Store the monthly mortgage payment in the global variable
    globalMortgagePayment = monthlyMortgagePayment;

    // Display the formatted result in mortgagePaymentResultText with selected currency
    let formattedMonthlyPayment = formatAmount(monthlyMortgagePayment, selectedCurrency);
    $w("#mortgagePaymentResultText").text = `Monthly Mortgage Payment: ${formattedMonthlyPayment}`;
    $w("#mortgagePaymentResultText").show();

    // If the user selected annual calculations, calculate and display the annual payment
    if (isAnnual) {
        let annualMortgagePayment = monthlyMortgagePayment * 12;
        let formattedAnnualPayment = formatAmount(annualMortgagePayment, selectedCurrency);
        $w("#otherMortgagePaymentResultText").text = `Annual Mortgage Payment: ${formattedAnnualPayment}`;
    } else {
        let formattedAnnualPayment = formatAmount(monthlyMortgagePayment * 12, selectedCurrency);
        $w("#otherMortgagePaymentResultText").text = `Annual Mortgage Payment (calculated): ${formattedAnnualPayment}`;
    }
    $w("#otherMortgagePaymentResultText").show();

    // Display the formula and variable details
    let formula = `M = P[r(1+r)^n] / [(1+r)^n - 1]`;
    let variablesText = `• Monthly Payment (M): ${formattedMonthlyPayment}
• Property Value (P): ${formatAmount(propertyValue, selectedCurrency)}
• Monthly Interest Rate (r): ${(monthlyInterestRate * 100).toFixed(2)}%
• Total number of monthly payments (n): ${totalPayments}`;
    $w("#mortgagePaymentFormulaText").text = `Formula: ${formula}`;
    $w("#formulaVariablesNumbersText").text = variablesText;
    $w("#mortgagePaymentFormulaText").show();
    $w("#formulaVariablesNumbersText").show();

    // Show a conclusion and advice based on the mortgage payment results
    let netOperatingIncome = rentalIncome - operatingExpenses;
    let mortgagePaymentComparison = netOperatingIncome - monthlyMortgagePayment;

    let conclusionText = `The mortgage payment is ${formattedMonthlyPayment}.`;
    if (mortgagePaymentComparison < 0) {
        conclusionText += `
            A high mortgage payment compared to the net operating income (NOI) could indicate that the property may not generate sufficient cash flow. 
            • Consider increasing rental income.
            • Review your operating expenses for possible reductions.
            • You might also want to negotiate a lower property purchase price or mortgage interest rate.`;
    } else {
        conclusionText += `
            The mortgage payment seems manageable compared to your net operating income (NOI). 
            • Consider maintaining this ratio for a good return on investment.
            • Keep an eye on potential increases in operating expenses or rental income changes.`;
    }
    $w("#mortgageExplanationText").text = conclusionText;
    $w("#mortgageExplanationText").show();
}



// Function to calculate Cash Flow
function calculateCashFlow() {
    // Get the selected currency
    const selectedCurrency = $w('#selectedCurrencyDropdown').value;

    // Get the values from the input fields
    const rentalIncome = cleanAndParseInput($w('#rentalIncomeInput').value);
    const operatingExpenses = cleanAndParseInput($w('#operatingExpensesInput').value);

    // Use the global mortgage payment stored earlier
    const monthlyMortgagePayment = globalMortgagePayment;

    // Determine if the calculation is monthly or annual
    const isAnnual = $w("#switchCalculationsButton").checked; // Check if the user selected annual calculations
    let cashFlowResult;

    // Calculate cash flow based on selection
    if (isAnnual) {
        // For annual calculations, multiply inputs by 12
        cashFlowResult = (rentalIncome - (operatingExpenses + (monthlyMortgagePayment * 12))); // Annualize the mortgage payment
    } else {
        // For monthly calculations, use inputs directly
        cashFlowResult = rentalIncome - (operatingExpenses + monthlyMortgagePayment);
    }

    const formattedCashFlowResult = formatAmount(cashFlowResult, selectedCurrency);
    let cashFlowDescription = isAnnual ? "Annual Cash Flow" : "Monthly Cash Flow";

    // Display the cash flow result
    $w('#cashFlowResultText').text = `${cashFlowDescription}: ${formattedCashFlowResult}`;
    $w('#cashFlowResultText').show();

    // Calculate the opposite cash flow
    let oppositeCashFlowResult;
    if (isAnnual) {
        oppositeCashFlowResult = cashFlowResult / 12; // Convert annual cash flow to monthly
        const formattedOppositeCashFlowResult = formatAmount(oppositeCashFlowResult, selectedCurrency);
        let oppositeCashFlowDescription = "Monthly Cash Flow (calculated)";
        $w('#otherCashFlowCalculationResultsText').text = `${oppositeCashFlowDescription}: ${formattedOppositeCashFlowResult}`;
    } else {
        oppositeCashFlowResult = cashFlowResult * 12; // Convert monthly cash flow to annual
        const formattedOppositeCashFlowResult = formatAmount(oppositeCashFlowResult, selectedCurrency);
        let oppositeCashFlowDescription = "Annual Cash Flow (calculated)";
        $w('#otherCashFlowCalculationResultsText').text = `${oppositeCashFlowDescription}: ${formattedOppositeCashFlowResult}`;
    }
    $w('#otherCashFlowCalculationResultsText').show();

    // Display additional information or conclusion based on cash flow
    let explanationText = `The cash flow is calculated based on rental income minus operating expenses and mortgage payments.`;
    if (cashFlowResult < 0) {
        explanationText += ` 
            This indicates a negative cash flow. You may need to review your rental pricing or expenses.`;
    } else {
        explanationText += `
            This indicates a positive cash flow, suggesting good management of your property finances.`;
    }
    $w('#cashFlowExplanationResults').text = explanationText;
    $w('#cashFlowExplanationResults').show();

    // Cash Flow Calculation Formula
    const cashFlowFormula = isAnnual ? `ACF = ARI - (AOE + AMP)` : `MCF = MRI - (MOE + MMP)`; // Annual or Monthly Cash Flow formula
    const cashFlowValuesText = isAnnual ? 
        `• Annual Cash Flow (ACF): ${formattedCashFlowResult}
• Annual Rental Income (ARI): ${formatAmount(rentalIncome * 12, selectedCurrency)} 
• Annual Operating Expenses (AOE): ${formatAmount(operatingExpenses * 12, selectedCurrency)}
• Annual Mortgage Payments (AMP): ${formatAmount(monthlyMortgagePayment * 12, selectedCurrency)}` : 
        `• Monthly Cash Flow (MCF): ${formattedCashFlowResult}
• Monthly Rental Income (MRI): ${formatAmount(rentalIncome, selectedCurrency)}
• Monthly Operating Expenses (MOE): ${formatAmount(operatingExpenses, selectedCurrency)}
• Monthly Mortgage Payments (MMP): ${formatAmount(monthlyMortgagePayment, selectedCurrency)}`;

    // Display the formula and variable values
    $w('#cashFlowCalculationFormulaText').text = `Formula: ${cashFlowFormula}`;
    $w('#cashFlowFormulaValuesText').text = cashFlowValuesText;

    // Show the formula and values
    $w('#cashFlowCalculationFormulaText').show();
    $w('#cashFlowFormulaValuesText').show();
}



function calculateGrossYield() {
    // Retrieve and format the values from the input fields
    let rentalIncome = parseFloat($w("#rentalIncomeInput").value.replace(/[^0-9.]/g, '')); // Remove any non-numeric characters except decimal points
    let propertyPurchasePrice = parseFloat($w("#propertyValueInput").value.replace(/[^0-9.]/g, '')); // Remove any non-numeric characters except decimal points
    let isAnnual = $w("#switchCalculationsButton").checked; // Check if the toggle is set to Annual
    let selectedCurrency = $w("#selectedCurrencyDropdown").value; // Retrieve selected currency from dropdown

    // Log the input values to the console for debugging
    console.log("Rental Income Input (numeric): ", rentalIncome);
    console.log("Property Purchase Price Input (numeric): ", propertyPurchasePrice);
    console.log("Is Annual Toggle: ", isAnnual);
    console.log("Selected Currency: ", selectedCurrency);

    // Validate the inputs
    if (isNaN(rentalIncome) || isNaN(propertyPurchasePrice) || propertyPurchasePrice === 0) {
        // Show an error message if any value is missing or invalid
        $w("#grossYieldWarningText").text = "Please enter valid numeric values for rental income and property price.";
        $w("#grossYieldWarningText").show();
        setTimeout(() => {
            $w("#grossYieldWarningText").hide();
        }, 4000); // Hide the message after 4 seconds
        return;
    }

    let annualRentalIncome;
    let grossYieldFormula = "";

    // Function to format the amount with commas and two decimal places
    function formatAmount(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedCurrency }).format(amount);
    }

    // Check if the isAnnual toggle is on
    if (isAnnual) {
        annualRentalIncome = rentalIncome; // The rental income is already annual
        grossYieldFormula = `Annual Rental Income (${selectedCurrency}${formatAmount(annualRentalIncome)}) ÷ Property Purchase Price (${selectedCurrency}${formatAmount(propertyPurchasePrice)}) × 100`;
        console.log("Using Annual Rental Income for Calculation.");
    } else {
        // If not annual, assume the rental income is monthly and multiply it by 12 for the annual calculation
        annualRentalIncome = rentalIncome * 12;
        grossYieldFormula = `Monthly Rental Income (${formatAmount(rentalIncome)}) × 12 ÷ Property Purchase Price (${selectedCurrency}${formatAmount(propertyPurchasePrice)}) × 100`;
        console.log("Using Monthly Rental Income for Calculation, converted to Annual:", annualRentalIncome);
    }

    // Calculate Gross Yield (Annual)
    let annualGrossYield = (annualRentalIncome / propertyPurchasePrice) * 100;
    console.log("Calculated Annual Gross Yield: ", annualGrossYield);

    // Calculate Gross Yield (Monthly)
    let monthlyGrossYield = annualGrossYield / 12;
    console.log("Calculated Monthly Gross Yield: ", monthlyGrossYield);

    // Display the results in the respective text elements
    $w("#grossYieldResultText").text = `Gross Yield: ${annualGrossYield.toFixed(2)}% (Annual)`;
    $w("#annualGrossYieldResultsText").text = `Annual Gross Yield: ${annualGrossYield.toFixed(2)}%`;
    $w("#monthlyGrossYieldResultsText").text = `Monthly Gross Yield: ${monthlyGrossYield.toFixed(2)}%`;
    $w("#grossYieldFormula").text = `Formula: ${grossYieldFormula}`;

    // Show the results
    $w("#grossYieldResultText").show();
    $w("#annualGrossYieldResultsText").show();
    $w("#monthlyGrossYieldResultsText").show();
    $w("#grossYieldFormula").show();

    // Provide an explanation based on the gross yield
    let explanationText = "";

    if (annualGrossYield < 5) {
        explanationText = `A gross yield of ${annualGrossYield.toFixed(2)}% is considered low. This suggests that the rental income from this property may not be sufficient to cover expenses or provide a strong return. You might need to consider lowering your property purchase price or increasing your rental income to achieve a more favorable yield.`;
    } else if (annualGrossYield >= 5 && annualGrossYield <= 8) {
        explanationText = `A gross yield of ${annualGrossYield.toFixed(2)}% is moderate. While this yield isn't particularly high, it's still within a reasonable range for certain types of properties. You should carefully consider other factors such as location and future rental growth when making your investment decision.`;
    } else {
        explanationText = `A gross yield of ${annualGrossYield.toFixed(2)}% is considered high. This suggests that the property is generating a strong return relative to its purchase price. However, higher gross yields can sometimes indicate riskier investments, so it's essential to consider the quality of the property and other market factors before proceeding.`;
    }

    // Show the explanation in the text box
    $w("#grossYieldExplanationText").text = explanationText;
    $w("#grossYieldExplanationText").show();
}

function calculateCapRate() {
    // Helper function to remove formatting from input values (e.g., commas, dollar signs)
    function unformatNumber(value) {
        return parseFloat(value.replace(/[^0-9.-]+/g, ""));
    }

    // Helper function to format numbers with commas and two decimal places
    function formatCurrency(value, currency) {
        return `${currency}$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }

    // Retrieve user inputs and unformat them
    let propertyValue = unformatNumber($w("#propertyValueInput").value);
    let rentalIncome = unformatNumber($w("#rentalIncomeInput").value);
    let operatingExpenses = unformatNumber($w("#operatingExpensesInput").value);
    let isAnnual = $w("#switchCalculationsButton").checked; // Check if annual calculations are selected

    // Get selected currency
    let selectedCurrency = $w("#selectedCurrencyDropdown").value;

    // Validate inputs
    if (isNaN(propertyValue) || isNaN(rentalIncome) || isNaN(operatingExpenses) || propertyValue === 0) {
        // Show error message
        $w("#capRateWarningText").text = "Please enter valid numbers for property value, rental income, and operating expenses.";
        $w("#capRateWarningText").show();
        setTimeout(() => {
            $w("#capRateWarningText").hide();
        }, 4000);
        return;
    }

    let netOperatingIncome;
    let capRate;
    let formulaText;
    let valuesText;

    // Calculate Cap Rate based on annual or monthly selection
    if (isAnnual) {
        // Annual Cap Rate calculation
        netOperatingIncome = rentalIncome - operatingExpenses; // NOI (Annual)
        capRate = (netOperatingIncome / propertyValue) * 100;

        // Prepare formula and values for display
        formulaText = `Annual Cap Rate (ACR) = (NOI / PV) × 100`;
        valuesText = `- Annual Net Operating Income (NOI): ${formatCurrency(netOperatingIncome, selectedCurrency)}\n` +
            `- Property Value (PV): ${formatCurrency(propertyValue, selectedCurrency)}\n`;
    } else {
        // Monthly Cap Rate calculation
        let monthlyRentalIncome = rentalIncome / 12;
        let monthlyOperatingExpenses = operatingExpenses / 12;
        netOperatingIncome = monthlyRentalIncome - monthlyOperatingExpenses; // NOI (Monthly)
        capRate = (netOperatingIncome / propertyValue) * 100;

        // Prepare formula and values for display
        formulaText = `Monthly Cap Rate (MCR) = (MNOI / PV) × 100`;
        valuesText = `- Monthly Net Operating Income (MNOI): ${formatCurrency(netOperatingIncome, selectedCurrency)}\n` +
            `- Property Value (PV): ${formatCurrency(propertyValue, selectedCurrency)}\n`;
    }

    // Format and show Cap Rate result
    $w("#capRateCalculationResultsText").text = `Cap Rate: ${capRate.toFixed(2)}%`;
    $w("#capRateCalculationResultsText").show();

    // Show the formula used
    $w("#capRateFormulaText").text = `Formula: ${formulaText}`;
    $w("#capRateFormulaText").show();

    // Show the variables with names in bullet points, formatted with currency
    $w("#capRateValuesText").text = `${valuesText}`;
    $w("#capRateValuesText").show();

    // Provide advice based on Cap Rate result
    let conclusionText;
    if (capRate < 5) {
        conclusionText = `A cap rate of ${capRate.toFixed(2)}% is considered low. This suggests that the rental income from this property may not be sufficient to cover expenses or provide a strong return. Recommendations:\n` +
            `• Consider lowering your property purchase price.\n` +
            `• Increase your rental income.\n` +
            `• Review operating expenses to reduce costs.`;
    } else if (capRate >= 5 && capRate < 10) {
        conclusionText = `A cap rate of ${capRate.toFixed(2)}% is moderate. This property has potential to generate a decent return, but you may want to explore ways to maximize rental income or reduce operating costs. Recommendations:\n` +
            `• Explore increasing rental income.\n` +
            `• Look for areas to reduce expenses.`;
    } else {
        conclusionText = `A cap rate of ${capRate.toFixed(2)}% is considered high, indicating that this property is generating a strong return relative to its value. This is a potentially favorable investment. Recommendations:\n` +
            `• Ensure the property is well-maintained to retain its value.\n` +
            `• Consider long-term investment strategies to capitalize on this return.`;
    }

    // Show the conclusion/advice text
    $w("#capRateConclusionText").text = conclusionText;
    $w("#capRateConclusionText").show();
}

//*******************Calculation Button*************************** */

$w('#calculationsButton').onClick((event) => {
    calculateMortgagePayments();
    //calculateMortgagePayment();
    calculateCashFlow();
    calculateGrossYield();
    calculateCapRate();
})