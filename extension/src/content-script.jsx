import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import ContentPage from './content-page'
import './index.css'


const root = document.createElement('div')
root.id = 'meeting-summary-extension'
document.body.append(root)

createRoot(root).render(
    <StrictMode>
        <ContentPage />
    </StrictMode>
)