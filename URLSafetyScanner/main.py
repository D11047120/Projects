import os
import requests
from dotenv import load_dotenv

load_dotenv('C:/Users/Didasz/Desktop/VSCODE/Projects/Projects/URLSafetyScanner/.env')
API_KEY = os.getenv("VIRUSTOTAL_API_KEY")

def check_url(url):
    headers = {"x-apikey": API_KEY}
    
    try:
        #API SCAN URL
        response = requests.post(
            "https://www.virustotal.com/api/v3/urls",
            headers=headers,
            data={"url": url}
        )
        response.raise_for_status()
        analysis_id = response.json()["data"]["id"]

        #REPORTS
        report_url = f"https://www.virustotal.com/api/v3/analyses/{analysis_id}"
        report = requests.get(report_url, headers=headers)
        report.raise_for_status()
        
        stats = report.json()["data"]["attributes"]["stats"]
        malicious = stats["malicious"]
        suspicious = stats["suspicious"]
        total_engines = stats["harmless"] + stats["undetected"] + malicious + suspicious

        print(f"\n 🔍 Results for: {url} 🔍")
        print(f"  - Scanned by {total_engines} security engines")
        print(f"  - Malicious: {malicious}, Suspicious: {suspicious}")

        if malicious + suspicious > 0:
            print("❌ WARNING: Phishing/malware detected! ❌")
            return False
        else:
            print("✅ URL is safe. ✅")
            return True

    except requests.exceptions.RequestException as e:
        print(f"⚠️ API Error: {e} ⚠️")
        return False

if __name__ == "__main__":
    url = input("Enter URL to check: ").strip()
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url
    
    if check_url(url):
        print("Proceed with caution.")
    else:
        print("BLOCKED: Potential threat detected.")