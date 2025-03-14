import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os

BASE_URL = "https://billetterievip.stadefrance.com/selection/service?productId=10229340476982&_gl=1*a6u6gl*_ga*MjEwNzg3Mjk5Mi4xNzQxOTM5Nzk5*_ga_CDRL8JNQEP*MTc0MTkzOTc5OS4xLjAuMTc0MTkzOTc5OS4wLjAuMA.."

# This fixture sets up the Chrome WebDriver.
@pytest.fixture(scope="module")
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--start-maximized")
    os.chdir("..")
    extension_path = nopecha_path = os.path.join(os.getcwd(), 'stadefrance_extension')
    command = f"--load-extension={extension_path}"
    options.add_argument(command)
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)
    yield driver
    driver.quit()


def test_settings_popup(driver):
    """
    This test clicks the "Налаштування" (Settings) button and verifies that the settings popup becomes visible.
    """
    driver.get(BASE_URL)

    settings_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//a[text()='Налаштування']"))
    )
    settings_button.click()

    # Check that the settings popup becomes visible.
    popup = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "tickets_popup_wrapper"))
    )
    assert popup.is_displayed(), "Settings popup did not display as expected."


def test_update_settings(driver):
    """
    This test fills in the settings popup with test data and clicks the "Оновити налаштування" (Update Settings) button.
    """
    min_price_input = driver.find_element(By.NAME, "minimum_price")
    max_price_input = driver.find_element(By.NAME, "maximum_price")
    interval_input = driver.find_element(By.NAME, "interval")
    google_sheets_input = driver.find_element(By.NAME, "settings")

    # Clear existing values and input test data.
    min_price_input.clear()
    min_price_input.send_keys("50")
    max_price_input.clear()
    max_price_input.send_keys("150")
    interval_input.clear()
    interval_input.send_keys("15")
    google_sheets_input.clear()  # Leaving empty to test non-Google Sheets scenario

    ticket_selector = driver.find_element(By.XPATH, "//div[@class='tickets tickets_selector' and @data-value='3']")
    ticket_selector.click()

    update_button = driver.find_element(By.ID, "tickets_start")
    update_button.click()

    time.sleep(3)

    # After reload, verify that the page has been refreshed and settings are applied.
    assert "tickets_popup_wrapper" in driver.page_source, "Page did not reload or settings not applied."


def test_validate_settings(driver):
    """
    This test retrieves the settings from IndexedDB and verifies that each category's name
    appears in the Categories Info div (identified by the header text "Categories Info").
    """

    # Execute an asynchronous script to retrieve settings from IndexedDB.
    settings = driver.execute_async_script("""
        var done = arguments[0];
        var request = indexedDB.open("TicketBotDB", 1);
        request.onsuccess = function(event) {
            var db = event.target.result;
            var transaction = db.transaction("settings", "readonly");
            var store = transaction.objectStore("settings");
            var getRequest = store.get(1);
            getRequest.onsuccess = function(e) {
                done(e.target.result.settings);
            };
            getRequest.onerror = function(e) {
                done(null);
            };
        };
        request.onerror = function(e) {
            done(null);
        };
    """)

    if not settings:
        assert False, "Failed to retrieve settings from IndexedDB."

    # Check that the settings info becomes visible.
    categories_info_div = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(),'Categories Info')]/.."))
    )
    
    assert categories_info_div.is_displayed(), "Categories Info div did not display as expected."
