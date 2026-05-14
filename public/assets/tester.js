window.onload = async ()=>{

const apiGrid =
  document.getElementById("apiGrid")

const modal =
  document.getElementById("testerModal")

const searchInput =
  document.getElementById("searchInput")

const sidebar =
  document.getElementById("sidebar")

const overlay =
  document.getElementById("sidebarOverlay")

const menuBtn =
  document.getElementById("menuBtn")

const themeToggle =
  document.getElementById("themeToggle")

const sidebarButtons =
  document.querySelectorAll(".sidebar-item")

let allEndpoints = []

async function loadEndpoints(){

  const req =
    await fetch("/data/endpoints.json")

  const data =
    await req.json()

  allEndpoints = data

  renderEndpoints(data)

}

function renderEndpoints(data){

  apiGrid.innerHTML = ""

  data.forEach(api=>{

    const card =
      document.createElement("div")

    card.className =
      "api-card"

    card.innerHTML = `

      <div class="method">
        ${api.method}
      </div>

      <h3>
        ${api.name}
      </h3>

      <p>
        ${api.description}
      </p>

      <div class="endpoint">
        ${api.endpoint}${api.param}
      </div>

      <button class="try-btn">
        Try Endpoint
      </button>

    `

    card
      .querySelector(".try-btn")
      .onclick = ()=>{

      openTester(api)

    }

    apiGrid.appendChild(card)

  })

}

function openTester(api){

  modal.style.display =
    "flex"

  modal.innerHTML = `

  <div class="tester-overlay"></div>

  <div class="tester-box">

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
    ">

      <h2>
        ${api.name}
      </h2>

      <button
        id="closeTester"
        style="
          border:none;
          background:none;
          color:white;
          font-size:26px;
          cursor:pointer;
        "
      >
        ✕
      </button>

    </div>

    <input
      type="text"
      id="testerInput"
      placeholder="${api.param}"
    >

    <button id="executeBtn">
      Execute Endpoint
    </button>

    <div id="testerResponse">
      Response will appear here...
    </div>

  </div>

  `

  document
    .getElementById("closeTester")
    .onclick = ()=>{

    modal.style.display = "none"

  }

}

searchInput.oninput = ()=>{

  const value =
    searchInput.value
      .toLowerCase()

  const filtered =
    allEndpoints.filter(api=>{

      const target = `

        ${api.name}
        ${api.description}
        ${api.category}
        ${api.endpoint}

      `
      .toLowerCase()

      return target.includes(value)

    })

  renderEndpoints(filtered)

}

sidebarButtons.forEach(btn=>{

  btn.onclick = ()=>{

    const category =
      btn.dataset.category

    if(category === "all"){

      renderEndpoints(allEndpoints)

      return

    }

    const filtered =
      allEndpoints.filter(api=>{

        return (
          api.category === category
        )

      })

    renderEndpoints(filtered)

  }

})

menuBtn.onclick = ()=>{

  sidebar.classList.toggle("active")

  overlay.classList.toggle("active")

}

overlay.onclick = ()=>{

  sidebar.classList.remove("active")

  overlay.classList.remove("active")

}

themeToggle.onclick = ()=>{

  document.body.classList.toggle(
    "light-theme"
  )

}

await loadEndpoints()

}