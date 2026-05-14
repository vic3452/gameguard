export default function Spinner({ text = 'Loading...' }) {
  return (
    <div className="font-mono-gg text-purple-400 animate-pulse text-sm py-8">{text}</div>
  )
}
