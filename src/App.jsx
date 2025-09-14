import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            UADE - ArreglaYA Analytics
          </h1>
          <p className="text-xl text-gray-600">
            Frontend desarrollado con React + Vite + Tailwind CSS
          </p>
        </div>

        {/* Logos */}
        <div className="flex justify-center items-center gap-8 mb-8">
          <a href="https://vite.dev" target="_blank" className="group">
            <img 
              src={viteLogo} 
              className="h-24 w-24 transition-transform group-hover:scale-110" 
              alt="Vite logo" 
            />
          </a>
          <a href="https://react.dev" target="_blank" className="group">
            <img 
              src={reactLogo} 
              className="h-24 w-24 transition-transform group-hover:scale-110 animate-spin-slow" 
              alt="React log" 
            />
          </a>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            ¡Bienvenido al proyecto!
          </h2>
          
          <div className="mb-6">
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Contador: {count}
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Edita <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">src/App.jsx</code> y guarda para probar HMR
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Vite</h3>
            <p className="text-gray-600">Build tool rápida y moderna</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-4">⚛️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">React</h3>
            <p className="text-gray-600">Biblioteca de UI declarativa</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tailwind</h3>
            <p className="text-gray-600">Framework CSS utility-first</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-500">
          Haz clic en los logos de Vite y React para aprender más
        </p>
      </div>
    </div>
  )
}

export default App
