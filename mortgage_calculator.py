import tkinter as tk
from tkinter import ttk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np

class MortgageCalculator:
    def __init__(self, root):
        self.root = root
        self.root.title("Mortgage Payment Calculator")
        self.root.geometry("800x600")

        # Input frame
        input_frame = ttk.Frame(root, padding="10")
        input_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # House price input
        ttk.Label(input_frame, text="House Price ($):").grid(row=0, column=0, padx=5, pady=5)
        self.house_price = tk.StringVar(value="300000")
        ttk.Entry(input_frame, textvariable=self.house_price).grid(row=0, column=1, padx=5, pady=5)

        # Down payment input
        ttk.Label(input_frame, text="Down Payment:").grid(row=1, column=0, padx=5, pady=5)
        self.down_payment = tk.StringVar(value="20")
        ttk.Entry(input_frame, textvariable=self.down_payment).grid(row=1, column=1, padx=5, pady=5)
        
        # Down payment type
        self.down_payment_type = tk.StringVar(value="percentage")
        ttk.Radiobutton(input_frame, text="Percentage", variable=self.down_payment_type, 
                       value="percentage").grid(row=1, column=2, padx=5, pady=5)
        ttk.Radiobutton(input_frame, text="Amount ($)", variable=self.down_payment_type, 
                       value="amount").grid(row=1, column=3, padx=5, pady=5)

        # Interest rate input
        ttk.Label(input_frame, text="Interest Rate (%):").grid(row=2, column=0, padx=5, pady=5)
        self.interest_rate = tk.StringVar(value="5.0")
        ttk.Entry(input_frame, textvariable=self.interest_rate).grid(row=2, column=1, padx=5, pady=5)

        # Loan term input
        ttk.Label(input_frame, text="Loan Term (years):").grid(row=3, column=0, padx=5, pady=5)
        self.loan_term = tk.StringVar(value="30")
        ttk.Entry(input_frame, textvariable=self.loan_term).grid(row=3, column=1, padx=5, pady=5)

        # Calculate button
        ttk.Button(input_frame, text="Calculate", command=self.calculate_and_plot).grid(row=4, column=0, 
                                                                                      columnspan=2, pady=20)

        # Create figure for plotting
        self.fig, self.ax = plt.subplots(figsize=(10, 6))
        self.canvas = FigureCanvasTkAgg(self.fig, master=self.root)
        self.canvas.get_tk_widget().grid(row=1, column=0, padx=10, pady=10)

    def calculate_monthly_payment(self, principal, annual_rate, years):
        monthly_rate = annual_rate / 12 / 100
        num_payments = years * 12
        monthly_payment = principal * (monthly_rate * (1 + monthly_rate)**num_payments) / \
                         ((1 + monthly_rate)**num_payments - 1)
        return monthly_payment

    def calculate_and_plot(self):
        try:
            base_price = float(self.house_price.get())
            interest_rate = float(self.interest_rate.get())
            years = float(self.loan_term.get())
            down_payment_value = float(self.down_payment.get())

            if self.down_payment_type.get() == "percentage":
                down_payment_amount = base_price * (down_payment_value / 100)
            else:
                down_payment_amount = down_payment_value

            # Calculate for range of house prices
            house_prices = np.arange(base_price - 150000, base_price + 200000, 50000)
            monthly_payments = []

            for price in house_prices:
                if price <= 0:
                    continue
                # Adjust down payment based on type
                if self.down_payment_type.get() == "percentage":
                    current_down = price * (down_payment_value / 100)
                else:
                    current_down = down_payment_amount
                
                loan_amount = price - current_down
                if loan_amount <= 0:
                    continue
                
                monthly_payment = self.calculate_monthly_payment(loan_amount, interest_rate, years)
                monthly_payments.append(monthly_payment)

            # Plotting
            self.ax.clear()
            self.ax.plot(house_prices, monthly_payments, 'b-o')
            self.ax.set_xlabel('House Price ($)')
            self.ax.set_ylabel('Monthly Payment ($)')
            self.ax.set_title('Monthly Mortgage Payments vs House Price')
            self.ax.grid(True)

            # Format axis labels
            self.ax.get_xaxis().set_major_formatter(
                plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))
            self.ax.get_yaxis().set_major_formatter(
                plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))

            # Rotate x-axis labels for better readability
            plt.xticks(rotation=45)

            self.fig.tight_layout()
            self.canvas.draw()

        except ValueError as e:
            tk.messagebox.showerror("Error", "Please enter valid numbers for all fields")

if __name__ == "__main__":
    root = tk.Tk()
    app = MortgageCalculator(root)
    root.mainloop() 