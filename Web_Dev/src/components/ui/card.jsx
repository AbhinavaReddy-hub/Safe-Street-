export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border bg-white p-4 shadow ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "" }) {
  return <div className={`mb-2 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
}

export function CardDescription({ children, className = "" }) {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
}

export function CardContent({ children, className = "" }) {
  return <div className={`mt-2 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = "" }) {
  return <div className={`mt-4 text-sm text-gray-400 ${className}`}>{children}</div>
}
