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
// LOAD ENDPOINTS
// =========================

async function loadEndpoints(){
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
        <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
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
    
    card.innerHTML = `
      <div class="card-glow"></div>
      <div class="method method-${methodClass}">
        <i class="fas ${api.method === 'GET' ? 'fa-download' : 'fa-exchange-alt'}"></i>
        ${api.method}
      </div>
      <h3>${escapeHtml(api.name)}</h3>
      <p>${escapeHtml(api.description)}</p>
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
// OPEN TESTER (UPGRADED)
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
// SEARCH
// =========================

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase().trim()
  if(!value){
    renderEndpoints(allEndpoints)
    return
  }
  const filtered = allEndpoints.filter(api => {
    const target = `${api.name} ${api.description} ${api.category} ${api.endpoint}`.toLowerCase()
    return target.includes(value)
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
    item.classList.remove("active")
  })
  button.classList.add("active")
  
  if(category === "all"){
    renderEndpoints(allEndpoints)
  }else{
    const filtered = allEndpoints.filter(api => api.category === category)
    renderEndpoints(filtered)
  }
  
  if(window.innerWidth <= 768) {
    sidebar.classList.remove("active")
    overlay.classList.remove("active")
  }
})

// =========================
// THEME with localStorage (FIXED!)
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
// ADD CSS STYLES
// =========================

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .toast-notification {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: var(--card);
    color: var(--text);
    padding: 14px 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 100000;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
  }
  .toast-notification.show { opacity: 1; visibility: visible; }
  .toast-success { border-left: 4px solid var(--success); }
  .toast-error { border-left: 4px solid var(--error); }
  .toast-info { border-left: 4px solid var(--primary); }
  
  .method-get { background: rgba(16,185,129,0.12); color: var(--success); }
  .endpoint { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .copy-endpoint { background: none; border: none; color: var(--muted); cursor: pointer; padding: 6px 8px; border-radius: 8px; transition: all 0.25s; font-size: 14px; }
  .copy-endpoint:hover { background: var(--primary); color: white; }
  
  .api-tags { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
  .tag { font-size: 11px; padding: 6px 12px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; font-weight: 600; }
  .tag-search { background: rgba(59,130,246,0.12); color: var(--primary); }
  .tag-downloader { background: rgba(16,185,129,0.12); color: var(--success); }
  .tag-tools { background: rgba(245,158,11,0.12); color: var(--warning); }
  .tag-ai { background: rgba(168,85,247,0.12); color: #a855f7; }
  .tag-type { background: rgba(100,116,139,0.12); color: var(--muted); }
  
  .tester-description { margin-top: 8px; font-size: 14px; color: var(--text-secondary); }
  .tester-param-info { padding: 12px 14px; background: rgba(59,130,246,0.08); border-radius: 12px; margin: 16px 0; font-size: 13px; display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
  .tester-param-info code { background: rgba(59,130,246,0.15); padding: 2px 6px; border-radius: 4px; font-family: 'Space Mono', monospace; }
  .tester-input-wrapper { margin: 16px 0; }
  .tester-input-wrapper input { width: 100%; padding: 14px 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--card2); color: var(--text); font-family: 'Space Mono', monospace; font-size: 13px; transition: all 0.25s; }
  .tester-input-wrapper input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
  
  .response-header { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; margin-bottom: 10px; font-size: 13px; color: var(--muted); }
  .copy-response-btn, .export-postman-btn { background: none; border: none; color: var(--primary); cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; }
  .copy-response-btn:hover, .export-postman-btn:hover { background: rgba(59,130,246,0.1); }
  
  .response-placeholder { text-align: center; padding: 40px; color: var(--muted); }
  .response-placeholder i { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }
  .response-loading { text-align: center; padding: 40px; }
  .loader { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .response-error { text-align: center; padding: 30px; color: var(--error); }
  .response-error i { font-size: 32px; margin-bottom: 12px; }
  .response-json pre { background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px; overflow-x: auto; font-size: 12px; max-height: 400px; border: 1px solid var(--border); }
  .response-audio { text-align: center; padding: 20px; }
  .audio-info { display: flex; align-items: center; gap: 8px; margin-top: 12px; justify-content: center; color: var(--text-secondary); }
  .response-image img { width: 100%; border-radius: 16px; max-height: 400px; object-fit: contain; }
  .image-actions { display: flex; gap: 10px; margin-top: 16px; justify-content: center; }
  .image-action-btn { background: var(--card2); border: none; padding: 10px 16px; border-radius: 10px; color: var(--text); cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; transition: all 0.25s; }
  .image-action-btn:hover { background: var(--primary); color: white; }
  
  .code-snippets-section { margin-top: 20px; }
  .section-divider { margin: 20px 0 15px; font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
  .code-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
  .code-tab { background: var(--card2); border: none; padding: 8px 14px; border-radius: 10px; color: var(--text); cursor: pointer; transition: all 0.25s; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
  .code-tab.active { background: var(--primary); color: white; }
  .code-tab:hover { background: var(--primary); color: white; }
  .code-content { position: relative; }
  .code-pre { background: rgba(0,0,0,0.3); padding: 16px; border-radius: 12px; overflow-x: auto; margin: 10px 0; border: 1px solid var(--border); }
  .code-pre code { font-family: 'Space Mono', monospace; font-size: 12px; }
  .copy-code-btn { width: 100%; padding: 10px; border: none; border-radius: 10px; background: var(--primary); color: white; cursor: pointer; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; transition: all 0.25s; }
  .copy-code-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59,130,246,0.3); }
  
  .active { background: var(--primary) !important; color: white !important; }
  
  @media (max-width: 768px) {
    .tester-box { margin: 20px; max-height: 90vh; overflow-y: auto; }
    .code-pre { font-size: 10px; }
  }
`

document.head.appendChild(style)

// =========================
// INIT
// =========================

initTheme()  // Panggil initTheme sebelum loadEndpoints
await loadEndpoints()

})
