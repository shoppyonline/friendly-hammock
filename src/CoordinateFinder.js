import React, { useState, useRef } from 'react';

function CoordinateFinder() {
  const [coordinates, setCoordinates] = useState([]);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleImageClick = (event) => {
    const rect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    // Use offset relative to the container, not the page
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const newCoord = {
      id: coordinates.length + 1,
      x: Math.round(x * 10) / 10, // Round to 1 decimal place
      y: Math.round(y * 10) / 10,
      tolerance: 25,
      description: `Difference ${coordinates.length + 1}`
    };
    
    setCoordinates([...coordinates, newCoord]);
  };

  const copyToClipboard = () => {
    const coordString = JSON.stringify(coordinates, null, 2);
    navigator.clipboard.writeText(coordString);
    alert('Coordinates copied to clipboard!');
  };

  const clearCoordinates = () => {
    setCoordinates([]);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Coordinate Finder Tool</h2>
      <p>Click on the differences in your image to get coordinates</p>
      
      <div
        ref={containerRef}
        style={{
          margin: '20px auto',
          display: 'inline-block',
          position: 'relative',
          maxWidth: '100%',
        }}
      >
        <img
          ref={imageRef}
          src={process.env.PUBLIC_URL + '/top_image.png'}
          alt="Coordinate finder"
          style={{ 
            display: 'block',
            cursor: 'crosshair',
            maxWidth: '100%',
            height: 'auto',
            border: '2px solid #ccc'
          }}
          onClick={handleImageClick}
        />
        {/* Click Indicators */}
        {coordinates.map(coord => (
          <div
            key={coord.id}
            style={{
              position: 'absolute',
              left: `${coord.x}%`,
              top: `${coord.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              border: '2px solid red',
              borderRadius: '50%',
              background: 'rgba(255, 0, 0, 0.3)',
              pointerEvents: 'none'
            }}
          />
        ))}
      </div>

      {/* Coordinates List */}
      {coordinates.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Found Coordinates:</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '8px',
            textAlign: 'left',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {JSON.stringify(coordinates, null, 2)}
          </pre>
          
          <div style={{ marginTop: '15px' }}>
            <button
              onClick={copyToClipboard}
              style={{
                padding: '10px 20px',
                margin: '0 10px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Copy to Clipboard
            </button>
            
            <button
              onClick={clearCoordinates}
              style={{
                padding: '10px 20px',
                margin: '0 10px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>Click on each difference in your image</li>
          <li>Red circles will appear where you clicked</li>
          <li>Copy the coordinates and paste them into your SpotTheDifferenceGame.js</li>
          <li>Adjust the tolerance and descriptions as needed</li>
        </ol>
      </div>
    </div>
  );
}

export default CoordinateFinder; 