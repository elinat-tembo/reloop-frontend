function IconTab({ icon: Icon, label, selected }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
        selected
          ? 'bg-primary text-white'
          : 'text-gray-600 hover:bg-accent-mist'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </div>
  )
}

export default IconTab
