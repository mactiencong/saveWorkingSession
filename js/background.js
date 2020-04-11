let savedTabs = []
function loadSavedSession(){
  return new Promise(resolve => {
    chrome.storage.sync.get({
      savedTabs: savedTabs
    }, tabUrls => {
      savedTabs = tabUrls.savedTabs
      resolve(true)
    })
  })
}

(function start(){
  loadSavedSession().then(()=>{
    let isSaved = savedTabs.length>0
    if(isSaved) {
      setSavedBadge()
    }
    chrome.browserAction.onClicked.addListener(() => {
      let isSaved = savedTabs.length>0
      return isSaved? restore(): save()
    })
  })
})()

function save(){
  saveAllCurrentTabsToStorage().then(isSaveSuccess=>{
    if(isSaveSuccess) setSavedBadge()
  })
  // setNeedUpdate()
}

function restore(){
  getAllCurrentTabs().then(currentTabs=>{
    savedTabs.forEach(savedTab => {
      isTabExist(currentTabs, savedTab).then(isExist=>{
        if(!isExist) openTab(savedTab)
      })
    })
    resetSavedSession()
    setNormalBadge()
  })
}

function isTabExist(currentTabs, savedTab){
  return new Promise(resolve=>{
    currentTabs.forEach(tab=>{
      if(tab.url === savedTab.url) resolve(true)
    })
    resolve(false)
  })
}

function openTab(savedTab){
  chrome.tabs.create(savedTab)
}

function setSavedBadge(){
  chrome.browserAction.setBadgeText({text: "⬇"})
  chrome.browserAction.setBadgeBackgroundColor({color: 'green'})
}

function setNeedUpdateBadge(){
  chrome.browserAction.setBadgeText({text: "⬇"})
  chrome.browserAction.setBadgeBackgroundColor({color: 'red'})
}

let setNeedUpdateTimer = null
const setNeedUpdateTimeout = 3000
function setNeedUpdate(){
  clearsetNeedUpdateTimer()
  setNeedUpdateTimer = setTimeout(()=>{
    clearsetNeedUpdateTimer()
    setNeedUpdateBadge()
  }, setNeedUpdateTimeout)
}

function clearsetNeedUpdateTimer(){
  if(setNeedUpdateTimer!==null){
    clearTimeout(setNeedUpdateTimer)
    setNeedUpdateTimer = null
  }
}

function setNormalBadge(){
  chrome.browserAction.setBadgeText({text: ""})
}

function saveAllCurrentTabsToStorage(){
  return new Promise(resolve=>{
    let isSaveSuccess = false
    getAllCurrentTabs().then(tabs=>{
      if(tabs.length>0){
        savedTabs = tabs
        chrome.storage.sync.set({
          savedTabs: savedTabs
        })
        isSaveSuccess = true
      }
      return resolve(isSaveSuccess)
    })
  })
}

function resetSavedSession(){
  savedTabs = []
  chrome.storage.sync.set({
    savedTabs: savedTabs
  })
}

function getAllCurrentTabs(){
  let currentTabs = []
  return new Promise(resolve=>{
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab=>{
        if(isIgnoreTab(tab)) return
        currentTabs.push({
          index: tab.index,
          url: tab.url,
          active: tab.active,
          pinned: tab.pinned
        })
      })
      resolve(currentTabs)
    })
  })
}

function isIgnoreTab(tab){
  return isChromeSettingTab(tab) || isFirefoxSettingTab(tab)
}

function isChromeSettingTab(tab){
  return tab.url.includes('chrome:')
}

function isFirefoxSettingTab(tab){
  return tab.url.includes('about:')
}