// Define debounce function first
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Create debounced version of calculate before using it
const debouncedCalculate = debounce(calculateMortgage, 300);

// Add these functions at the top of the file
function formatNumberInput(input) {
    // Remove any non-digits
    let value = input.value.replace(/[^\d.-]/g, '');
    
    // Format with commas
    if (value) {
        value = parseFloat(value).toLocaleString('en-US');
    }
    
    // Update the display value
    input.value = value;
}

function handleCurrencyIncrement(input, increment) {
    const value = parseFloat(input.value.replace(/[^\d.-]/g, '')) || 0;
    let step = 1000; // default step

    // Custom steps for different inputs
    switch(input.id) {
        case 'housePrice':
            step = 100000;
            break;
        case 'insuranceBase':
            step = 100;
            break;
        case 'utilities':
            step = 25;
            break;
        case 'hoaFee':
            step = 50;
            break;
    }

    const newValue = value + (increment ? step : -step);
    if (newValue >= 0) {
        input.value = newValue.toLocaleString('en-US');
        input.dispatchEvent(new Event('input'));
    }
}

// Add this function to handle number increments
function handleNumberIncrement(input, increment) {
    const value = parseFloat(input.value.replace(/[^\d.-]/g, '')) || 0;
    let step = 1; // default step

    // Custom steps for different inputs
    switch(input.id) {
        case 'downPayment':
            step = document.querySelector('input[name="downPaymentType"]:checked').value === 'percentage' ? 1 : 5000;
            break;
        case 'interestRate':
        case 'pmiRate':
            step = 0.1;
            break;
        case 'propertyTaxRate':
        case 'insuranceRate':
            step = 0.01;
            break;
        case 'loanTerm':
            step = 1;
            break;
    }

    const newValue = value + (increment ? step : -step);
    if (newValue >= 0) {
        input.value = newValue.toFixed(2).replace(/\.?0+$/, '');
        input.dispatchEvent(new Event('input'));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for all inputs
    const allInputs = document.querySelectorAll('input, select');
    const calculateBtn = document.getElementById('calculateBtn');
    
    // Add debounced calculation for inputs
    allInputs.forEach(input => {
        if (input.type === 'radio') {
            input.addEventListener('change', debouncedCalculate);
        } else if (input.type === 'number') {
            input.addEventListener('input', debouncedCalculate);
            input.addEventListener('change', calculateMortgage); // Immediate calculation on blur
        } else if (input.type === 'checkbox') {
            input.addEventListener('change', debouncedCalculate);
        } else if (input.tagName === 'SELECT') {
            input.addEventListener('change', debouncedCalculate);
        }
    });

    // Add specific listener for down payment container
    const downPaymentRadios = document.querySelectorAll('input[name="downPaymentType"]');
    downPaymentRadios.forEach(radio => {
        radio.addEventListener('change', calculateMortgage);
    });

    // Add input event listener for down payment value
    const downPaymentInput = document.getElementById('downPayment');
    downPaymentInput.addEventListener('input', debouncedCalculate);

    // Update HOA checkbox label when fee changes
    const hoaFeeInput = document.getElementById('hoaFee');
    hoaFeeInput.addEventListener('input', function() {
        const hoaLabel = document.querySelector('label[for="includeHoa"]');
        hoaLabel.textContent = `Include HOA Fees ($${this.value}/month)`;
        debouncedCalculate();
    });

    // Add calculate button listener
    calculateBtn.addEventListener('click', calculateMortgage);

    // Initial calculation
    calculateMortgage();

    // Add formatting for currency inputs
    const currencyInputs = [
        document.getElementById('housePrice'),
        document.getElementById('insuranceBase'),
        document.getElementById('utilities'),
        document.getElementById('hoaFee')
    ];

    currencyInputs.forEach(input => {
        // Format initial value
        formatNumberInput(input);

        // Format and calculate on input
        input.addEventListener('input', function(e) {
            const cursorPosition = e.target.selectionStart;
            const oldLength = e.target.value.length;
            formatNumberInput(this);
            
            // Adjust cursor position after formatting
            const newLength = e.target.value.length;
            const newPosition = cursorPosition + (newLength - oldLength);
            e.target.setSelectionRange(newPosition, newPosition);
            
            // Trigger calculation
            debouncedCalculate();
        });
    });

    // Update currency controls to trigger calculation
    document.querySelectorAll('.currency-controls').forEach(controls => {
        const input = controls.parentElement.querySelector('input');
        
        controls.addEventListener('click', (e) => {
            const button = e.target.closest('.currency-control-btn');
            if (!button) return;
            
            const isIncrement = button.dataset.action === 'increment';
            handleCurrencyIncrement(input, isIncrement);
            // Trigger calculation immediately after increment/decrement
            calculateMortgage();
            e.preventDefault();
        });
    });

    // Update keyboard handlers for currency inputs
    document.querySelectorAll('.currency').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                handleCurrencyIncrement(input, e.key === 'ArrowUp');
                // Trigger calculation immediately after keyboard increment/decrement
                calculateMortgage();
            }
        });
    });

    // Add handlers for number inputs
    document.querySelectorAll('.number-controls').forEach(controls => {
        const input = controls.parentElement.querySelector('input');
        
        controls.addEventListener('click', (e) => {
            const button = e.target.closest('.number-control-btn');
            if (!button) return;
            
            const isIncrement = button.dataset.action === 'increment';
            handleNumberIncrement(input, isIncrement);
            e.preventDefault();
        });
    });

    // Add keyboard support for up/down arrows on number inputs
    document.querySelectorAll('.number-input').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                handleNumberIncrement(input, e.key === 'ArrowUp');
            }
        });
    });
});

