import sys
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "report"))
from update_report import update_report

DRIVER_PATH = Path(__file__).resolve().parents[1] / "utils" / "msedgedriver.exe"
LOGIN_URL = "http://localhost:5173/#/login"
DASHBOARD_URL = "http://localhost:5173/#/dashboard"
TS = "TS-001"


def login(identifier, password):
    driver = webdriver.Edge(service=Service(str(DRIVER_PATH)))
    driver.get(LOGIN_URL)
    driver.find_element(By.ID, "input-identifier").send_keys(identifier)
    driver.find_element(By.ID, "input-password").send_keys(password)
    driver.find_element(By.ID, "btn-submit").click()
    return driver


def run_case(tc, identifier, password, check, pass_msg, fail_msg, location):
    driver = login(identifier, password)
    try:
        check(driver)
        status, actual = "Pass", pass_msg
    except Exception:
        status, actual = "Fail", f"{fail_msg} Current URL: {driver.current_url}"
    finally:
        driver.quit()
    update_report(TS, tc, actual, status, location)
    print(f"{TS}/{tc} {status.upper()}: {actual}")


def expect_dashboard(driver):
    WebDriverWait(driver, 10).until(EC.url_contains("/#/dashboard"))


def expect_stay_on_login(driver):
    time.sleep(3)  # give the API call time to respond before checking
    assert "/#/dashboard" not in driver.current_url
    assert "/#/login" in driver.current_url


run_case(
    "TC-001", "rodzgoodboi", "pass1234", expect_dashboard,
    "User logged in successfully and was redirected to the dashboard.",
    "User was not redirected to the dashboard after login.",
    f"{LOGIN_URL} -> {DASHBOARD_URL}",
)


run_case(
    "TC-002", "alkem@gmail.com", "wrong-password", expect_stay_on_login,
    "Login was rejected and the user stayed on the login page.",
    "Invalid credentials were not rejected as expected.",
    LOGIN_URL,
)