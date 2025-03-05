window.onload = () => {
  let db;
  let settings = {
    minPrice: null,
    maxPrice: null,
    amount: null,
    categories: [],
    googleSheetsSettings: false,
    finished: false,
    timesToBrowserTabReload: 200,
    secondsToRestartIfNoTicketsFound: 15
  };

  let UI = {
    __settingsHTML: `<div class="tickets tickets_popup_wrapper">
        <div class="tickets tickets_popup">
          <h1 class="tickets tickets_h1">Налаштування</h1>
    
          <h2 class="tickets tickets_h2">Квитки</h2>
    
          <span class="tickets tickets_title">Ціна:</span>
    
          <input type="number" name="minimum_price" placeholder="Мінамальна" class="tickets tickets_input">
          —
          <input type="number" name="maximum_price" placeholder="Максимальна" class="tickets tickets_input">
          <br>

          <div class="ticket_amount-container">
            <span class="tickets tickets_title">Кількість:</span>
              <div class="tickets_select" data-select="count">
                <div class="tickets tickets_selector" data-value="1">1</div>
                <div class="tickets tickets_selector" data-value="2">2</div>
                <div class="tickets tickets_selector" data-value="3">3</div>
                <div class="tickets tickets_selector" data-value="4">4</div>
                <div class="tickets tickets_selector" data-value="5">5</div>
                <div class="tickets tickets_selector tickets_selector_selected" data-value="6">6</div>
              </div>
          </div>
    
          <br>

          <hr class="tickets tickets_hr">

          <h2 class="tickets tickets_h2">Посилання на таблицю:</h2>
          <input type="text" placeholder="https://docs.google.com/spreadsheets/d/1TFE2R..." name="settings"class="tickets_input">
    
          <hr class="tickets tickets_hr">
    
          <h2 class="tickets tickets_h2">Інтервал оновлення</h2>
          <input type="number" name="interval" placeholder="Секунды" class="tickets_input" value="15">
          <span class="tickets_notice">Оптимальний час: 15 сек</span>


          <br><br>
    
          <button class="tickets tickets_button" id="tickets_cancel">Назад</button>
          <button class="tickets tickets_button tickets_button_colored" id="tickets_start">Оновити налаштування</button>
        </div>
      </div>`,
    __settingsCSS: `.tickets {
    font-family: 'Calibri';
    }

    .tickets_popup_wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba( 0, 0, 0, .5 );
    overflow: auto;
    z-index: 1000;
    display: none;
    }
    
    .tickets_data {
    display:block;
    }
    
    .tickets_data input {
    margin-right: 5px;
    }

    .tickets_popup {
    width: 500px;
    padding: 15px;
    box-sizing: border-box;
    margin: 50px auto;
    background: #fff;
    border-radius: 4px;
    position: relative;
    }

    .tickets_h1, .tickets_h2 {
    margin: 5px 0;
    font-weight: bold;
    }

    .tickets_h1 {
    font-size: 30px;
    }

    .tickets_h2 {
    font-size: 24px;
    }

    .tickets_select {
        display: inline-block;
    }

    .tickets_selector {
    margin: 3px 0;
    padding: 5px 15px;
    border: 1px solid #999;
    display: inline-block;
    border-radius: 4px;
    cursor: pointer;
    color: #555;
    }

    .tickets_selector:hover {
    background: rgba( 0, 0, 0, 0.05 );
    }

    .tickets_selector_selected {
    color: #000;
    font-weight: bold;
    border: 1px solid #2482f1;
    }

    .category_selector {
    margin: 3px 0;
    padding: 5px 15px;
    border: 1px solid #999;
    display: inline-block;
    border-radius: 4px;
    cursor: pointer;
    color: #555;
    }

    .category_selector:hover {
    background: rgba( 0, 0, 0, 0.05 );
    }

    .category_selector_selected {
    color: #000;
    font-weight: bold;
    border: 1px solid #2482f1;
    }

    .tickets_hr {
    width: 50%;
    border: 0;
    height: 1px;
    background: #aaa;
    margin: 10px auto;
    }

    .tickets_input {
    margin: 3px 0;
    padding: 5px 15px;
    border-radius: 4px;
    border: 1px solid #999;
    font-size: 16px;
    font-family: 'Calibri';
    outline: none;
    }

    .tickets_input:focus {
        border: 1px solid #2482f1;
    }

    .tickets_title {
    margin-right: 10px;
    }

    .tickets_button {
    padding: 5px 15px;
    border: 1px solid #aaa;
    border-radius: 4px;
    font-family: 'Calibri';
    font-size: 16px;
    cursor: pointer;
    }

    .tickets_button_colored {
    font-weight: bold;
    background: #2482f1;
    border: 1px solid #2482f1;
    color: #fff;
    }

    .tickets_notice {
        color: #555;
    }

    .settings-info{
      position: fixed;
      bottom: 15px;
      right: 15px;
      padding: 15px;
      background: #2482f1;
      color: #fff;
      width: 200px;
    }

    .madridista-container {
        display: none;
    }

    .madridista-field {
        display: flex;
        width: 275px;
        justify-content: space-between;
        margin-bottom: 10px;
        align-items: center;
    }

    .add_account {
      display: none;
    }

    .checkbox_field {
        display: flex;
        width: 150px;
        justify-content: space-between;
    }`,
    __settingsInfoCSS: `.settings-info{
      position: fixed;
      bottom: 15px;
      left: 15px;
      padding: 15px;
      background: #139df4;
      color: #fff;
      width: 300px;
      border-radius: 5px;
    }
    .settings-info p{
      font-family: 'Calibri';
      margin-bottom: 0;
    }`,
    __infoHTML: `<div class="settings-info" id="settings-info"></div>`,
    init: function () {
      console.log('in init')
      
      document.body.innerHTML += UI.__settingsHTML

      let style = document.createElement( 'style' );
      style.innerText = UI.__settingsCSS;

      document.head.appendChild( style );
    
      // inject HTML
      const container = document.createElement('div');
      container.id = 'settingsFormContainer';
      
      container.innerHTML = UI.__settingsHTML
      
      
      document.body.appendChild(container);

      let minimum_price = document.querySelector('body > .tickets_popup_wrapper input[name="minimum_price"]')
      minimum_price.value = settings.minPrice ?? '';
      let maximum_price = document.querySelector('body > .tickets_popup_wrapper input[name="maximum_price"]')
      maximum_price.value = settings.maxPrice ?? '';
      document.querySelector('body > .tickets_popup_wrapper input[name="interval"]').value = settings.secondsToRestartIfNoTicketsFound || 15;
      document.querySelector('body > .tickets_popup_wrapper input[name="settings"]').value = settings.googleSheetsSettings ? settings.googleSheetsSettings : '';
      let tickets = document.getElementsByClassName( 'tickets_selector' );
      if (settings.amount) {
        
        // Remove the selected class from all tickets first
        Array.from(tickets).forEach((tempTicket) => tempTicket.classList.remove('tickets_selector_selected'));
    
        // Loop through tickets and add the class if it matches the amount
        for (let ticket of tickets) {
            if (ticket.getAttribute('data-value') == settings.amount) {
                ticket.classList.add('tickets_selector_selected');
                break;  // Exit the loop once we find and modify the correct ticket
            }
        }
      }

      for ( var i = 0; i < tickets.length; i++ ) {
        tickets[i].onclick = function() {
            UI.select( this );
        }
      }

      if (settings.googleSheetsSettings) {
        Array.from(tickets).forEach((tempTicket) => tempTicket.classList.remove('tickets_selector_selected'));
        maximum_price.value = '';
        minimum_price.value = '';
      }

      let cancel_button = document.getElementById( 'tickets_cancel' );
      cancel_button.onclick = UI.closePopup;

      let start_button = document.getElementById( 'tickets_start' );
      start_button.onclick = updateSettings;
      let wrapper = document.getElementsByClassName( 'tickets_popup_wrapper' )[0];
      
      wrapper.onclick = function ( event ) {
          if ( event.target.classList.contains( 'tickets_popup_wrapper' ) ) UI.closePopup();
      }
    },
    
    openPopup: function () {
      let el = document.getElementsByClassName( 'tickets_popup_wrapper' )[0];
        el.style.display = 'block';
        document.body.style.overflow = 'hidden';
    },

    closePopup: function () {
      let el = document.getElementsByClassName( 'tickets_popup_wrapper' )[0];
        el.style.display = 'none';
        document.body.style.overflow = 'auto';
    },

    addTicket: function (type, name, placeholder, width, value=null) {
      let input = document.createElement('input');
      input.type = type;
      input.name = name;
      input.placeholder = placeholder;
      input.className = 'tickets tickets_input';
      input.style.width = `${width}%`;
      input.value = value;
      
      return input;
    },

    addAccount: function () {
      // Initialize and increment the attendant counter
      this.attendantCounter = (this.attendantCounter || 0) + 1;
      const attendantNumber = this.attendantCounter;
    
      const createInputField = (name, labelText) => {
        const field = document.createElement('div');
        field.classList.add('madridista-field');
        
        const label = document.createElement('label');
        label.htmlFor = name;
        label.textContent = `${labelText}: `;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.name = name;
        input.classList.add('tickets_input');
        
        field.append(label, input);
        return field;
      };
    
      const container = document.createElement('div');
      container.classList.add('madridista-fields');
    
      // Add attendant label
      const attendantSpan = document.createElement('span');
      attendantSpan.classList.add('tickets');
      attendantSpan.classList.add('tickets_title');
      attendantSpan.textContent = `Attendant ${attendantNumber}`;
      container.appendChild(attendantSpan);
    
      container.appendChild(createInputField('login', 'Login'));
      container.appendChild(createInputField('password', 'Password'));
      container.appendChild(document.createElement('br'))
      return container;
    },

    select: function ( el ) {
        let parent = el.parentNode;
        let els = parent.getElementsByClassName( 'tickets_selector' );

        for ( let i = 0; i < els.length; i++ ) {
            els[i].classList.remove( 'tickets_selector_selected' );
        }

        el.classList.add( 'tickets_selector_selected' );
    },

    categorySelect: function ( el ) {
        if (el.classList.contains( 'category_selector_selected' ) ) {
          el.classList.remove( 'category_selector_selected' );
        } else {
          el.classList.add( 'category_selector_selected' );
        }
    },

    createButton: function ( text, func ) {
        var btn = document.createElement( 'a' );
        btn.className = 'right button button-small button-blue';
        btn.innerHTML = text;
        btn.style.position = 'fixed';
        btn.style.right = '15px';
        btn.style.bottom = '15px';
        btn.style.cursor = 'pointer';
        btn.style.letterSpacing = '1.2px';
        btn.style.fontWeight = '600';

        btn.onclick = function ( e ) {
            e.preventDefault();
            func();
        };

        document.body.appendChild( btn );
    },
  }

  function loadSettings() {
    const transaction = db.transaction("settings", "readonly");
    const store = transaction.objectStore("settings");
    const getRequest = store.get(1);

    getRequest.onsuccess = function (event) {
      const storedSettings = event.target.result;
      if (storedSettings) {
        settings = storedSettings.settings;
        console.log("Loaded settings from IndexedDB:", settings);
      }
      UI.init();
      UI.createButton( 'Налаштування', UI.openPopup );
    };

    getRequest.onerror = function () {
      console.error("Error loading settings from IndexedDB.");
      UI.init();
      UI.createButton( 'Налаштування', UI.openPopup );
    };
  }
  
 /* Database logic */
  function updateSettings() {
    const minPrice = document.querySelector('input[name="minimum_price"]').value
    const maxPrice = document.querySelector('input[name="maximum_price"]').value
    const amount = parseInt(document.querySelector(".tickets_selector_selected")?.getAttribute('data-value'));
    const interval = document.querySelector('input[name="interval"]').value;
    const googleSheetsSettings = document.querySelector('body > .tickets_popup_wrapper input[name="settings"]').value;


    if (minPrice < 0 || maxPrice < 0) {
      alert("Ціна не може бути від'ємною.");
      return;
    }

    if (parseInt(minPrice) > parseInt(maxPrice)) {
      alert("Мінімальна ціна не може бути більшою за максимальну.");
      return;
    }

    if (parseInt(minPrice) === 0 && parseInt(maxPrice) === 0) {
      alert("Ціна не може бути 0.");
      return;
    }

    settings.googleSheetsSettings = googleSheetsSettings;

    if (googleSheetsSettings === '') {
      settings.minPrice = minPrice !== "" ? parseInt(minPrice) : null;
      settings.maxPrice = maxPrice !== "" ? parseInt(maxPrice) : null;
      settings.amount = amount;
    }

    settings.secondsToRestartIfNoTicketsFound = parseInt(interval);

    // settings.selection = parseInt(document.getElementById("selection").value);
    window.stopExecutionFlag = undefined;
    settings.finished = false;
    settings.banned = false;
    saveSettings(); // Save the updated settings to IndexedDB
    window.location.reload()
  }

  function saveSettings() {
    const transaction = db.transaction("settings", "readwrite");
    const store = transaction.objectStore("settings");
    window.stopExecutionFlag = undefined;
    store.put({ id: 1, settings: settings });

    transaction.oncomplete = function () {
      console.log("Settings updated in IndexedDB.");
      const backToMap = document.querySelector('a[id="backToMap1"]');
      if (backToMap) backToMap.click();
    };

    transaction.onerror = function () {
      console.error("Error updating settings in IndexedDB.");
    };
  }

  function init() {
  
    // Open IndexedDB and load stored settings if available
    const request = indexedDB.open("TicketBotDB", 1);
  
    request.onupgradeneeded = function (event) {
      db = event.target.result;
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "id" });
      }
    };
  
    request.onsuccess = function (event) {
      db = event.target.result;
      loadSettings(); // Load settings from IndexedDB on success
      
    };
  
    request.onerror = function () {
      console.error("Error opening IndexedDB.");
    };

    main()
	}


  async function main() {
    console.log("Starting main()");
  
    // Open IndexedDB and check if settings exist.
    try {
      const db = await openDatabase("TicketBotDB", 1);
      if (!db.objectStoreNames.contains("settings")) {
        console.log("Object store 'settings' does not exist – fresh database");
        return;
      }
      const settingsCount = await countObjectStore(db, "settings");
      if (settingsCount === 0) {
        console.log("No settings in database.");
        return;
      }
    } catch (error) {
      console.error("Error accessing IndexedDB:", error);
      _countAndRun();
      return;
    }

    if (location.href.includes("/cart/reservation")) {
      settings.finished = true;
      saveSettings();
    }

    // Exit early if reservations are already finished.
    if (settings.finished) {
      alert("Seats already reserved! Please delete them to start new search!");
      return;
    }

    if (settings.banned) {
      alert("Ваший IP забанений! Змініть проксі та оновіть налаштування щоб знову увімкнути бота.");
      return;
    }

    if (settings.categories.length == 0 && settings.googleSheetsSettings !== '') {
      // setInterval(updateGoogleSheetsSettings, 50000);
      var categories = await receive_sheets_data_main();
      if (categories === null) {
        alert("Error fetching data from Google Sheets.");
        _countAndRun();
        return;
      } else {
        settings.categories = categories;
      }
      saveSettings();
      // location.reload();
    }

    // update google sheets settings on every page reload
    var categories = await receive_sheets_data_main();
    if (categories === null) {
      alert("Error fetching data from Google Sheets.");
    } else {
      settings.categories = categories;
      saveSettings();
    }
    let necessaryGroups = [];
    let ent, maxprc, minprc;
    ({ amount: ent, maxPrice: maxprc, minPrice: minprc } = settings);

    // if user has set amont and price
    if (settings.googleSheetsSettings === '') {
      displayCategoriesInfo([settings]);
      let groups = document.querySelectorAll('.table_container tbody > tr.group_start')
      
      if (!groups) {
        console.log('No tickets found!');
        _countAndRun();
        return;
      }


      let existingGroups = Array.from(groups).filter(group => group.querySelectorAll('td').length > 0);

      while (existingGroups.length > 0) {
        let randomIndex = Math.floor(Math.random() * existingGroups.length);
        let group = existingGroups.splice(randomIndex, 1)[0];

        let groupPrice = parseFloat(group.querySelector('.unit_price > span').textContent);
        if (groupPrice >= minprc && groupPrice <= maxprc) {
          let amount = group.querySelector('.quantity > select')?.options;
          if (!amount) {
            continue;
          }
          let options = Array.from(amount).map(option => option.text);
          if (options.includes(ent.toString())) {
            necessaryGroups.push({group: group, amount: ent});
          }
        } else continue;

        
    }

    // if user has set the link to the google sheet
    } else if (settings.googleSheetsSettings !== '') {
      displayCategoriesInfo(settings.categories);
      let groups = document.querySelectorAll('.table_container tbody > tr.group_start')
      if (!groups) {
        console.log('No tickets found!');
        _countAndRun();
        return;
      }

      let properties = settings.categories.flatMap(category => category.preferences);
      let categoriesNames = settings.categories.map(category => category.category);
      let existingGroups = Array.from(groups).filter(group => group.querySelectorAll('td').length > 0);


      // Randomly shuffle the groups
      while (existingGroups.length > 0) {
        
        let randomIndex = Math.floor(Math.random() * existingGroups.length);
        let group = existingGroups.splice(randomIndex, 1)[0];
        let category = group.querySelector('.category').textContent.trim();
        let matchingCategory = settings.categories.find(cat => cat.category === category);


        // Category and its properties check
        if (categoriesNames.length !== 0) {
          if (!matchingCategory) {
            continue;
          }
          
          // Properties check
          let groupPropertiesNotEmpty = false;
          if (matchingCategory.preferences.length !== 0) {
            if (properties.length === 0) {
              continue;
            } 
            else if (properties.length !== 0 ) {
              let area = group.querySelector('.area > select')?.options;

              if (!area) {
                continue;
              };

              let options = Array.from(area).map(option => matchingCategory.preferences.includes(option.text.trim()) && option.text.trim()).filter(text => text)
              
              for (let option of options) {
                if (matchingCategory.preferences.includes(option)) {
                  groupPropertiesNotEmpty = true;
                  break;
                }
              }
            }
          } else groupPropertiesNotEmpty = true; // If no properties are set in sheets, we can proceed
          console.log('groupPropertiesNotEmpty', groupPropertiesNotEmpty);
          if (!groupPropertiesNotEmpty) {
            continue;
          }
        }

        // Price check
        let priceExists = false;
        if (matchingCategory.minPrice !== undefined  && matchingCategory.maxPrice !== undefined) {
          let price = parseFloat(group.querySelector('.unit_price > span').textContent);
          if (price) {
            if (price >= matchingCategory.minPrice && price <= matchingCategory.maxPrice) {
              priceExists = true;
            }
          }
        } else priceExists = true; // If no price is set in sheets, we can proceed
        if (!priceExists) {
          continue;
        }

        // Amount check
        let amountExists = false;
        if (matchingCategory.amount) {
          let amount = group.querySelector('.quantity > select')?.options;
          if (!amount) {
            continue;
          }
          let options = Array.from(amount).map(option => option.text);
          if (options.includes(matchingCategory.amount.toString())) {
            amountExists = true;
          }
        }
        if (!amountExists) {
          continue;
        }

        necessaryGroups.push({group: group, amount: matchingCategory.amount});
      }
    }
    console.log("NECESSARY GROUPS!!!", necessaryGroups);

    let isGroupSelected = false;
    if (necessaryGroups.length > 0) {
      let randomIndex = Math.floor(Math.random() * necessaryGroups.length);
      let group = necessaryGroups[randomIndex];
      let select = group.group.querySelector('.quantity > select');
      select.value = group.amount;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      isGroupSelected = true;
    }

    let bookButton = document.querySelector('#book');
    if (bookButton) {
      bookButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      bookButton.click();
    }
    _countAndRun();
  }


  async function updateGoogleSheetsSettings() {
    console.log("updateGoogleSheetsSettings call!")
    try {
      settings.categories = [];
      saveSettings();
      console.log("Updated google sheets settings", new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error updating google sheets settings:", error);
    }
  }

  function _countAndRun() {
    console.log('No tickets found!');
    setTimeout(() => {
      location.reload()
    }, settings.secondsToRestartIfNoTicketsFound ? settings.secondsToRestartIfNoTicketsFound * 1000 : 5 * 1000);
  }
  
  /**
   * Opens an IndexedDB database and returns a Promise for the DB instance.
   */
  function openDatabase(name, version) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      request.onsuccess = event => resolve(event.target.result);
      request.onerror = event => reject(event.target.error);
    });
  }
  
  /**
   * Counts records in an object store.
   */
  function countObjectStore(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const objectStore = transaction.objectStore(storeName);
      const countRequest = objectStore.count();
      countRequest.onsuccess = () => resolve(countRequest.result);
      countRequest.onerror = () => reject(countRequest.error);
    });
  }
  init()
}

