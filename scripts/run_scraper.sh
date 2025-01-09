#!/bin/bash
cd "$(dirname "$0")/.."
source venv/bin/activate  # If using virtualenv
python scripts/price_scraper.py 