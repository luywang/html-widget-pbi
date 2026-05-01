import { Avatar } from './common'
import './PromptSuggestions.css'

// Empty-state for a new agent session. Centered within the chat canvas:
// logo, agent name, short description, then a 2x3 grid of suggestion cards.
// Clicking a card sends the suggestion as a user message.
export default function PromptSuggestions({ agent, suggestions, onSelectPrompt }) {
  return (
    <div className="prompt-suggestions">
      <div className="prompt-suggestions-inner">
        <div className="prompt-suggestions-logo">
          <Avatar contact={agent} size={72} />
        </div>
        <h1 className="prompt-suggestions-name">{agent.name}</h1>
        <p className="prompt-suggestions-subtitle">{agent.description}</p>
        <div className="prompt-suggestions-grid">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className="prompt-card"
              onClick={() => onSelectPrompt(s)}
            >
              <div className="prompt-card-title">{s.title}</div>
              <div className="prompt-card-description">{s.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
