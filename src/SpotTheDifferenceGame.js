import React, { useState, useRef } from "react";

function SpotTheDifferenceGame() {
  const [foundDifferences, setFoundDifferences] = useState(new Set());
  const [showHint, setShowHint] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Refs for containers
  const topContainerRef = useRef(null);
  const bottomContainerRef = useRef(null);

  // 6 difference spots, same for both images
  const differences = [
  {
    "id": 1,
    "x": 64.7,
    "y": 9.7,
    "tolerance": 25,
    "description": "girl"
  },
  {
    "id": 2,
    "x": 51.7,
    "y": 40.5,
    "tolerance": 25,
    "description": "ball"
  },
  {
    "id": 3,
    "x": 91.5,
    "y": 93.3,
    "tolerance": 25,
    "description": "radio"
  },
  {
    "id": 4,
    "x": 41,
    "y": 54.6,
    "tolerance": 25,
    "description": "glasses"
  },
  {
    "id": 5,
    "x": 24.5,
    "y": 31.2,
    "tolerance": 25,
    "description": "boy"
  },
  {
    "id": 6,
    "x": 7.5,
    "y": 54.2,
    "tolerance": 25,
    "description": "wheels"
  }
];

  const totalDifferences = differences.length;

  const handleImageClick = (event, containerRef) => {
    if (gameComplete) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    differences.forEach(diff => {
      if (foundDifferences.has(diff.id)) return;
      const distance = Math.sqrt(
        Math.pow(x - diff.x, 2) + Math.pow(y - diff.y, 2)
      );
      // Convert tolerance from pixels to percentage
      const tolerancePercent = (diff.tolerance / Math.min(rect.width, rect.height)) * 100;
      if (distance <= tolerancePercent) {
        const newFound = new Set(foundDifferences);
        newFound.add(diff.id);
        setFoundDifferences(newFound);
        if (newFound.size === totalDifferences) {
          setGameComplete(true);
        }
      }
    });
  };

  const resetGame = () => {
    setFoundDifferences(new Set());
    setShowHint(false);
    setGameComplete(false);
  };

  const getProgressPercentage = () => {
    return (foundDifferences.size / totalDifferences) * 100;
  };

  // Helper to render indicators for a given container
  const renderIndicators = (foundOnly = false) =>
    (foundOnly ? Array.from(foundDifferences) : differences.map(d => d.id)).map(diffId => {
      const diff = differences.find(d => d.id === diffId);
      if (!diff) return null;
      return (
        <div
          key={diffId + (foundOnly ? '-found' : '-hint')}
          style={{
            position: 'absolute',
            left: `${diff.x}%`,
            top: `${diff.y}%`,
            transform: 'translate(-50%, -50%)',
            width: foundOnly ? '40px' : '30px',
            height: foundOnly ? '40px' : '30px',
            border: foundOnly ? '3px solid #4CAF50' : '2px dashed #ff9800',
            borderRadius: '50%',
            background: foundOnly ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.1)',
            pointerEvents: 'none',
            animation: foundOnly ? 'pulse 1s ease-in-out' : 'blink 1.5s infinite'
          }}
        />
      );
    });

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2 style={{ marginBottom: 0 }}>Spot the Difference</h2>
      <p style={{ marginTop: 0 }}>Click on the differences in the pictures. There are {totalDifferences}!</p>
      {/* Progress and Controls Container */}
      <div className="game_controls" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        margin: "16px 0",
        gap: 16
      }}>
        {/* Progress Bar - Left aligned */}
        <div style={{ 
          width: "100%", 
          background: "#f0f0f0", 
          borderRadius: "10px", 
          overflow: "hidden",
          border: "2px solid #ddd"
        }}>
          <div style={{
            width: `${getProgressPercentage()}%`,
            height: "20px",
            background: "linear-gradient(90deg, #4CAF50, #45a049)",
            transition: "width 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {foundDifferences.size}/{totalDifferences}
          </div>
        </div>
        {/* Controls - Right aligned */}
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={() => setShowHint(!showHint)}
            style={{
              padding: '8px 16px',
              border: '2px solid #ff9800',
              background: showHint ? '#ff9800' : 'white',
              color: showHint ? 'white' : '#ff9800',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          <button
            onClick={resetGame}
            style={{
              padding: '8px 16px',
              border: '2px solid #2196F3',
              background: 'white',
              color: '#2196F3',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            Reset Game
          </button>
        </div>
      </div>
      {/* Game Images */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        gap: 24,
        position: "relative"
      }}>
        {/* Top Image and indicators */}
        <div ref={topContainerRef} className="spot-diff-image-container" style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '100%' }}>
          <img
            src={process.env.PUBLIC_URL + '/top_image.png'}
            alt="Top spot the difference"
            style={{ 
              display: 'block',
              cursor: 'pointer',
              maxWidth: '100%',
              height: 'auto',
              width: '100%'
            }}
            onClick={e => handleImageClick(e, topContainerRef)}
          />
          {/* Found Difference Indicators for top image */}
          {renderIndicators(true)}
          {/* Hint Indicators for top image */}
          {showHint && renderIndicators(false)}
        </div>
        {/* Bottom Image and indicators */}
        <div ref={bottomContainerRef} className="spot-diff-image-container" style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '100%' }}>
          <img
            src={process.env.PUBLIC_URL + '/bottom_image.png'}
            alt="Bottom spot the difference"
            style={{ 
              display: 'block',
              cursor: 'pointer',
              maxWidth: '100%',
              height: 'auto',
              width: '100%'
            }}
            onClick={e => handleImageClick(e, bottomContainerRef)}
          />
          {/* Found Difference Indicators for bottom image */}
          {renderIndicators(true)}
          {/* Hint Indicators for bottom image */}
          {showHint && renderIndicators(false)}
        </div>
      </div>

      {/* Completion Message */}
      {gameComplete && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <h3 style={{ color: '#4CAF50', marginBottom: 16 }}>🎉 Congratulations! 🎉</h3>
          <p>You found all {totalDifferences} differences!</p>
          <button
            onClick={resetGame}
            style={{
              marginTop: 16,
              padding: '12px 24px',
              border: 'none',
              background: '#4CAF50',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Play Again
          </button>
        </div>
      )}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default SpotTheDifferenceGame; 