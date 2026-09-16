function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = size === 'sm' ? 'h-4 w-4 border-2' : 'h-8 w-8 border-4'

  return (
    <span
      className={`inline-block rounded-full border-primary border-t-transparent animate-spin ${sizeClasses} ${className}`}
    />
  )
}

export default Spinner
