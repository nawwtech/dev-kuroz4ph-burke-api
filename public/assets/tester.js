window.addEventListener("DOMContentLoaded", async ()=>{

const apiGrid = document.getElementById("apiGrid")
const modal = document.getElementById("testerModal")
const searchInput = document.getElementById("searchInput")
const sidebar = document.getElementById("sidebar")
const overlay = document.getElementById("sidebarOverlay")
const menuBtn = document.getElementById("menuBtn")
const themeToggle = document.getElementById("themeToggle")
const toast = document.getElementById("toast")

let allEndpoints = []

// =========================
// LOAD ENDPOINTS
// =========================

async function loadEndpoints(){

  try{

    const req =
      await fetch("/data/endpoints.json")

    const data =
      await req.json()

    allEndpoints = data

    renderEndpoints(data)

    // realtime count

    const apiCount =
      document.getElementById("apiCount")

    if(apiCount){

      apiCount.innerText =
        data.length

    }

  }catch(err){

    console.log(err)

  }

}

// =========================
// TOAST
// =========================

function showToast(text){

  toast.innerText = text

  toast.classList.add("show")

  setTimeout(()=>{

    toast.classList.remove("show")

  },2200)

}

// =========================
// RENDER ENDPOINTS
// =========================

function renderEndpoints(data){

  apiGrid.innerHTML = ""

  if(data.length < 1){

    apiGrid.innerHTML = `

      <div class="empty-state">
        Endpoint not found.
      </div>

    `

    return

  }

  data.forEach(api=>{

    const card =
      document.createElement("div")

    card.className = "api-card"

    card.innerHTML = `

      <div class="card-glow"></div>

      <div class="latency">
        ${Math.floor(Math.random()*80)+20}ms
      </div>

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
        Execute API
      </button>

      <button class="copy-btn">
        Copy Endpoint
      </button>

    `

    // =========================
    // EXECUTE BUTTON
    // =========================

    const executeButton =
      card.querySelector(".try-btn")

    executeButton.addEventListener("click",()=>{

      openTester(api)

    })

    // =========================
    // COPY BUTTON
    // =========================

    const copyBtn =
      card.querySelector(".copy-btn")

    copyBtn.onclick = async ()=>{

      try{

        await navigator.clipboard.writeText(
          api.endpoint + api.param
        )

        showToast(
          "Endpoint copied successfully."
        )

      }catch(err){

        console.log(err)

      }

    }

    apiGrid.appendChild(card)

  })

}

// =========================
// OPEN TESTER
// =========================

function openTester(api){

  modal.style.display = "flex"

  modal.innerHTML = `

  <div class="tester-overlay"></div>

  <div class="tester-box">

    <div class="tester-top">

      <div>

        <span class="tester-badge">
          ${api.method}
        </span>

        <h2>
          ${api.name}
        </h2>

      </div>

      <button id="closeTester">
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

  const closeBtn =
    document.getElementById("closeTester")

  const executeBtn =
    document.getElementById("executeBtn")

  const testerOverlay =
    document.querySelector(".tester-overlay")

  const testerInput =
    document.getElementById("testerInput")

  // =========================
  // CLOSE MODAL
  // =========================

  closeBtn.onclick = ()=>{

    modal.style.display = "none"

  }

  testerOverlay.onclick = ()=>{

    modal.style.display = "none"

  }

  // =========================
  // ENTER EXECUTE
  // =========================

  testerInput.addEventListener("keydown",(event)=>{

    if(event.key === "Enter"){

      executeBtn.click()

    }

  })

  // =========================
  // EXECUTE API
  // =========================

  executeBtn.onclick = async ()=>{

    const input =
      testerInput.value.trim()

    const responseBox =
      document.getElementById("testerResponse")

    if(!input){

      responseBox.innerHTML = `
<pre>Parameter required.</pre>
      `

      return

    }

    responseBox.innerHTML = `
<div class="loader"></div>
    `

    try{

      const url =
        api.endpoint +
        encodeURIComponent(input)

      // =========================
      // AUDIO
      // =========================

      if(api.type === "audio"){

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

      // =========================
      // IMAGE
      // =========================

      if(api.type === "image"){

        responseBox.innerHTML = `

<img
  src="${url}"
  style="
    width:100%;
    border-radius:18px;
  "
>

        `

        return

      }

      // =========================
      // JSON
      // =========================

      const req =
        await fetch(url)

      const json =
        await req.json()

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

// =========================
// SEARCH
// =========================

searchInput.addEventListener("input",()=>{

  const value =
    searchInput.value
      .toLowerCase()
      .trim()

  if(!value){

    renderEndpoints(allEndpoints)

    return

  }

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

})

// =========================
// SIDEBAR FILTER
// =========================

document.addEventListener("click",(e)=>{

  const button =
    e.target.closest(".sidebar-item")

  if(!button) return

  const category =
    button.dataset.category

  // active sidebar

  document
    .querySelectorAll(".sidebar-item")
    .forEach(item=>{

      item.classList.remove("active-sidebar")

    })

  button.classList.add("active-sidebar")

  // render

  if(category === "all"){

    renderEndpoints(allEndpoints)

  }else{

    const filtered =
      allEndpoints.filter(api=>{

        return api.category === category

      })

    renderEndpoints(filtered)

  }

  // auto close sidebar

  sidebar.classList.remove("active")
  overlay.classList.remove("active")

})

// =========================
// SIDEBAR
// =========================

menuBtn.onclick = ()=>{

  sidebar.classList.toggle("active")
  overlay.classList.toggle("active")

}

overlay.onclick = ()=>{

  sidebar.classList.remove("active")
  overlay.classList.remove("active")

}

// =========================
// THEME
// =========================

themeToggle.onclick = ()=>{

  document.body.classList.toggle("light-theme")

}

// =========================
// INIT
// =========================

await loadEndpoints()

})