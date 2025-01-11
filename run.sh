#!/bin/bash

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install required packages
echo "Installing required packages..."
pip install flask numpy plotly pandas gunicorn pillow

# Generate favicon
python generate_favicon.py

# Run the program
export FLASK_APP=app.py
export FLASK_ENV=development
flask run 