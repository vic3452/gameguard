export default function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="gamer-card p-16 text-center">
      {Icon && <Icon size={36} className="mx-auto text-gray-700 mb-4" />}
      {title && <p className="font-display text-gray-400 text-sm tracking-wider mb-2">{title}</p>}
      {sub   && <p className="font-mono-gg text-gray-600 text-xs mb-4">{sub}</p>}
      {action}
    </div>
  )
}
