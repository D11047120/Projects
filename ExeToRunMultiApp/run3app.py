import subprocess

apps = ["C:\\Program Files\\BakkesMod\\BakkesMod.exe",
        "C:\\Users\\Didasz\\Desktop\\ds4\\DS4Windows\\DS4Windows.exe",
        "D:\\steam\\steamapps\\common\\rocketleague\\Binaries\\Win64\\RocketLeague.exe"]  

try:
    for i in apps:
        print(f"Launching {i}...")
        subprocess.Popen(i)
except FileNotFoundError as e:
    print(f"Error: Application not found. Details: {e}")
except Exception as e:
    print(f"An error occurred: {e}")