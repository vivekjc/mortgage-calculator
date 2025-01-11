# Bay Area Mortgage Calculator

A dark-themed mortgage calculator built for Bay Area home buyers. Helps visualize total monthly costs including property taxes, HOA, PMI, and utilities - all the fun stuff that makes Bay Area housing special.

## What it Does
- Shows monthly payments across different house prices
- Includes Bay Area's 1.25% property tax rate
- Calculates PMI for < 20% down payments
- Factors in HOA fees (because every condo has them)
- Estimates utilities and insurance
- Updates calculations in real-time
- Shows payment breakdown in a nice graph

## Quick Start

```bash
# Clone it
git clone https://github.com/yourusername/bay-area-mortgage-calculator.git
cd bay-area-mortgage-calculator

# Run the setup script (creates venv and installs dependencies)
./run.sh
```

Visit http://localhost:5000

## Features
- Dark theme with modern purple accents
- Real-time calculations as you type
- Interactive graph showing payment trends
- Detailed monthly payment breakdown
- Custom increment/decrement controls
- Mobile-responsive design
- Keyboard navigation support

## Tech Stack
- Backend: Python/Flask
- Frontend: Vanilla JavaScript
- Graphing: Plotly.js
- Icons: Font Awesome
- Font: Inter

## Development
Dependencies are managed through the run.sh script which:
- Creates a Python virtual environment
- Installs required packages
- Generates favicon assets
- Starts the Flask development server

Required packages:
- Flask
- NumPy
- Plotly
- Pandas
- Pillow (for favicon generation)

## Contributing
- Feel free to fork and improve this calculator
- Open an issue for any bugs or feature requests
- Pull requests are welcome!

## License
MIT License - see the LICENSE file for details

