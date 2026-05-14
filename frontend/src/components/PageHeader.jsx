export default function PageHeader({ title, sub, action }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-xl text-white tracking-wider">{title}</h1>
        {sub && <p className="font-mono-gg text-gray-500 text-xs mt-1">{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
