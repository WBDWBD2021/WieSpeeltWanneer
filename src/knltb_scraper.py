#!/usr/bin/env python3
"""
KNLTB Wedstrijd Scraper
Haalt wedstrijdgegevens op van de KNLTB MijnKNLTB website
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json
import sys
import re

def scrape_knltb_schedule(team_url, seizoen='najaar', jaar=2025):
    """
    Scrape wedstrijdschema van KNLTB website
    
    Args:
        team_url: URL naar het team op MijnKNLTB
        seizoen: 'voorjaar' of 'najaar'
        jaar: jaar van de competitie
    
    Returns:
        List van wedstrijden in het juiste formaat
    """
    try:
        # Headers om te voorkomen dat we geblokkeerd worden
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
        
        response = requests.get(team_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        wedstrijden = []
        
        # Zoek naar wedstrijd containers - dit moet aangepast worden aan de echte HTML structuur
        # Dit is een voorbeeld - de exacte selectors moeten worden aangepast
        wedstrijd_rows = soup.find_all('tr', class_='wedstrijd') or soup.find_all('div', class_='match')
        
        if not wedstrijd_rows:
            # Probeer alternatieve selectors
            wedstrijd_rows = soup.find_all('tr')
        
        for row in wedstrijd_rows:
            try:
                wedstrijd_data = parse_wedstrijd_row(row, seizoen, jaar)
                if wedstrijd_data:
                    wedstrijden.append(wedstrijd_data)
            except Exception as e:
                print(f"Fout bij parsen van rij: {e}", file=sys.stderr)
                continue
        
        return wedstrijden
        
    except requests.RequestException as e:
        print(f"Fout bij ophalen van data: {e}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Onverwachte fout: {e}", file=sys.stderr)
        return []

def parse_wedstrijd_row(row, seizoen, jaar):
    """Parse een wedstrijd rij naar ons formaat"""
    try:
        # Haal alle text uit de rij
        text = row.get_text(strip=True)
        
        # Skip lege rijen of headers
        if not text or len(text) < 10:
            return None
        
        wedstrijd = {
            'datum': None,
            'tijd': '19:00',  # Default tijd
            'team': '',
            'isThuis': True,
            'tegenstander': '',
            'locatie': '',
            'status': 'gepland',
            'competitie': f'{seizoen}-{jaar}',
            'posities': []
        }
        
        # Probeer datum te vinden (verschillende formaten)
        datum_patterns = [
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',  # DD-MM-YYYY of DD/MM/YYYY
            r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})',  # YYYY-MM-DD
            r'(\d{1,2})\s+(jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)\s+(\d{4})'  # DD maand YYYY
        ]
        
        for pattern in datum_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                groups = match.groups()
                if len(groups) == 3:
                    if groups[1].isdigit():  # DD-MM-YYYY formaat
                        dag, maand, jaar_str = groups
                        wedstrijd['datum'] = f"{jaar_str}-{maand.zfill(2)}-{dag.zfill(2)}"
                    else:  # DD maand YYYY formaat
                        maand_map = {
                            'jan': '01', 'feb': '02', 'mrt': '03', 'apr': '04',
                            'mei': '05', 'jun': '06', 'jul': '07', 'aug': '08',
                            'sep': '09', 'okt': '10', 'nov': '11', 'dec': '12'
                        }
                        dag, maand_naam, jaar_str = groups
                        maand = maand_map.get(maand_naam.lower(), '01')
                        wedstrijd['datum'] = f"{jaar_str}-{maand}-{dag.zfill(2)}"
                break
        
        # Probeer tijd te vinden
        tijd_match = re.search(r'(\d{1,2})[:\.](\d{2})', text)
        if tijd_match:
            uur, minuut = tijd_match.groups()
            wedstrijd['tijd'] = f"{uur.zfill(2)}:{minuut}"
        
        # Probeer thuis/uit te detecteren
        if 'uit' in text.lower():
            wedstrijd['isThuis'] = False
        elif 'thuis' in text.lower():
            wedstrijd['isThuis'] = True
        
        # Alleen wedstrijden met geldige datum retourneren
        if wedstrijd['datum']:
            return wedstrijd
        
        return None
        
    except Exception as e:
        print(f"Fout bij parsen: {e}", file=sys.stderr)
        return None

def scrape_from_csv_input(csv_data, seizoen='najaar', jaar=2025):
    """
    Alternatieve methode: Parse CSV data
    Format: Datum,Tijd,Thuis/Uit,Tegenstander,Locatie
    """
    wedstrijden = []
    
    lines = csv_data.strip().split('\n')
    for line in lines[1:]:  # Skip header
        parts = [p.strip() for p in line.split(',')]
        if len(parts) >= 5:
            wedstrijd = {
                'datum': parse_datum(parts[0]),
                'tijd': parts[1] or '19:00',
                'team': '',
                'isThuis': parts[2].lower() in ['thuis', 't', 'true'],
                'tegenstander': parts[3],
                'locatie': parts[4],
                'status': 'gepland',
                'competitie': f'{seizoen}-{jaar}',
                'posities': []
            }
            wedstrijden.append(wedstrijd)
    
    return wedstrijden

def parse_datum(datum_str):
    """Parse verschillende datum formaten naar YYYY-MM-DD"""
    formats = [
        '%d-%m-%Y',
        '%d/%m/%Y',
        '%Y-%m-%d',
        '%d-%m-%y',
        '%d/%m/%y'
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(datum_str, fmt)
            return dt.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    return datum_str

if __name__ == '__main__':
    # Test de scraper
    if len(sys.argv) > 1:
        url = sys.argv[1]
        seizoen = sys.argv[2] if len(sys.argv) > 2 else 'najaar'
        jaar = int(sys.argv[3]) if len(sys.argv) > 3 else 2025
        
        wedstrijden = scrape_knltb_schedule(url, seizoen, jaar)
        print(json.dumps(wedstrijden, indent=2))
    else:
        print("Gebruik: python knltb_scraper.py <KNLTB_URL> [seizoen] [jaar]")
        print("Voorbeeld: python knltb_scraper.py 'https://mijnknltb.nl/team/12345' najaar 2025")
