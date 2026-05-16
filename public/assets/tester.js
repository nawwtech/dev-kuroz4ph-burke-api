window.addEventListener("DOMContentLoaded", async ()=>{

const apiGrid = document.getElementById("apiGrid")
const modal = document.getElementById("testerModal")
const searchInput = document.getElementById("searchInput")
const sidebar = document.getElementById("sidebar")
const overlay = document.getElementById("sidebarOverlay")
const menuBtn = document.getElementById("menuBtn")
const themeToggle = document.getElementById("themeToggle")

let allEndpoints = []
let requestHistory = JSON.parse(localStorage.getItem('api_history') || '[]')
let currentSearchTerm = ''

// =========================
// UTILITY FUNCTIONS
// =========================

function escapeHtml(str) {
  if(!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightText(text, searchTerm) {
  if (!searchTerm || searchTerm.length < 2) return text
  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi')
  return String(text).replace(regex, '<mark class="highlight">$1</mark>')
}

function showToast(message, type = 'info') {
  const existingToast = document.querySelector('.toast-notification')
  if(existingToast) existingToast.remove()
  
  const toast = document.createElement('div')
  toast.className = `toast-notification toast-${type}`
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
    <span>${message}</span>
  `
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.classList.add('show')
  }, 100)
  
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success')
  }).catch(() => {
    showToast('Failed to copy', 'error')
  })
}

function formatJSON(json) {
  return JSON.stringify(json, null, 2)
}

function getRateLimit(category) {
  const limits = {
    search: '100 req/min',
    downloader: '50 req/min',
    tools: '200 req/min',
    ai: '30 req/min',
    utilities: '100 req/min'
  }
  return limits[category] || '100 req/min'
}

function generateCodeSnippet(api, paramValue) {
  const url = api.endpoint + encodeURIComponent(paramValue)
  
  return `
    <div class="code-snippets">
      <div class="code-tabs">
        <button class="code-tab active" data-lang="curl">cURL</button>
        <button class="code-tab" data-lang="js">JavaScript</button>
        <button class="code-tab" data-lang="python">Python</button>
      </div>
      <div class="code-content">
        <pre class="code-pre curl-pre"><code>curl -X ${api.method} "${url}"</code></pre>
        <pre class="code-pre js-pre" style="display:none"><code>fetch("${url}")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));</code></pre>
        <pre class="code-pre python-pre" style="display:none"><code>import requests
response = requests.get("${url}")
print(response.json())</code></pre>
      </div>
      <button class="copy-code-btn"><i class="fas fa-copy"></i> Copy Code</button>
    </div>
  `
}

// =========================
// HISTORY FUNCTIONS
// =========================

function saveToHistory(api, input, responseTime, status, responseData = null) {
  const historyItem = {
    id: Date.now(),
    name: api.name,
    endpoint: api.endpoint,
    param: input,
    timestamp: new Date().toISOString(),
    responseTime: responseTime,
    status: status,
    responseData: responseData ? JSON.stringify(responseData).slice(0, 500) : null
  }
  requestHistory.unshift(historyItem)
  if (requestHistory.length > 20) requestHistory.pop()
  localStorage.setItem('api_history', JSON.stringify(requestHistory))
  updateHistoryUI()
}

function updateHistoryUI() {
  let historyPanel = document.getElementById('historyPanel')
  if(!historyPanel) return
  
  if(requestHistory.length === 0) {
    historyPanel.innerHTML = '<div class="history-empty"><i class="fas fa-history"></i><p>No history yet</p></div>'
    return
  }
  
  historyPanel.innerHTML = requestHistory.map(item => `
    <div class="history-item" data-param="${escapeHtml(item.param)}" data-endpoint="${escapeHtml(item.endpoint)}" data-name="${escapeHtml(item.name)}">
      <div class="history-info">
        <strong>${escapeHtml(item.name)}</strong>
        <small>${new Date(item.timestamp).toLocaleTimeString()}</small>
      </div>
      <div class="history-status ${item.status === 'success' ? 'success' : 'error'}">
        ${item.responseTime}ms
      </div>
    </div>
  `).join('')
  
  document.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const name = item.dataset.name
      const param = item.dataset.param
      const api = allEndpoints.find(e => e.name === name)
      if(api) {
        openTester(api, param)
      }
    })
  })
}

// =========================
// EXPORT ALL TO POSTMAN
// =========================

function exportAllToPostman() {
  const collection = {
    info: {
      name: "KUROZ4PH API Collection",
      description: "Complete API collection for KUROZ4PH backend services",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: allEndpoints.map(api => ({
      name: api.name,
      description: api.description,
      request: {
        method: api.method,
        url: {
          raw: api.endpoint + "{{param}}",
          host: [api.endpoint],
          path: [api.param ? "{{param}}" : ""],
          variable: [{ key: "param", value: "", description: api.param || "Parameter" }]
        },
        description: api.description
      }
    }))
  }
  
  const dataStr = JSON.stringify(collection, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', 'kuroz4ph_api_collection.json')
  linkElement.click()
  showToast('All APIs exported to Postman!', 'success')
}

// =========================
// LOAD ENDPOINTS
// =========================

async function loadEndpoints(){
  // Show skeleton
  apiGrid.innerHTML = `
    <div class="skeleton-card"><div class="skeleton shimmer"></div></div>
    <div class="skeleton-card"><div class="skeleton shimmer"></div></div>
    <div class="skeleton-card"><div class="skeleton shimmer"></div></div>
  `
  
  try{
    const req = await fetch("/data/endpoints.json")
    const data = await req.json()
    allEndpoints = data
    renderEndpoints(data)
    
    const apiCount = document.getElementById("apiCount")
    if(apiCount) apiCount.innerText = data.length
    
    updateHistoryUI()
    
  }catch(err){
    console.log(err)
    showToast('Failed to load endpoints', 'error')
    apiGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Failed to Load APIs</h3>
        <p>Please check your connection and try again.</p>
      </div>
    `
  }
}

// =========================
// RENDER ENDPOINTS
// =========================

function renderEndpoints(data){
  apiGrid.innerHTML = ""
  
  if(data.length < 1){
    apiGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No endpoints found</h3>
        <p>Try a different search term or browse all categories.</p>
      </div>
    `
    return
  }
  
  data.forEach((api, index)=>{
    const card = document.createElement("div")
    card.className = "api-card"
    card.style.animation = `fadeInUp 0.3s ease forwards ${index * 0.03}s`
    card.style.opacity = "0"
    
    const methodClass = api.method.toLowerCase()
    const highlightedName = currentSearchTerm ? highlightText(api.name, currentSearchTerm) : api.name
    const highlightedDesc = currentSearchTerm ? highlightText(api.description, currentSearchTerm) : api.description
    
    card.innerHTML = `
      <div class="card-glow"></div>
      <div class="method method-${methodClass}">
        <i class="fas ${api.method === 'GET' ? 'fa-download' : 'fa-exchange-alt'}"></i>
        ${api.method}
      </div>
      <h3>${highlightedName}</h3>
      <p>${highlightedDesc}</p>
      <div class="endpoint">
        <i class="fas fa-link"></i>
        <code>${escapeHtml(api.endpoint)}${escapeHtml(api.param || '')}</code>
        <button class="copy-endpoint" data-endpoint="${api.endpoint}${api.param}">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      <div class="api-tags">
        <span class="tag tag-${api.category}">
          <i class="fas ${api.category === 'search' ? 'fa-search' : api.category === 'downloader' ? 'fa-download' : api.category === 'tools' ? 'fa-tools' : api.category === 'ai' ? 'fa-brain' : 'fa-cog'}"></i>
          ${api.category}
        </span>
        <span class="tag tag-type">
          <i class="fas ${api.type === 'json' ? 'fa-code' : api.type === 'audio' ? 'fa-music' : 'fa-image'}"></i>
          ${api.type}
        </span>
      </div>
      <div class="rate-limit-badge">
        <i class="fas fa-tachometer-alt"></i>
        Limit: ${getRateLimit(api.category)}
      </div>
      <button class="try-btn">
        <i class="fas fa-play"></i> Execute API
      </button>
    `
    
    const button = card.querySelector(".try-btn")
    button.addEventListener("click",()=> openTester(api))
    
    const copyBtn = card.querySelector(".copy-endpoint")
    copyBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      copyToClipboard(copyBtn.dataset.endpoint)
    })
    
    apiGrid.appendChild(card)
  })
}

// =========================
// OPEN TESTER
// =========================

function openTester(api, prefillValue = ''){
  modal.style.display = "flex"
  modal.style.opacity = "0"
  setTimeout(() => modal.style.opacity = "1", 10)
  
  modal.innerHTML = `
  <div class="tester-overlay"></div>
  <div class="tester-box">
    <div class="tester-top">
      <div>
        <span class="tester-badge tester-badge-${api.method.toLowerCase()}">
          <i class="fas ${api.method === 'GET' ? 'fa-download' : 'fa-exchange-alt'}"></i>
          ${api.method}
        </span>
        <h2>${escapeHtml(api.name)}</h2>
        <p class="tester-description">${escapeHtml(api.description)}</p>
      </div>
      <button id="closeTester"><i class="fas fa-times"></i></button>
    </div>
    
    <div class="tester-param-info">
      <i class="fas fa-info-circle"></i>
      <span>Parameter: <code>${escapeHtml(api.param || '')}</code></span>
      <span class="rate-limit-badge" style="margin-left: auto;">
        <i class="fas fa-tachometer-alt"></i> ${getRateLimit(api.category)}
      </span>
    </div>
    
    <div class="tester-input-wrapper">
      <input type="text" id="testerInput" placeholder="Enter ${api.param || 'value'}..." value="${escapeHtml(prefillValue || api.param || '')}">
    </div>
    
    <button id="executeBtn">
      <i class="fas fa-paper-plane"></i> Execute Endpoint
    </button>
    
    <div class="response-header">
      <span><i class="fas fa-terminal"></i> Response</span>
      <div>
        <button id="copyResponseBtn" class="copy-response-btn" style="display: none;">
          <i class="fas fa-copy"></i> Copy
        </button>
        <button id="exportPostmanBtn" class="export-postman-btn" style="display: none;">
          <i class="fas fa-download"></i> Postman
        </button>
      </div>
    </div>
    
    <div id="testerResponse">
      <div class="response-placeholder">
        <i class="fas fa-code"></i>
        <p>Response will appear here...</p>
      </div>
    </div>
    
    <div class="code-snippets-section" style="display: none;">
      <div class="section-divider">
        <span><i class="fas fa-code"></i> Code Examples</span>
      </div>
      <div id="codeSnippets"></div>
    </div>
  </div>
  `
  
  const closeBtn = document.getElementById("closeTester")
  const executeBtn = document.getElementById("executeBtn")
  const testerOverlay = document.querySelector(".tester-overlay")
  const copyResponseBtn = document.getElementById("copyResponseBtn")
  const exportPostmanBtn = document.getElementById("exportPostmanBtn")
  let lastResponseData = null
  
  closeBtn.onclick = () => {
    modal.style.opacity = "0"
    setTimeout(() => modal.style.display = "none", 200)
  }
  
  testerOverlay.onclick = () => {
    modal.style.opacity = "0"
    setTimeout(() => modal.style.display = "none", 200)
  }
  
  executeBtn.onclick = async () => {
    const input = document.getElementById("testerInput").value.trim()
    const responseBox = document.getElementById("testerResponse")
    const codeSnippetsSection = document.querySelector(".code-snippets-section")
    
    if(!input){
      responseBox.innerHTML = `<div class="response-error"><i class="fas fa-exclamation-triangle"></i><p>Parameter required. Please enter a value.</p></div>`
      return
    }
    
    responseBox.innerHTML = `<div class="response-loading"><div class="loader"></div><p>Sending request...</p></div>`
    codeSnippetsSection.style.display = "none"
    copyResponseBtn.style.display = "none"
    exportPostmanBtn.style.display = "none"
    
    const startTime = performance.now()
    
    try{
      const url = api.endpoint + encodeURIComponent(input)
      
      if(api.type === "audio"){
        responseBox.innerHTML = `
          <div class="response-audio">
            <audio controls autoplay style="width:100%"><source src="${escapeHtml(url)}"></audio>
            <div class="audio-info"><i class="fas fa-headphones"></i><span>Now playing: ${escapeHtml(input)}</span></div>
          </div>
        `
        saveToHistory(api, input, Math.round(performance.now() - startTime), 'success')
        return
      }
      
      if(api.type === "image"){
        responseBox.innerHTML = `
          <div class="response-image">
            <img src="${escapeHtml(url)}" onerror="this.src='https://placehold.co/600x400/1e293b/64748b?text=Image+Failed+to+Load'">
            <div class="image-actions">
              <button onclick="window.open('${escapeHtml(url)}', '_blank')" class="image-action-btn"><i class="fas fa-external-link-alt"></i> Open</button>
              <button onclick="window.location.href='${escapeHtml(url)}'" class="image-action-btn"><i class="fas fa-download"></i> Download</button>
            </div>
          </div>
        `
        saveToHistory(api, input, Math.round(performance.now() - startTime), 'success')
        return
      }
      
      const req = await fetch(url)
      const json = await req.json()
      const responseTime = Math.round(performance.now() - startTime)
      
      lastResponseData = json
      
      responseBox.innerHTML = `<div class="response-json"><pre>${escapeHtml(formatJSON(json))}</pre></div>`
      
      const snippetsHtml = generateCodeSnippet(api, input)
      document.getElementById("codeSnippets").innerHTML = snippetsHtml
      codeSnippetsSection.style.display = "block"
      copyResponseBtn.style.display = "flex"
      exportPostmanBtn.style.display = "flex"
      
      document.querySelectorAll('.code-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'))
          tab.classList.add('active')
          const lang = tab.dataset.lang
          document.querySelectorAll('.code-pre').forEach(pre => pre.style.display = 'none')
          document.querySelector(`.${lang}-pre`).style.display = 'block'
        })
      })
      
      document.querySelector('.copy-code-btn')?.addEventListener('click', () => {
        const activeLang = document.querySelector('.code-tab.active').dataset.lang
        const codePre = document.querySelector(`.${activeLang}-pre code`)
        copyToClipboard(codePre.innerText)
      })
      
      saveToHistory(api, input, responseTime, 'success', json)
      
    }catch(err){
      const responseTime = Math.round(performance.now() - startTime)
      responseBox.innerHTML = `<div class="response-error"><i class="fas fa-exclamation-triangle"></i><p>${escapeHtml(err.message)}</p><small>Make sure the API endpoint is accessible</small></div>`
      saveToHistory(api, input, responseTime, 'error')
    }
  }
  
  copyResponseBtn.onclick = () => {
    if(lastResponseData) copyToClipboard(formatJSON(lastResponseData))
  }
  
  exportPostmanBtn.onclick = () => {
    const collection = {
      info: { name: `${api.name} API`, schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
      item: [{
        name: api.name,
        request: {
          method: api.method,
          url: {
            raw: api.endpoint + "{{param}}",
            host: [api.endpoint],
            variable: [{ key: "param", value: "", description: api.param }]
          },
          description: api.description
        }
      }]
    }
    const dataStr = JSON.stringify(collection, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `${api.name.replace(/\s/g, '_')}_postman_collection.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    showToast('Postman collection downloaded!', 'success')
  }
}

// =========================
// SEARCH WITH HIGHLIGHT
// =========================

searchInput.addEventListener("input", () => {
  currentSearchTerm = searchInput.value.toLowerCase().trim()
  
  if(!currentSearchTerm){
    renderEndpoints(allEndpoints)
    return
  }
  
  const filtered = allEndpoints.filter(api => {
    const target = `${api.name} ${api.description} ${api.category} ${api.endpoint}`.toLowerCase()
    return target.includes(currentSearchTerm)
  })
  
  renderEndpoints(filtered)
})

// =========================
// SIDEBAR FILTER
// =========================

document.addEventListener("click", (e) => {
  const button = e.target.closest(".sidebar-item")
  if(!button) return
  
  const category = button.dataset.category
  
  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.classList.remove("active-sidebar")
  })
  button.classList.add("active-sidebar")
  
  if(category === "all"){
    currentSearchTerm = ''
    searchInput.value = ''
    renderEndpoints(allEndpoints)
  }else{
    currentSearchTerm = ''
    searchInput.value = ''
    const filtered = allEndpoints.filter(api => api.category === category)
    renderEndpoints(filtered)
  }
  
  if(window.innerWidth <= 768) {
    sidebar.classList.remove("active")
    overlay.classList.remove("active")
  }
})

