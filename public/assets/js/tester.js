const apiGrid =
  document.getElementById("apiGrid")

const modal =
  document.getElementById("testerModal")

async function loadEndpoints(){

  const response =
    await fetch(
      "/data/endpoints.json"
    )

  const endpoints =
    await response.json()

  apiGrid.innerHTML = ""

  endpoints.forEach(data=>{

    const card =
      document.createElement("div")

    card.className =
      "api-card"

    card.innerHTML = `

      <div class="method">
        ${data.method}
      </div>

      <h3>
        ${data.name}
      </h3>

      <p>
        ${data.description}
      </p>

      <div class="endpoint">
        ${data.endpoint}${data.param}
      </div>

      <button class="try-btn">
        TEST ENDPOINT
      </button>

    `

    card
      .querySelector(".try-btn")
      .onclick = ()=>{

      openTester(data)

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
      EXECUTE
    </button>

    <div id="testerResponse">
      Response Here...
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

      // AUDIO

      if(data.type === "audio"){

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

      // IMAGE

      if(data.type === "image"){

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

      // JSON

      const response =
        await fetch(url)

      const json =
        await response.json()

      responseBox.innerHTML = `

<pre>${syntaxHighlight(
JSON.stringify(json,null,2)
)}</pre>

      `

    }catch(err){

      responseBox.innerHTML = `

<pre>${err.message}</pre>

      `

    }

  }

}

function syntaxHighlight(json){

  json = json
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')

  return json.replace(

    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g,

    match=>{

      let cls = 'number'

      if(/^"/.test(match)){

        cls =
          /:$/.test(match)
          ? 'key'
          : 'string'

      }else if(
        /true|false/.test(match)
      ){

        cls = 'boolean'

      }else if(
        /null/.test(match)
      ){

        cls = 'null'

      }

      return `
        <span class="${cls}">
          ${match}
        </span>
      `

    }

  )

}

// ===== SEARCH =====

const searchInput =
  document.getElementById(
    "searchInput"
  )

searchInput.addEventListener(
  "input",
  ()=>{

  const value =
    searchInput.value.toLowerCase()

  document
    .querySelectorAll(".api-card")
    .forEach(card=>{

      const text =
        card.innerText.toLowerCase()

      card.style.display =
        text.includes(value)
        ? "block"
        : "none"

    })

})

// ===== SIDEBAR =====

const sidebar =
  document.getElementById(
    "sidebar"
  )

const sidebarOverlay =
  document.getElementById(
    "sidebarOverlay"
  )

document
  .getElementById("menuBtn")
  .onclick = ()=>{

  sidebar.classList.toggle(
    "active"
  )

  sidebarOverlay.classList.toggle(
    "active"
  )

}

sidebarOverlay.onclick = ()=>{

  sidebar.classList.remove(
    "active"
  )

  sidebarOverlay.classList.remove(
    "active"
  )

}

// ===== THEME =====

document
  .getElementById("themeToggle")
  .onclick = ()=>{

  document.body.classList.toggle(
    "light-theme"
  )

}

// ===== START =====

loadEndpoints()