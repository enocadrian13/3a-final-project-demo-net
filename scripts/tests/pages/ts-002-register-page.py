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
REGISTER_URL = "http://localhost:5173/#/register"
TS = "TS-002"

def register(name, username, email, password, confirm):
    driver = webdriver.Edge(service=Service(str(DRIVER_PATH)))
    driver.get(REGISTER_URL)
    driver.find_element(By.ID, "input-name").send_keys(name)
    driver.find_element(By.ID, "input-username").send_keys(username)
    driver.find_element(By.ID, "input-email").send_keys(email)
    driver.find_element(By.ID, "input-password").send_keys(password)
    driver.find_element(By.ID, "input-confirm").send_keys(confirm)
    driver.find_element(By.ID, "input-terms").click()
    driver.find_element(By.ID, "btn-submit").click()
    return driver    

def login(identifier, password):
    driver = webdriver.Edge(service=Service(str(DRIVER_PATH)))
    driver.get(LOGIN_URL)
    driver.find_element(By.ID, "input-identifier").send_keys(identifier)
    driver.find_element(By.ID, "input-password").send_keys(password)
    driver.find_element(By.ID, "btn-submit").click()
    return driver

def get_messages(driver):
    """Return the validation errors and toast text shown on the page, if any."""
    def read(d):
        texts = [e.text.strip() for e in d.find_elements(By.CSS_SELECTOR, ".field-error, .toast") if e.text.strip()]
        return texts or False
    try:
        return " | ".join(WebDriverWait(driver, 5).until(read))
    except Exception:
        return ""

def run_case(tc, name, username, email, password,confirm, check, pass_msg, fail_msg, location):
    driver = register(name, username, email, password,confirm)
    messages = get_messages(driver)
    try:
        check(driver)
        status, actual = "Pass", pass_msg
    except Exception:
        status, actual = "Fail", f"{fail_msg} Current URL: {driver.current_url}"
    finally:
        driver.quit()
    if messages:
        actual += f'. Error message: "{messages}"'
    update_report(TS, tc, actual, status, location)
    print(f"{TS}/{tc} {status.upper()}: {actual}")

def expect_login(driver):
    WebDriverWait(driver, 10).until(EC.url_contains("/#/login"))

def expect_register(driver):
    WebDriverWait(driver, 10).until(EC.url_contains("/#/register"))

def expect_dashboard(driver):
    WebDriverWait(driver, 10).until(EC.url_contains("/#/dashboard"))

def expect_stay_on_login(driver):
    time.sleep(3)  # give the API call time to respond before checking
    assert "/#/dashboard" not in driver.current_url
    assert "/#/login" in driver.current_url

def expect_stay_on_register(driver):
    time.sleep(3)  # give the app time to react before checking
    assert "/#/register" in driver.current_url
    assert "/#/login" not in driver.current_url

# TC-003
run_case(
    "TC-003", "rodz", "rodzgoodboi", "rodz@gmail.com", "pass1234", "pass1234", expect_login,
    "User was successfully created and was redirected to the login page",
    "User was not redirected to the login page",
    f"{REGISTER_URL} -> {LOGIN_URL}"
)

# TC-004
run_case(
    "TC-004", "rodz", "rodzgoodboi", "ssss", "pass1234", "pass1234", expect_stay_on_register,
    "User was not successfully created due to incorrect email format",
    "User was successfully created or left the register page with an invalid email",
    REGISTER_URL
)

# TC-005
run_case(
    "TC-005", "rodz", "rodzgoodboi", "rodz@gmail.com", "pass1234", "pass1234", expect_stay_on_register,
    "User was not successfully created due to duplicate record",
    "User was successfully created or left the register page with a duplicate record",
    REGISTER_URL
)


# TC-006
run_case(
    "TC-006", "rodz", "rodzgoodboi", "rodz6@gmail.com", "pass123", "pass123", expect_stay_on_register,
    "User was not successfully created due to a password shorter than 8 characters",
    "User was successfully created or left the register page with a short password",
    REGISTER_URL
)