import { Lock } from './Icon'
import './PrivateDisclaimer.css'

// "Only you can see this conversation" strip. Used in private message bubbles
// (MessageRow) and above the agents-rail chat thread (AgentsRail).
export default function PrivateDisclaimer({ text = 'Only you can see this conversation' }) {
  return (
    <div className="private-disclaimer">
      <Lock size={12} />
      <span>{text}</span>
    </div>
  )
}
