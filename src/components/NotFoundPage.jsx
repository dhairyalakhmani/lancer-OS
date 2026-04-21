const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      
      <svg
        className="w-full max-w-[450px] h-auto mb-8 select-none"
        viewBox="0 0 400 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Astronaut floating in space - 404 Error"
      >
        <text 
          x="60" 
          y="160" 
          fontSize="150" 
          fontWeight="900" 
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          className="fill-slate-800 dark:fill-slate-200 transition-colors"
          textAnchor="middle"
        >
          4
        </text>

        <text 
          x="340" 
          y="160" 
          fontSize="150" 
          fontWeight="900" 
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          className="fill-slate-800 dark:fill-slate-200 transition-colors"
          textAnchor="middle"
        >
          4
        </text>

        <g transform="translate(200, 100)">
          
          <circle cx="0" cy="0" r="65" className="fill-slate-200 dark:fill-slate-800 transition-colors" />
          
          <circle cx="-30" cy="-25" r="12" className="fill-slate-300 dark:fill-slate-700 transition-colors" opacity="0.6"/>
          <circle cx="25" cy="30" r="18" className="fill-slate-300 dark:fill-slate-700 transition-colors" opacity="0.6"/>
          <circle cx="15" cy="-40" r="8" className="fill-slate-300 dark:fill-slate-700 transition-colors" opacity="0.6"/>

          <path d="M -70 -50 L -68 -42 L -60 -40 L -68 -38 L -70 -30 L -72 -38 L -80 -40 L -72 -42 Z" className="fill-primary-500" />
          <path d="M 60 -60 L 61 -54 L 67 -53 L 61 -52 L 60 -46 L 59 -52 L 53 -53 L 59 -54 Z" className="fill-primary-400" />
          <path d="M 40 60 L 42 65 L 47 67 L 42 69 L 40 74 L 38 69 L 33 67 L 38 65 Z" className="fill-primary-500" />
          <path d="M -40 75 L -39 79 L -35 80 L -39 81 L -40 85 L -41 81 L -45 80 L -41 79 Z" className="fill-primary-400" />


          <path 
            d="M -30 0 C -60 -10, -70 -40, -85 -25" 
            fill="none" 
            className="stroke-primary-500" 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeDasharray="40 8"
          />
          <circle cx="-90" cy="-20" r="2.5" className="fill-primary-500" />
          <circle cx="-83" cy="-32" r="1.5" className="fill-primary-500" />

          <rect x="-35" y="-5" width="20" height="40" rx="6" transform="rotate(15 -25 15)" className="fill-white dark:fill-slate-300 stroke-slate-900 dark:stroke-slate-100 transition-colors" strokeWidth="4" />
          
          <rect x="-20" y="5" width="40" height="50" rx="15" transform="rotate(15 0 30)" className="fill-white dark:fill-slate-100 stroke-slate-900 dark:stroke-slate-100 transition-colors" strokeWidth="4" />
          
          <circle cx="5" cy="-15" r="24" className="fill-white dark:fill-slate-100 stroke-slate-900 dark:stroke-slate-100 transition-colors" strokeWidth="4" />
          
          <rect x="-5" y="-25" width="26" height="18" rx="9" transform="rotate(10 8 -16)" className="fill-slate-900 dark:fill-slate-800 transition-colors" />
          
          <path d="M -15 25 C -30 30, -25 45, -15 45" fill="none" className="stroke-slate-900 dark:stroke-slate-100 transition-colors" strokeWidth="4" strokeLinecap="round" />
          
          <path d="M 15 20 C 35 25, 30 40, 20 45" fill="none" className="stroke-slate-900 dark:stroke-slate-100 transition-colors" strokeWidth="4" strokeLinecap="round" />
          
          <path d="M -10 50 C -15 65, -5 75, 5 70" fill="none" className="stroke-slate-900 dark:stroke-slate-100 transition-colors" strokeWidth="4" strokeLinecap="round" />
          <path d="M 10 45 C 25 55, 20 70, 10 75" fill="none" className="stroke-slate-900 dark:stroke-slate-100 transition-colors" strokeWidth="4" strokeLinecap="round" />

        </g>
      </svg>
      
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-gray-100 mb-3">
        Oops! You look lost.
      </h2>
      
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mb-8">
        The page you are looking for has drifted off into deep space, or the link is broken.
      </p>

      <button 
        onClick={() => window.history.back()}
        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-medium rounded-md transition-colors"
      >
        Take me back
      </button>
    </div>
  );
};

export default NotFoundPage;