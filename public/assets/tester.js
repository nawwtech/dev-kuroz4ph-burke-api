window.addEventListener("DOMContentLoaded", async ()=>{

const apiGrid = document.getElementById("apiGrid")
const modal = document.getElementById("testerModal")
const searchInput = document.getElementById("searchInput")
const sidebar = document.getElementById("sidebar")
const overlay = document.getElementById("sidebarOverlay")
const menuBtn = document.getElementById("menuBtn")
const themeToggle = document.getElementById("themeToggle")
const toast = document.getElementById("toast")
const liveClock = document.getElementById("liveClock")

let allEndpoints = []

// =========================
// LIVE CLOCK
// =========================

function updateClock(){

  if(!liveClock) return

  const now = new Date()

  const time =
    now.toLocaleTimeString("id-ID",{
      hour:"2-digit",
      minute:"2-digit"
    })

  liveClock.innerText = time

}

setInterval(updateClock,1000)

updateClock()

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

      animateCounter(
        apiCount,
        data.length
      )

    }

  }catch(err){

    console.log(err)

  }

}

// =========================
// COUNTER ANIMATION
// =========================

function animateCounter(el,target){

  let current = 0

  const increment =
    Math.ceil(target / 30)

  const interval =
    setInterval(()=>{

      current += increment

      if(current >= target){

        current = target

        clearInterval(interval)

      }

      el.innerText = current

    },25)

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
// FUZZY SEARCH
// =========================

function fuzzyMatch(text,search){

  text = text.toLowerCase()
  search = search.toLowerCase()

  let i = 0

  for(const char of text){

    if(char === search[i]){

      i++

    }

  }

  return i === search.length

}

// =========================
// RENDER ENDPOINTS
// =========================

function renderEndpoints(data){

  apiGrid.innerHTML = ""

  if(data.length < 1){

    apiGrid.innerHTML = `

      <div class="empty-state">

        <h2>
          Endpoint not found.
        </h2>

        <p style="margin-top:10px;">
          Try another keyword.
        </p>

      </div>

    `

    return

  }

  data.forEach((api,index)=>{

    const card =
      document.createElement("div")

    card.className = "api-card"

    card.style.animationDelay =
      `${index * .06}s`

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

  document.body.style.overflow = "hidden"

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

      <div style="
        opacity:.7;
        line-height:1.8;
      ">

        Waiting for request...

      </div>

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

  function closeModal(){

    modal.style.display = "none"

    document.body.style.overflow = ""

  }

  closeBtn.onclick = closeModal

  testerOverlay.onclick = closeModal

  // =========================
  // ESC CLOSE
  // =========================

  document.addEventListener("keydown",(e)=>{

    if(e.key === "Escape"){

      closeModal()

    }

  })

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

    executeBtn.disabled = true

    executeBtn.innerText =
      "Executing..."

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

        executeBtn.disabled = false
        executeBtn.innerText = "Execute Endpoint"

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

        executeBtn.disabled = false
        executeBtn.innerText = "Execute Endpoint"

        return

      }

      // =========================
      // JSON
      // =========================

      const req =
        await fetch(url)

      const contentType =
        req.headers.get("content-type")

      // =========================
      // INVALID RESPONSE
      // =========================

      if(!req.ok){

        throw new Error(
          "API request failed."
        )

      }

      // =========================
      // JSON RESPONSE
      // =========================

      if(
        contentType &&
        contentType.includes("application/json")
      ){

        const json =
          await req.json()

        responseBox.innerHTML = `
<pre>${JSON.stringify(json,null,2)}</pre>
        `

      }else{

        const text =
          await req.text()

        responseBox.innerHTML = `
<pre>${text}</pre>
        `

      }

      showToast(
        "Request executed successfully."
      )

    }catch(err){

      responseBox.innerHTML = `
<pre>${err.message}</pre>
      `

    }

    executeBtn.disabled = false

    executeBtn.innerText =
      "Execute Endpoint"

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

      return (
        target.includes(value) ||
        fuzzyMatch(target,value)
      )

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
// CHIP FILTER
// =========================

document.addEventListener("click",(e)=>{

  const chip =
    e.target.closest(".chip")

  if(!chip) return

  document
    .querySelectorAll(".chip")
    .forEach(btn=>{

      btn.classList.remove("active-chip")

    })

  chip.classList.add("active-chip")

  const text =
    chip.innerText
      .toLowerCase()

  if(text === "all"){

    renderEndpoints(allEndpoints)

    return

  }

  const filtered =
    allEndpoints.filter(api=>{

      return api.category
        .toLowerCase()
        .includes(text)

    })

  renderEndpoints(filtered)

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

  localStorage.setItem(
    "theme",
    document.body.classList.contains("light-theme")
      ? "light"
      : "dark"
  )

}

// =========================
// LOAD THEME
// =========================

const savedTheme =
  localStorage.getItem("theme")

if(savedTheme === "light"){

  document.body.classList.add("light-theme")

}

// =========================
// PARALLAX EFFECT
// =========================

document.addEventListener("mousemove",(e)=>{

  const cards =
    document.querySelectorAll(
      ".api-card,.profile-card,.terminal-card"
    )

  const x =
    e.clientX / window.innerWidth

  const y =
    e.clientY / window.innerHeight

  cards.forEach(card=>{

    card.style.transform = `
      rotateY(${(x-.5)*4}deg)
      rotateX(${(y-.5)*-4}deg)
    `

  })

})

// =========================
// INIT
// =========================

await loadEndpoints()

})