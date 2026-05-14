document.addEventListener(
  "DOMContentLoaded",
  ()=>{

// =======================
// ELEMENTS
// =======================

const apiGrid =
  document.getElementById(
    "apiGrid"
  )

const modal =
  document.getElementById(
    "testerModal"
  )

const searchInput =
  document.getElementById(
    "searchInput"
  )

const sidebar =
  document.getElementById(
    "sidebar"
  )

const overlay =
  document.getElementById(
    "sidebarOverlay"
  )

const menuBtn =
  document.getElementById(
    "menuBtn"
  )

const themeToggle =
  document.getElementById(
    "themeToggle"
  )

let allEndpoints = []

// =======================
// LOAD ENDPOINTS
// =======================

async function loadEndpoints(){

  try{

    const response =
      await fetch(
        "/data/endpoints.json"
      )

    const data =
      await response.json()

    allEndpoints = data

    renderEndpoints(data)

  }catch(err){

    console.log(
      "Failed load endpoints:",
      err
    )

  }

}

// =======================
// RENDER ENDPOINTS
// =======================

function renderEndpoints(data){

  apiGrid.innerHTML = ""

  if(!data.length){

    apiGrid.innerHTML = `

    <div style="
      width:100%;
      padding:40px;
      text-align:center;
      color:var(--muted);
      font-weight:600;
    ">
      Endpoint not found
    </div>

    `

    return

  }

  data.forEach(endpoint=>{

    const card =
      document.createElement(
        "div"
      )

    card.className =
      "api-card"

    card.innerHTML = `

      <div class="method">
        ${endpoint.method}
      </div>

      <h3>
        ${endpoint.name}
      </h3>

      <p>
        ${endpoint.description}
      </p>

      <div class="endpoint">
        ${endpoint.endpoint}${endpoint.param}
      </div>

      <button class="try-btn">
        Try Endpoint
      </button>

    `

    const tryBtn =
      card.querySelector(
        ".try-btn"
      )

    tryBtn.addEventListener(
      "click",
      ()=>{

        openTester(endpoint)

      }
    )

    apiGrid.appendChild(card)

  })

}

// =======================
// OPEN TESTER
// =======================

function openTester(data){

  modal.style.display =
    "flex"

  modal.innerHTML = `

  <div class="tester-overlay"></div>

  <div class="tester-box">

    <div class="tester-header">

      <h2>
        ${data.name}
      </h2>

      <button id="closeTester">
        ✕
      </button>

    </div>

    <input
      type="text"
      id="testerInput"
      placeholder="${data.param}"
    >

    <button id="executeBtn">
      Execute Endpoint
    </button>

    <div id="testerResponse">
      Response will appear here...
    </div>

  </div>

  `

  const closeTester =
    document.getElementById(
      "closeTester"
    )

  const executeBtn =
    document.getElementById(
      "executeBtn"
    )

  const testerOverlay =
    document.querySelector(
      ".tester-overlay"
    )

  closeTester.onclick = ()=>{

    modal.style.display =
      "none"

  }

  testerOverlay.onclick = ()=>{

    modal.style.display =
      "none"

  }

  executeBtn.onclick =
    async ()=>{

    const value =
      document
        .getElementById(
          "testerInput"
        )
        .value
        .trim()

    const responseBox =
      document.getElementById(
        "testerResponse"
      )

    if(!value){

      responseBox.innerHTML = `

      <pre>
Please input parameter
      </pre>

      `

      return

    }

    responseBox.innerHTML = `

    <div class="loader"></div>

    `

    try{

      const url =
        data.endpoint +
        encodeURIComponent(
          value
        )

      // =======================
      // AUDIO
      // =======================

      if(
        data.type === "audio"
      ){

        responseBox.innerHTML = `

        <audio
          controls
          autoplay
          style="
            width:100%;
            margin-top:10px;
          "
        >
          <source src="${url}">
        </audio>

        `

        return

      }

      // =======================
      // IMAGE
      // =======================

      if(
        data.type === "image"
      ){

        responseBox.innerHTML = `

        <img
          src="${url}"
          style="
            width:100%;
            border-radius:20px;
            margin-top:10px;
          "
        >

        `

        return

      }

      // =======================
      // JSON
      // =======================

      const response =
        await fetch(url)

      const json =
        await response.json()

      responseBox.innerHTML = `
<pre>${JSON.stringify(
  json,
  null,
  2
)}</pre>
      `

    }catch(err){

      responseBox.innerHTML = `
<pre>${err.message}</pre>
      `

    }

  }

}

// =======================
// SEARCH
// =======================

function handleSearch(){

  const value =
    searchInput.value
      .toLowerCase()
      .trim()

  if(!value){

    renderEndpoints(
      allEndpoints
    )

    return

  }

  const filtered =
    allEndpoints.filter(item=>{

      return (

        item.name
          .toLowerCase()
          .includes(value)

        ||

        item.description
          .toLowerCase()
          .includes(value)

        ||

        item.category
          .toLowerCase()
          .includes(value)

        ||

        item.endpoint
          .toLowerCase()
          .includes(value)

      )

    })

  renderEndpoints(filtered)

}

searchInput.addEventListener(
  "input",
  handleSearch
)

// =======================
// SIDEBAR FILTER
// =======================

document
  .querySelectorAll(
    ".sidebar-item"
  )
  .forEach(button=>{

  button.addEventListener(
    "click",
    ()=>{

      const category =
        button.dataset.category

      if(
        category === "all"
      ){

        renderEndpoints(
          allEndpoints
        )

        return

      }

      const filtered =
        allEndpoints.filter(item=>{

          return (
            item.category ===
            category
          )

        })

      renderEndpoints(
        filtered
      )

    }
  )

})

// =======================
// SIDEBAR TOGGLE
// =======================

menuBtn.onclick = ()=>{

  sidebar.classList.toggle(
    "active"
  )

  overlay.classList.toggle(
    "active"
  )

}

overlay.onclick = ()=>{

  sidebar.classList.remove(
    "active"
  )

  overlay.classList.remove(
    "active"
  )

}

// =======================
// THEME TOGGLE
// =======================

themeToggle.onclick = ()=>{

  document.body.classList.toggle(
    "light-theme"
  )

}

// =======================
// INIT
// =======================

loadEndpoints()

})