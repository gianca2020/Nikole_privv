import { Link } from 'react-router-dom'
import useDocumentTitle from '../lib/useDocumentTitle'

const cards = [
  {
    title: 'Articles',
    description: 'Manage journalism and highlights',
    icon: '📰',
    path: '/dashboard/articles',
    color: 'from-blue-600 to-blue-700',
  },
  {
    title: 'Creatives',
    description: 'Manage creative projects',
    icon: '🎨',
    path: '/dashboard/creative',
    color: 'from-purple-600 to-purple-700',
  },
  {
    title: 'Site Content',
    description: 'Edit headshot, bio, and resume',
    icon: '⚙️',
    path: '/dashboard/site',
    color: 'from-green-600 to-green-700',
  },
]

export default function Home() {
  useDocumentTitle('Home')

  return (
    <div className="py-12">
      <div className="mb-8">
        <h2 className="font-serif text-4xl font-bold text-white mb-2">Welcome</h2>
        <p className="text-white/70">Manage your portfolio from here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className={`block bg-gradient-to-br ${card.color} rounded-lg p-8 text-left hover:shadow-lg transition transform hover:scale-105 motion-reduce:transform-none`}
          >
            <div aria-hidden="true" className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-white text-2xl font-bold mb-2">{card.title}</h3>
            <p className="text-white/90">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
