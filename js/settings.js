;(function(){
  const langToggle  = document.getElementById('langToggle')
  const themeToggle = document.getElementById('themeToggle')

  const storedLang  = localStorage.getItem('lang')   || 'en'
  const storedTheme = localStorage.getItem('theme') || 'dark'

  if (langToggle)  langToggle.checked  = (storedLang === 'th')
  if (themeToggle) themeToggle.checked = (storedTheme === 'white')

  applyLanguage(storedLang)
  applyTheme(storedTheme)

  if (langToggle) {
    langToggle.addEventListener('change', e => {
      const newLang = e.target.checked ? 'th' : 'en'
      localStorage.setItem('lang', newLang)
      applyLanguage(newLang)
    })
  }
  if (themeToggle) {
    themeToggle.addEventListener('change', e => {
      const newTheme = e.target.checked ? 'white' : 'dark'
      localStorage.setItem('theme', newTheme)
      applyTheme(newTheme)
    })
  }

  function applyLanguage(lang){
    document.documentElement.lang = (lang === 'th' ? 'th' : 'en')
    document.querySelectorAll('[data-en]').forEach(el=>{
      el.textContent = (lang==='th')
        ? el.getAttribute('data-th')
        : el.getAttribute('data-en')
    })
  }

  function applyTheme(theme){
    document.documentElement.classList.toggle('white-theme', theme==='white')
  }

  window.applyLanguage = applyLanguage
  window.applyTheme    = applyTheme
})()