function displayCategoriesInfo(categories) {
  // Create a container for the information
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '15px';
  container.style.left = '15px';
  container.style.padding = '15px';
  container.style.backgroundColor = '#24305e';
  container.style.color = '#fff';
  container.style.borderRadius = '5px';
  container.style.zIndex = '1000';
  container.style.fontFamily = 'Calibri';
  container.style.fontSize = '16px';

  // Create a title for the container
  const title = document.createElement('h2');
  title.textContent = 'Categories Info';
  title.style.margin = '0 0 10px 0';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  container.appendChild(title);

  // Add each category's information to the container
  categories.forEach(category => {
    const categoryInfo = document.createElement('div');
    categoryInfo.style.marginBottom = '10px';

    const categoryTitle = document.createElement('p');
    if (category?.category) {
      categoryTitle.textContent = `Category: ${category.category}`;
    } else categoryTitle.textContent = `Category: No category specified`;

    categoryTitle.style.margin = '0';
    categoryTitle.style.fontWeight = 'bold';
    categoryInfo.appendChild(categoryTitle);

    if (category?.preferences && category.preferences.length > 0) {
      const preferences = document.createElement('p');
      preferences.textContent = `Preferences: ${category.preferences.join(', ')}`;
      preferences.style.margin = '0';
      categoryInfo.appendChild(preferences);
    }

    if (category.minPrice !== undefined && category.maxPrice !== undefined) {
      const priceRange = document.createElement('p');
      priceRange.textContent = `Price Range: ${category.minPrice} - ${category.maxPrice}`;
      priceRange.style.margin = '0';
      categoryInfo.appendChild(priceRange);
    }

    const amount = document.createElement('p');
    amount.textContent = `Amount: ${category.amount}`;
    amount.style.margin = '0';
    categoryInfo.appendChild(amount);

    container.appendChild(categoryInfo);
  });

  // Append the container to the body
  document.body.appendChild(container);
}


