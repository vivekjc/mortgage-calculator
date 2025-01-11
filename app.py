from flask import Flask, render_template, jsonify, request
import numpy as np

app = Flask(__name__)

def calculate_monthly_payment(principal, annual_rate, years):
    monthly_rate = annual_rate / 12 / 100
    num_payments = years * 12
    monthly_payment = principal * (monthly_rate * (1 + monthly_rate)**num_payments) / \
                     ((1 + monthly_rate)**num_payments - 1)
    return monthly_payment

def calculate_pmi(home_price, down_payment_percent):
    if down_payment_percent >= 20:
        return 0
    # PMI typically ranges from 0.5% to 1.5% annually of the loan amount
    # Using 1% for Bay Area due to high prices
    loan_amount = home_price * (1 - down_payment_percent/100)
    return (loan_amount * 0.01) / 12

def calculate_property_tax(home_price):
    # California property tax rate is about 1.25% in Bay Area
    return (home_price * 0.0125) / 12

def calculate_home_insurance(home_price):
    # Bay Area home insurance averages around $1200-2000 annually
    # Using a formula based on home value: $1500 base + 0.1% of home value
    annual_insurance = 1500 + (home_price * 0.001)
    return annual_insurance / 12

def get_utilities_estimate():
    # Average Bay Area utilities (electricity, gas, water, garbage)
    return 250  # Monthly estimate

def get_hoa_estimate():
    # Average Bay Area HOA fees
    return 400  # Monthly estimate

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    base_price = float(data['housePrice'])
    interest_rate = float(data['interestRate'])
    years = float(data['loanTerm'])
    down_payment_value = float(data['downPayment'])
    down_payment_type = data['downPaymentType']
    price_increment = float(data.get('priceIncrement', 50000))
    include_hoa = data.get('includeHoa', 'false') == 'true'
    
    # Get Bay Area specific rates from UI
    property_tax_rate = float(data.get('propertyTaxRate', 1.25)) / 100
    pmi_rate = float(data.get('pmiRate', 1.0)) / 100
    insurance_base = float(data.get('insuranceBase', 1500))
    insurance_rate = float(data.get('insuranceRate', 0.1)) / 100
    utilities = float(data.get('utilities', 250))
    hoa_fee = float(data.get('hoaFee', 400))

    house_prices = np.arange(base_price - 3*price_increment, base_price + 4*price_increment, price_increment)
    monthly_payments = []
    payment_breakdowns = []
    valid_prices = []

    for price in house_prices:
        if price <= 0:
            continue
            
        # Calculate down payment and percentage
        if down_payment_type == "percentage":
            down_payment_percent = down_payment_value
            current_down = price * (down_payment_value / 100)
        else:
            # When down payment is a fixed amount
            current_down = down_payment_value
            down_payment_percent = (current_down / price) * 100 if price > 0 else 0
        
        loan_amount = price - current_down
        if loan_amount <= 0:
            continue
        
        # Calculate all monthly costs
        mortgage_payment = calculate_monthly_payment(loan_amount, interest_rate, years)
        pmi = calculate_pmi(price, down_payment_percent)
        property_tax = calculate_property_tax(price)
        insurance = calculate_home_insurance(price)
        utilities = get_utilities_estimate()
        hoa = hoa_fee if include_hoa else 0

        total_payment = mortgage_payment + pmi + property_tax + insurance + utilities + hoa
        
        monthly_payments.append(round(total_payment, 2))
        valid_prices.append(int(price))
        
        # Add breakdown for the selected price point
        if int(price) == int(base_price):
            payment_breakdowns.append({
                'mortgage': round(mortgage_payment, 2),
                'pmi': round(pmi, 2),
                'property_tax': round(property_tax, 2),
                'insurance': round(insurance, 2),
                'utilities': round(utilities, 2),
                'hoa': round(hoa, 2),
                'total': round(total_payment, 2)
            })

    return jsonify({
        'prices': valid_prices,
        'payments': monthly_payments,
        'breakdown': payment_breakdowns[0] if payment_breakdowns else None
    })

if __name__ == '__main__':
    app.run(debug=True) 