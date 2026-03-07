'use client'

import Image from 'next/image'

export function LoadingScreen() {
  return (
    <>
      <style>{`
        @keyframes comet-spin {
          0%   { 
            stroke-dashoffset: 276;
            stroke: #6b7fa3;
          }
          85%  { 
            stroke: #6b7fa3;
          }
          92%  { 
            stroke: #f5c518;
            filter: drop-shadow(0 0 6px rgba(245,197,24,0.9));
          }
          100% { 
            stroke-dashoffset: 0;
            stroke: #6b7fa3;
            filter: drop-shadow(0 0 0px rgba(245,197,24,0));
          }
        }
        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.04); }
        }
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 0px rgba(245, 197, 24, 0));
          }
          50% {
            transform: scale(1.07);
            filter: drop-shadow(0 0 8px rgba(245, 197, 24, 0.35));
          }
        }
        @keyframes expand-tracking {
          from { letter-spacing: 0.05em; opacity: 0; }
          to   { letter-spacing: 0.4em;  opacity: 1; }
        }
        @keyframes load-bar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .ls-ring-svg {
          animation: ring-pulse 2.4s ease-in-out infinite;
        }
        .ls-comet {
          animation: comet-spin 2.4s ease-in-out infinite;
          transform-origin: center;
          transform-box: fill-box;
        }
        .ls-silhouette {
          animation: breathe 2.4s ease-in-out infinite;
        }
        .ls-text {
          opacity: 0;
          animation: expand-tracking 800ms ease-out 400ms forwards;
        }
        .ls-bar-fill {
          width: 0%;
          animation: load-bar 2s ease-in-out 300ms forwards;
        }
        .ls-wrapper {
          opacity: 0;
          animation: fade-in 300ms ease-out forwards;
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: '#191919' }}
      >
        <div className="ls-wrapper flex flex-col items-center gap-6">

          {/* Anillo + Silueta */}
          <div className="relative"
            style={{ width: 96, height: 96 }}
          >
            {/* Anillo giratorio */}
            <svg
              className="absolute inset-0 ls-ring-svg"
              viewBox="0 0 96 96"
              fill="none"
              style={{ width: '100%', height: '100%' }}
            >
              {/* Anillo base estático */}
              <circle
                cx="48" cy="48" r="44"
                stroke="rgba(107,127,163,0.2)"
                strokeWidth="2"
                fill="none"
              />
              {/* Trazo activo tipo cometa */}
              <circle
                cx="48" cy="48" r="44"
                stroke="url(#comet-gradient)"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="110 166"
                strokeDashoffset="0"
                className="ls-comet"
              />
              <defs>
                <linearGradient id="comet-gradient"
                  x1="0%" y1="0%" x2="100%" y2="0%"
                  gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#6b7fa3" stopOpacity="0" />
                  <stop offset="60%" stopColor="#6b7fa3" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6b7fa3" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
            {/* Silueta centrada */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="ls-silhouette">
                <Image
                  src="/2.png"
                  alt="Fitness Bassi"
                  width={56}
                  height={56}
                  className="object-contain"
                  style={{ mixBlendMode: 'screen' }}
                  priority
                />
              </div>
            </div>
          </div>

          {/* Texto BASSI */}
          <p
            className="ls-text font-mono text-sm"
            style={{ color: '#6b7fa3' }}
          >
            BASSI
          </p>

          {/* Barra decorativa */}
          <div
            style={{
              width: 88,
              height: 2,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 9999,
              overflow: 'hidden',
            }}
          >
            <div
              className="ls-bar-fill"
              style={{
                height: '100%',
                background: '#6b7fa3',
                borderRadius: 9999,
              }}
            />
          </div>

        </div>
      </div>
    </>
  )
}

export default LoadingScreen
