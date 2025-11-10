import { ReactNode } from 'react'

interface CardProps {
  title: string
  description: string
  icon?: string
  children?: ReactNode
}

export function Card({ title, description, icon, children }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      {icon && (
        <div className="text-4xl mb-4 text-center">{icon}</div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {children}
    </div>
  )
}

