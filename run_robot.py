#!/usr/bin/env python3
"""Runner สำหรับ Robot Framework tests — รัน UI + API suites"""
import subprocess
import sys
import time

def main():
    suites = [
        "robot_tests/01_storefront.robot",
        "robot_tests/02_auth.robot",
        "robot_tests/05_api.robot",
        "robot_tests/03_cart.robot",
        "robot_tests/04_checkout.robot",
    ]
    cmd = [
        "robot",
        "--outputdir", "robot_results",
        "--log", "log.html",
        "--report", "report.html",
        "--xunit", "xunit.xml",
        *suites,
    ]
    print("Running Robot Framework:", " ".join(cmd))
    code = subprocess.call(cmd)
    print(f"\nRobot exit code: {code}")
    sys.exit(code)

if __name__ == "__main__":
    main()
