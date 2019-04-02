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
    if(isSaved) setNeedUpdateBadge()
    chrome.browserAction.onClicked.addListener(() => {
      let isSaved = savedTabs.length>0
      return isSaved? restore(): save()
    })
  })
})()

function save(){
  setSavedIcon()
  setSavedBadge()
  saveAllCurrentTabsToStorage()
  setNeedUpdate()
}

function restore(){
  savedTabs.forEach(tabDetail => {
    checkTabExist(tabDetail).then(isExist=>{
      if(!isExist) openTab(tabDetail)
    })
  })
  resetSavedSession()
  setNormalIcon()
  setNormalBadge()
}

function checkTabExist(tabDetail){
  return new Promise(resolve=>{
    chrome.tabs.query({url: tabDetail.url}, tabs => {
      const isExist = tabs && tabs.length>0
      resolve(isExist)
    })
  })
}

function openTab(tabDetail){
  chrome.tabs.create(tabDetail)
}

function setSavedIcon(){
  chrome.browserAction.setIcon({
      path : "icon/enable.png"
  })
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

function setNormalIcon(){
  chrome.browserAction.setIcon({
      path : "icon/disable.png"
  })
}

function setNormalBadge(){
  chrome.browserAction.setBadgeText({text: ""})
}

function saveAllCurrentTabsToStorage(){
  getAllCurrentTabs().then(tabs=>{
    savedTabs = tabs
    console.log('save.savedTabs', savedTabs)
    chrome.storage.sync.set({
      savedTabs: savedTabs
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
        currentTabs.push({
          index: tab.index,
          url: tab.url,
          active: tab.active,
          selected: tab.selected,
          pinned: tab.pinned
        })
      })
      resolve(currentTabs)
    })
  })
}