// =========================
// THEME with localStorage
// =========================

function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  const icon = themeToggle?.querySelector('i')
  
  if(savedTheme === 'light') {
    document.body.classList.add("light-theme")
    if(icon) icon.className = 'fas fa-moon'
  } else {
    document.body.classList.remove("light-theme")
    if(icon) icon.className = 'fas fa-sun'
  }
}

if(themeToggle) {
  themeToggle.onclick = () => {
    document.body.classList.toggle("light-theme")
    const isLight = document.body.classList.contains("light-theme")
    localStorage.setItem('theme', isLight ? 'light' : 'dark')
    
    const icon = themeToggle.querySelector('i')
    if(icon) {
      icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun'
    }
    
    showToast(`${isLight ? 'Light' : 'Dark'} theme activated`, 'info')
  }
}

// Export all button
const exportAllBtn = document.getElementById('exportAllBtn')
if (exportAllBtn) {
  exportAllBtn.onclick = () => exportAllToPostman()
}

// Escape key handler
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && modal.style.display === "flex") {
    modal.style.opacity = "0"
    setTimeout(() => modal.style.display = "none", 200)
  }
  if((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    searchInput.focus()
    showToast('Search focused', 'info')
  }
})

// =========================
// INIT
// =========================

initTheme()
await loadEndpoints()

})