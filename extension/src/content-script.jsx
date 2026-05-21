import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import ContentPage from './content-page'

const root = document.createElement('div')
root.id = 'leetcode_whisper_ai_helper'
document.body.append(root)

createRoot(root).render(
    <StrictMode>
        <ContentPage />
    </StrictMode>
)