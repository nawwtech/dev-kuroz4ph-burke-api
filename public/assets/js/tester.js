window.onload = async ()=>{

// ======================
// ELEMENT
// ======================

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

// ======================
// FETCH ENDPOINTS
// ======================

async function loadEndpoints(){

  try{

    const req =
      await fetch("/data/endpoints.json")

    const data =
      await req.json()

    allEndpoints = data

    renderEndpoints(data)

  }catch(err){

    console.log(err)

  }

}

// ======================
// RENDER
// ======================

function renderEndpoints(data){

  apiGrid.innerHTML = ""

  if(data.length < 1){

    apiGrid.innerHTML = `
    
    <div style="
      padding:40px;
      width:100%;
      text-align:center;
    ">
      Endpoint not found
    </div>
    
    `

    return

  }

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

    const tryBtn =
      card.querySelector(".try-btn")

    tryBtn.onclick = ()=>{

      openTester(api)

    }

    apiGrid.appendChild(card)

  })

}

// ======================
// TESTER
// ======================

function openTester(api){

  modal.style.display = "flex"

  modal.innerHTML = `
  
  <div class="tester-overlay"></div>

  <div class="tester-box">

    <div class="tester-header">

      <h2>
        ${api.name}
      </h2>

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

  const closeTester =
    document.getElementById("closeTester")

  const executeBtn =
    document.getElementById("executeBtn")

  const testerOverlay =
    document.querySelector(".tester-overlay")

  closeTester.onclick = ()=>{

    modal.style.display = "none"

  }

  testerOverlay.onclick = ()=>{

    modal.style.display = "none"

  }

  executeBtn.onclick = async ()=>{

    const input =
      document
        .getElementById("testerInput")
        .value

    const responseBox =
      document.getElementById("testerResponse")

    responseBox.innerHTML = `
    
    <div class="loader"></div>
    
    `

    try{

      const url =
        api.endpoint +
        encodeURIComponent(input)

      // AUDIO

      if(api.type === "audio"){

        responseBox.innerHTML = `
        
        <audio
          controls
          autoplay
          style="
            width:100%;
          "
        >
          <source src="${url}">
        </audio>
        
        `

        return

      }

      // IMAGE

      if(api.type === "image"){

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

      // JSON

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

// ======================
// SEARCH
// ======================

searchInput.oninput = ()=>{

  const value =
    searchInput.value
      .toLowerCase()

  if(!value){

    renderEndpoints(allEndpoints)

    return

  }

  const filtered =
    allEndpoints.filter(api=>{

      return (

        api.name
          .toLowerCase()
          .includes(value)

        ||

        api.description
          .toLowerCase()
          .includes(value)

        ||

        api.endpoint
          .toLowerCase()
          .includes(value)

        ||

        api.category
          .toLowerCase()
          .includes(value)

      )

    })

  renderEndpoints(filtered)

}

// ======================
// SIDEBAR FILTER
// ======================

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

// ======================
// SIDEBAR TOGGLE
// ======================

menuBtn.onclick = ()=>{

  sidebar.classList.toggle("active")

  overlay.classList.toggle("active")

}

overlay.onclick = ()=>{

  sidebar.classList.remove("active")

  overlay.classList.remove("active")

}

// ======================
// THEME
// ======================

themeToggle.onclick = ()=>{

  document.body.classList.toggle(
    "light-theme"
  )

}

// ======================
// INIT
// ======================

await loadEndpoints()

}