function calculateMortgage() {
    const data = {
        housePrice: parseFloat(document.getElementById('housePrice').value.replace(/,/g, '')),
        downPayment: parseFloat(document.getElementById('downPayment').value.replace(/,/g, '')),
        downPaymentType: document.querySelector('input[name="downPaymentType"]:checked').value,
        interestRate: document.getElementById('interestRate').value,
        loanTerm: document.getElementById('loanTerm').value,
        priceIncrement: document.getElementById('priceIncrement').value,
        includeHoa: document.getElementById('includeHoa').checked,
        // Add Bay Area specific rates
        propertyTaxRate: document.getElementById('propertyTaxRate').value,
        pmiRate: document.getElementById('pmiRate').value,
        insuranceBase: parseFloat(document.getElementById('insuranceBase').value.replace(/,/g, '')),
        insuranceRate: document.getElementById('insuranceRate').value,
        utilities: parseFloat(document.getElementById('utilities').value.replace(/,/g, '')),
        hoaFee: parseFloat(document.getElementById('hoaFee').value.replace(/,/g, ''))
    };

    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        updateGraph(data);
        updateBreakdown(data.breakdown);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while calculating. Please check the console for details.');
    });
}

function updateBreakdown(breakdown) {
    if (!breakdown) return;

    document.getElementById('mortgageValue').textContent = formatCurrency(breakdown.mortgage);
    document.getElementById('taxValue').textContent = formatCurrency(breakdown.property_tax);
    document.getElementById('insuranceValue').textContent = formatCurrency(breakdown.insurance);
    document.getElementById('pmiValue').textContent = formatCurrency(breakdown.pmi);
    document.getElementById('utilitiesValue').textContent = formatCurrency(breakdown.utilities);
    document.getElementById('hoaValue').textContent = formatCurrency(breakdown.hoa);
    document.getElementById('totalValue').textContent = formatCurrency(breakdown.total);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function updateGraph(data) {
    if (!data.prices || !data.payments || data.prices.length === 0) {
        console.error('No data available for graph');
        return;
    }

    // Create hover text for each point
    const hoverText = data.prices.map((price, index) => {
        return `House Price: ${formatCurrency(price)}<br>` +
               `Monthly Payment: ${formatCurrency(data.payments[index])}`;
    });

    const trace = {
        x: data.prices,
        y: data.payments,
        mode: 'lines+markers+text',
        type: 'scatter',
        line: {
            color: '#6C5CE7',
            width: 2
        },
        marker: {
            size: 8,
            color: '#6C5CE7'
        },
        text: data.payments.map(payment => formatCurrency(payment)),
        textposition: 'top center',
        textfont: {
            size: 11,
            color: '#1D1D1F'
        },
        hoverinfo: 'text',
        hovertext: hoverText
    };

    const layout = {
        title: {
            text: 'Monthly Mortgage Payments vs House Price',
            font: {
                size: 16
            },
            x: 0.5,  // Center the title
            xanchor: 'center',
            y: 0.95   // Adjust top margin
        },
        xaxis: {
            title: 'House Price ($)',
            tickformat: '$,.0f',
            fixedrange: true,
            titlefont: {
                size: 13
            },
            tickfont: {
                size: 12
            },
            gridcolor: '#334155',
            zerolinecolor: '#334155'
        },
        yaxis: {
            title: 'Monthly Payment ($)',
            tickformat: '$,.0f',
            fixedrange: true,
            titlefont: {
                size: 13
            },
            tickfont: {
                size: 12
            },
            gridcolor: '#334155',
            zerolinecolor: '#334155',
            titlefont: {
                size: 13
            },
            title: {
                standoff: 40
            }
        },
        font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 12,
            color: '#E2E8F0'
        },
        autosize: true,
        margin: {
            l: 80,
            r: 20,
            t: 30,
            b: 70,
            pad: 4
        },
        showlegend: false,
        hoverlabel: {
            bgcolor: 'white',
            bordercolor: '#6C5CE7',
            font: {
                family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                size: 13
            }
        },
        paper_bgcolor: '#1E293B',
        plot_bgcolor: '#1E293B'
    };

    const config = {
        responsive: true,
        displayModeBar: false,
        displaylogo: false
    };

    try {
        Plotly.newPlot('graph', [trace], layout, config);
        
        // Add resize handler
        window.removeEventListener('resize', handleResize);
        window.addEventListener('resize', handleResize);
    } catch (error) {
        console.error('Error plotting graph:', error);
    }
}

function handleResize() {
    Plotly.Plots.resize('graph');
} 