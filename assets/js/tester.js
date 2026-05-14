const apiGrid =
  document.getElementById("apiGrid")

const modal =
  document.getElementById("testerModal")

let allEndpoints = []

async function loadEndpoints(){

  const response =
    await fetch(
      "/data/endpoints.json"
    )

  allEndpoints =
    await response.json()

  renderEndpoints(allEndpoints)

}

function renderEndpoints(data){

  apiGrid.innerHTML = ""

  data.forEach(endpoint=>{

    const card =
      document.createElement("div")

    card.className =
      "api-card"

    card.dataset.category =
      endpoint.category

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

    card
      .querySelector(".try-btn")
      .onclick = ()=>{

      openTester(endpoint)

    }

    apiGrid.appendChild(card)

  })

}

function openTester(data){

  modal.style.display = "flex"

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

  document
    .getElementById("closeTester")
    .onclick = ()=>{

    modal.style.display = "none"

  }

  document
    .querySelector(".tester-overlay")
    .onclick = ()=>{

    modal.style.display = "none"

  }

  document
    .getElementById("executeBtn")
    .onclick = async ()=>{

    const value =
      document
        .getElementById("testerInput")
        .value

    const responseBox =
      document.getElementById(
        "testerResponse"
      )

    responseBox.innerHTML =
      `<div class="loader"></div>`

    try{

      const url =
        data.endpoint +
        encodeURIComponent(value)

      if(data.type === "audio"){

        responseBox.innerHTML = `

        <audio controls autoplay style="width:100%;">
          <source src="${url}">
        </audio>

        `

        return

      }

      if(data.type === "image"){

        responseBox.innerHTML = `

        <img
          src="${url}"
          style="
            width:100%;
            border-radius:20px;
          "
        >

        `

        return

      }

      const response =
        await fetch(url)

      const json =
        await response.json()

      responseBox.innerHTML = `
<pre>${JSON.stringify(json,null,2)}</pre>
      `

    }catch(err){

      responseBox.innerHTML = `
<pre>${err.message}</pre>
      `

    }

  }

}

const searchInput =
  document.getElementById("searchInput")

searchInput.addEventListener("input",()=>{

  const value =
    searchInput.value.toLowerCase()

  const filtered =
    allEndpoints.filter(item=>{

      return (
        item.name.toLowerCase().includes(value) ||
        item.description.toLowerCase().includes(value)
      )

    })

  renderEndpoints(filtered)

})

document
  .querySelectorAll(".sidebar-item")
  .forEach(button=>{

  button.onclick = ()=>{

    const category =
      button.dataset.category

    if(category === "all"){

      renderEndpoints(allEndpoints)

      return

    }

    const filtered =
      allEndpoints.filter(item=>{

        return item.category === category

      })

    renderEndpoints(filtered)

  }

})

const sidebar =
  document.getElementById("sidebar")

const overlay =
  document.getElementById("sidebarOverlay")

const menuBtn =
  document.getElementById("menuBtn")

menuBtn.onclick = ()=>{

  sidebar.classList.toggle("active")
  overlay.classList.toggle("active")

}

overlay.onclick = ()=>{

  sidebar.classList.remove("active")
  overlay.classList.remove("active")

}

document
  .getElementById("themeToggle")
  .onclick = ()=>{

  document.body.classList.toggle(
    "light-theme"
  )

}

loadEndpoints()