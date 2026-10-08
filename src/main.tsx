import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/noto-serif-kr/500.css'
import '@fontsource/noto-sans-kr/400.css'
import './styles.css'
import { App } from './App'
import { LanguageProvider } from './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><HashRouter><LanguageProvider><MotionConfig reducedMotion="user"><App /></MotionConfig></LanguageProvider></HashRouter></React.StrictMode>,
)
