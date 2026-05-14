// public/assets/js/tester.js

const apiGrid =
  document.getElementById("apiGrid")

const searchInput =
  document.getElementById("searchInput")

// ===== MODAL =====

const modal =
  document.createElement("div")

modal.id = "testerModal"

modal.innerHTML = `
<div class="tester-overlay"></div>

<div class="tester-box">

  <div class="tester-header">

    <h2 id="testerTitle">
      API TESTER
    </h2>

    <button id="closeTester">
      ✕
    </button>

  </div>

  <p id="testerDesc"></p>

  <div id="testerParams"></div>

  <button id="executeBtn">
    Submit
  </button>

  <div id="testerResponse"></div>

</div>
`

document.body.appendChild(modal)

const closeBtn =
  document.getElementById("closeTester")

closeBtn.onclick = () => {
  modal.style.display = "none"
}

// ===== OPEN TESTER =====

function openTester(data){

  modal.style.display = "flex"

  document.getElementById(
    "testerTitle"
  ).innerText = data.name

  document.getElementById(
    "testerDesc"
  ).innerText = data.description

  const paramsBox =
    document.getElementById(
      "testerParams"
    )

  paramsBox.innerHTML = ""

  if(data.params){

    data.params.forEach(param => {

      paramsBox.innerHTML += `
        <div class="tester-input">

          <input
            type="text"
            id="param-${param.name}"
            placeholder="${param.placeholder || ''}"
          >

        </div>
      `

    })

  }

  document
    .getElementById("executeBtn")
    .onclick = async () => {

      const responseBox =
        document.getElementById(
          "testerResponse"
        )

      responseBox.innerHTML =
        `<div class="loader"></div>`

      try {

        let url =
          data.endpoint

        if(data.params){

          data.params.forEach(param => {

            const value =
              document.getElementById(
                `param-${param.name}`
              ).value

            url +=
              `${url.includes('?') ? '&' : '?'}${param.name}=${encodeURIComponent(value)}`

          })

        }

        const res =
          await fetch(url)

        // ===== AUDIO =====

        if(data.type === "audio"){

          responseBox.innerHTML = `
            <audio
              controls
              autoplay
              style="
                width:100%;
                margin-top:15px;
              "
            >
              <source src="${url}">
            </audio>
          `

          return
        }

        // ===== IMAGE =====

        if(data.type === "image"){

          const blob =
            await res.blob()

          const imgUrl =
            URL.createObjectURL(blob)

          responseBox.innerHTML = `
            <img
              src="${imgUrl}"
              style="
                width:100%;
                border-radius:18px;
                margin-top:15px;
              "
            >
          `

          return
        }

        // ===== JSON =====

        const json =
          await res.json()

        responseBox.innerHTML = `
<pre>${syntaxHighlight(
JSON.stringify(json, null, 2)
)}</pre>
        `

      } catch(err){

        responseBox.innerHTML = `
<pre>${err.message}</pre>
        `

      }

    }

}

// ===== LOAD ENDPOINTS =====

async function loadEndpoints(){

  const res =
    await fetch(
      "/data/endpoints.json"
    )

  const endpoints =
    await res.json()

  apiGrid.innerHTML = ""

  endpoints.forEach(data => {

    const card =
      document.createElement("div")

    card.className =
      "api-card"

    card.innerHTML = `
      <div class="method">
        ${data.method}
      </div>

      <h4>
        ${data.name}
      </h4>

      <p>
        ${data.description}
      </p>

      <div class="endpoint">
        ${data.endpoint}
      </div>

      <button class="try-btn">
        TRY
      </button>
    `

    card
      .querySelector(".try-btn")
      .addEventListener("click", () => {
        openTester(data)
      })

    apiGrid.appendChild(card)

  })

}

// ===== SEARCH =====

searchInput.addEventListener("input", () => {

  const value =
    searchInput.value.toLowerCase()

  const cards =
    document.querySelectorAll(".api-card")

  cards.forEach(card => {

    const text =
      card.innerText.toLowerCase()

    card.style.display =
      text.includes(value)
      ? "block"
      : "none"

  })

})

// ===== JSON COLOR =====

function syntaxHighlight(json){

  json = json
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    match => {

      let cls = 'number'

      if(/^"/.test(match)){

        cls =
          /:$/.test(match)
          ? 'key'
          : 'string'

      }else if(/true|false/.test(match)){

        cls = 'boolean'

      }else if(/null/.test(match)){

        cls = 'null'

      }

      return `<span class="${cls}">${match}</span>`

    }
  )

}

// ===== START =====

loadEndpoints()