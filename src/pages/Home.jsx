import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

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

  return (
    <div className="py-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-white mb-2">Welcome</h2>
        <p className="text-white/60">Manage your portfolio from here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className={`bg-gradient-to-br ${card.color} rounded-lg p-8 text-left hover:shadow-lg transition transform hover:scale-105`}
          >
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-white text-2xl font-bold mb-2">{card.title}</h3>
            <p className="text-white/80">{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