async function receive_sheets_data_main() {
  let SHEET_ID = "19-4B6rG2pJlFEw6JI-CSLu3zQf3OtS2Qt6y2d3cU9E4";
  let SHEET_TITLE = "main";
  let SHEET_RANGE = "A2:D";
  let FULL_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}&range=${SHEET_RANGE}`;

  let categories = [];

  try {
    let res = await fetch(FULL_URL);
    let rep = await res.text();
    let data = JSON.parse(rep.substr(47).slice(0, -2));

    let data_rows = data.table.rows;
    console.log(data_rows);
    for (let data of data_rows) {
      let category = data.c[0]?.v;
      let amount = data.c[3]?.v;

      // Skip rows without category and amount
      if (!category || !amount) {
        return null;
      }

      let price_result = data.c[2]?.v
        ? data.c[2].v.split("-").map((item) => item.trim())
        : [''];
      let minPrice, maxPrice;
      if (price_result[0] !== '') {
        minPrice = parseInt(price_result[0]);
        maxPrice = parseInt(price_result[1]);
      }
      categories.push({
        category: category,
        preferences: data.c[1]?.v ? data.c[1].v.split(',').map((item) => item.trim()) : [],
        minPrice: minPrice,
        maxPrice: maxPrice,
        amount: amount
      });
    }

    return categories;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
