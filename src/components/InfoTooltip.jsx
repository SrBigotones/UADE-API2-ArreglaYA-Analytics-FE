import React, { useState } from 'react';
import ReactDOM from 'react-dom';

/**
 * Componente InfoTooltip - Muestra información adicional al hacer hover sobre un ícono de información.
 * Usa Portal para renderizar el tooltip directamente en el body, evitando problemas de z-index y overflow.
 * Se adapta automáticamente al tema claro/oscuro de la aplicación.
 */
const InfoTooltip = ({ content }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [arrowStyle, setArrowStyle] = useState({});
  const [isDark, setIsDark] = useState(false);
  const buttonRef = React.useRef(null);

  if (!content) return null;

  const handleMouseEnter = () => {
    // Detectar si estamos en modo oscuro buscando la clase 'dark' en el DOM
    const darkModeElement = document.querySelector('.dark');
    setIsDark(!!darkModeElement);
    
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const tooltipWidth = 384;
      const screenWidth = window.innerWidth;
      const centerX = screenWidth / 2;
      
      // Calcular posición fija del tooltip
      let left, arrowLeft;
      
      if (rect.left > centerX) {
        // Estamos a la derecha del centro → tooltip hacia la izquierda
        left = rect.right - tooltipWidth;
        arrowLeft = tooltipWidth - 24; // Flecha a la derecha
      } else {
        // Estamos a la izquierda del centro → tooltip hacia la derecha
        left = rect.left;
        arrowLeft = 16; // Flecha a la izquierda
      }
      
      // Asegurar que no se salga de la pantalla
      if (left < 8) left = 8;
      if (left + tooltipWidth > screenWidth - 8) left = screenWidth - tooltipWidth - 8;
      
      // Siempre hacia abajo
      const top = rect.bottom + 8;
      
      setTooltipStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`,
        zIndex: 99999
      });
      
      setArrowStyle({
        left: `${arrowLeft}px`
      });
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Estilos según el tema
  const tooltipClasses = isDark 
    ? "px-4 py-3 text-base font-normal text-gray-200 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl animate-fadeIn"
    : "px-4 py-3 text-base font-normal text-gray-700 bg-white border border-gray-300 rounded-lg shadow-2xl animate-fadeIn";
  
  const arrowClasses = isDark
    ? "absolute w-3 h-3 bg-gray-800 border-gray-600 transform rotate-45 -top-1.5 border-l border-t"
    : "absolute w-3 h-3 bg-white border-gray-300 transform rotate-45 -top-1.5 border-l border-t";

  const tooltip = showTooltip ? ReactDOM.createPortal(
    <div 
      style={tooltipStyle}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={handleMouseLeave}
      className={tooltipClasses}
    >
      <div 
        className={arrowClasses}
        style={arrowStyle}
      ></div>
      <p className="leading-relaxed">{content}</p>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative inline-block ml-2">
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          handleMouseEnter();
        }}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors cursor-help focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex-shrink-0"
        aria-label="Más información"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {tooltip}
    </div>
  );
};

export default InfoTooltip;

