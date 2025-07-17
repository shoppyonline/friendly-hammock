import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Pencil,
  Palette,
  UsersThree,
  Trash,
  FloppyDisk,
  Eraser,
  ArrowUUpLeft,
  ArrowUUpRight
} from 'phosphor-react';

const TOOL = {
  PENCIL: 'pencil',
  ERASER: 'eraser',
  ADD_CHAR: 'add_char',
};

function DrawingGame() {
  const canvasRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState(TOOL.PENCIL);
  const [color, setColor] = useState('#222');
  const [size, setSize] = useState(4);
  const [paths, setPaths] = useState([]); // {tool, color, size, points: [{x, y}]}
  const [redoStack, setRedoStack] = useState([]);
  const [showSizeSlider, setShowSizeSlider] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const sizeButtonRef = useRef(null);
  const sliderRef = useRef(null);
  const paletteButtonRef = useRef(null);
  const palettePopupRef = useRef(null);
  const PALETTE_COLORS = [
    '#222', '#E53935', '#1976D2', '#43A047', '#FBC02D', '#FF9800', '#8E24AA', '#00B8D4'
  ];
  const bgImageRef = useRef(null);
  const [hoveredControl, setHoveredControl] = useState(null);

  // Hide popups when clicking outside or changing tool
  useEffect(() => {
    if (!showSizeSlider && !showPalette) return;
    function handleClick(e) {
      if (
        (showSizeSlider && sizeButtonRef.current && !sizeButtonRef.current.contains(e.target) && sliderRef.current && !sliderRef.current.contains(e.target)) &&
        (showPalette && paletteButtonRef.current && !paletteButtonRef.current.contains(e.target) && palettePopupRef.current && !palettePopupRef.current.contains(e.target))
      ) {
        setShowSizeSlider(false);
        setShowPalette(false);
      } else if (showSizeSlider && sizeButtonRef.current && !sizeButtonRef.current.contains(e.target) && sliderRef.current && !sliderRef.current.contains(e.target)) {
        setShowSizeSlider(false);
      } else if (showPalette && paletteButtonRef.current && !paletteButtonRef.current.contains(e.target) && palettePopupRef.current && !palettePopupRef.current.contains(e.target)) {
        setShowPalette(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSizeSlider, showPalette]);
  useEffect(() => {
    setShowSizeSlider(false);
    setShowPalette(false);
  }, [tool]);

  // Drawing handlers
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
    }
  };

  const handleStart = (e) => {
    setDrawing(true);
    const pos = getPos(e);
    setPaths((prev) => [
      ...prev,
      { tool, color, size, points: [pos] }
    ]);
    setRedoStack([]);
  };

  const handleMove = (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    setPaths((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      const updated = { ...last, points: [...last.points, pos] };
      return [...prev.slice(0, -1), updated];
    });
  };

  const handleEnd = () => setDrawing(false);

  // Robust background image drawing
  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext('2d');
    let img = bgImageRef.current;
    if (!img) {
      img = new window.Image();
      img.src = process.env.PUBLIC_URL + '/hammock_image.jpg';
      bgImageRef.current = img;
    }
    const draw = () => {
      ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      if (img.complete) {
        // Draw image at its actual size, centered on canvas
        const scale = Math.min(bgCanvas.width / img.naturalWidth, bgCanvas.height / img.naturalHeight);
        const scaledWidth = img.naturalWidth * scale;
        const scaledHeight = img.naturalHeight * scale;
        const x = (bgCanvas.width - scaledWidth) / 2;
        const y = (bgCanvas.height - scaledHeight) / 2;
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      } else {
        img.onload = () => {
          ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
          // Draw image at its actual size, centered on canvas
          const scale = Math.min(bgCanvas.width / img.naturalWidth, bgCanvas.height / img.naturalHeight);
          const scaledWidth = img.naturalWidth * scale;
          const scaledHeight = img.naturalHeight * scale;
          const x = (bgCanvas.width - scaledWidth) / 2;
          const y = (bgCanvas.height - scaledHeight) / 2;
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        };
      }
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => {
      ctx.save();
      if (path.tool === TOOL.ERASER) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = path.color;
      }
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      path.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.restore();
    });
    ctx.globalCompositeOperation = 'source-over';
  }, [paths]);

  // Toolbar actions
  const handleUndo = () => {
    if (paths.length === 0) return;
    setRedoStack((r) => [paths[paths.length - 1], ...r]);
    setPaths((p) => p.slice(0, -1));
  };
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    setPaths((p) => [...p, redoStack[0]]);
    setRedoStack((r) => r.slice(1));
  };
  const handleClear = () => {
    setPaths([]);
    setRedoStack([]);
  };
  const handleSave = () => {
    // Save the combined image (background + drawing)
    const bgCanvas = bgCanvasRef.current;
    const drawingCanvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = bgCanvas.width;
    tempCanvas.height = bgCanvas.height;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(bgCanvas, 0, 0);
    ctx.drawImage(drawingCanvas, 0, 0);
    const link = document.createElement('a');
    link.download = 'friendly-hammock-drawing.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  // Helper for icon button style
  const iconButtonStyle = (selected) => selected
    ? {
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
        gap: 10,
        width: 48,
        height: 48,
        background: '#148EFF',
        border: '1px solid #EFEFEF',
        borderRadius: 8,
        flex: 'none',
        order: 0,
        flexGrow: 0,
        color: '#fff',
        outline: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s, color 0.2s',
        position: 'relative',
      }
    : {
        background: 'transparent',
        color: '#444',
        border: 'none',
        borderRadius: '50%',
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s, color 0.2s',
        outline: 'none',
        position: 'relative',
        padding: 0,
      };

  // Tooltip style
  const tooltipStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px 16px',
    gap: 10,
    background: '#7A7A7A',
    borderRadius: 8,
    fontFamily: 'Inter, Arial, sans-serif',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: 13,
    lineHeight: '16px',
    textAlign: 'center',
    color: '#FFFFFF',
    position: 'absolute',
    bottom: '110%',
    left: '50%',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
    zIndex: 20,
    pointerEvents: 'none',
  };

  // Helper to detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  // Pencil size slider modal for mobile
  const pencilSizeSliderModal = isMobile && showSizeSlider ? ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.2)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }} onClick={() => setShowSizeSlider(false)}>
      <div
        style={{
          background: '#fff',
          border: '1px solid #EFEFEF',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          padding: '24px 16px',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <input
          type="range"
          min={6}
          max={20}
          value={size}
          onChange={e => setSize(Number(e.target.value))}
          style={{
            width: 120,
            height: 32,
            margin: '0 0 12px 0',
          }}
        />
        <div style={{ fontSize: 16 }}>Pencil Size: {size}</div>
        <button style={{ marginTop: 12, padding: '6px 18px', borderRadius: 8, border: 'none', background: '#148EFF', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }} onClick={() => setShowSizeSlider(false)}>Close</button>
      </div>
    </div>,
    document.body
  ) : null;

  // Mobile tooltips
  const mobileTooltips = isMobile && hoveredControl ? ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 70,
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        background: '#7A7A7A',
        borderRadius: 8,
        fontFamily: 'Comic Sans MS',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: 13,
        lineHeight: '16px',
        textAlign: 'center',
        color: '#FFFFFF',
        padding: '8px 16px',
        whiteSpace: 'nowrap',
        pointerEvents: 'auto',
      }}>
        {hoveredControl === 'pencil' && 'Pencil'}
        {hoveredControl === 'size' && 'Pencil Size'}
        {hoveredControl === 'palette' && 'Color'}
        {hoveredControl === 'addchar' && 'Add Characters'}
        {hoveredControl === 'eraser' && 'Eraser'}
        {hoveredControl === 'undo' && 'Undo'}
        {hoveredControl === 'redo' && 'Redo'}
        {hoveredControl === 'clear' && 'Clear'}
        {hoveredControl === 'save' && 'Save'}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: 0, margin: 0 }}>
      <div
        className="the_card drawinggame-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px 24px 16px',
            gap: 24,
            background: '#FFFFFF',
            border: '1px solid #EFEFEF',
            boxShadow: '0px 4px 20px 1px rgba(0, 0, 0, 0.08)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 540,
            margin: '0 auto', // horizontal centering only, no top margin
          }}
        >
          {/* 1. Canvas */}
          <div className="drawinggame-canvas-container" style={{ width: '100%', position: 'relative', aspectRatio: '540 / 340', maxWidth: '100%' }}>
            <canvas
              ref={bgCanvasRef}
              width={540}
              height={340}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: 8,
                background: '#fff',
                pointerEvents: 'none',
                zIndex: 1,
                display: 'block',
              }}
              tabIndex={-1}
            />
            <canvas
              ref={canvasRef}
              width={540}
              height={340}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: 8,
                background: 'transparent',
                touchAction: 'none',
                cursor: tool === TOOL.ERASER ? 'cell' : 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\'><path d=\'M3 21l18-18-3-3-18 18 3 3z\'/><path d=\'M9 3l12 12\'/></svg>") 0 24, auto',
                zIndex: 2,
                display: 'block',
              }}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            />
          </div>
          {/* 2. Header image and subtitle */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={process.env.PUBLIC_URL + '/the_friendly_hammock_header.png'}
              alt="The Friendly Hammock header"
              style={{
                width: '100%',
                maxWidth: 480,
                height: 'auto',
                display: 'block',
                margin: '0 auto',
                marginBottom: 0,
              }}
            />
            <div style={{ color: '#e53935', fontWeight: 700, fontSize: 18, margin: '8px 0 0 0', letterSpacing: 0.2, textAlign: 'center' }}>
              Draw a picture of yourself and who <span style={{ color: '#1976d2', fontWeight: 700 }}>YOU</span> would include in your Hammock!
            </div>
          </div>
          {/* 3. Toolbar */}
          <div className="drawinggame-toolbar" style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: '8px 12px',
            gap: 16,
            background: '#F5F5F5',
            border: '1px solid #EFEFEF',
            borderRadius: 12,
            zIndex: 2,
            width: '100%',
            maxWidth: 540,
            position: 'relative',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}>
            {/* Pencil tool button */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                title="Pencil"
                onClick={() => setTool(TOOL.PENCIL)}
                style={iconButtonStyle(tool === TOOL.PENCIL)}
                onMouseEnter={() => setHoveredControl('pencil')}
                onMouseLeave={() => setHoveredControl(null)}
                onFocus={() => setHoveredControl('pencil')}
                onBlur={() => setHoveredControl(null)}
              >
                <Pencil size={24} weight="regular" color={tool === TOOL.PENCIL ? '#fff' : '#444'} strokeWidth={3} />
              </button>
              {!isMobile && hoveredControl === 'pencil' && (
                <div style={tooltipStyle}>Pencil</div>
              )}
            </div>
            {/* Pencil size control */}
            <div style={{ position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                ref={sizeButtonRef}
                title="Pencil Size"
                style={{
                  width: 32,
                  height: 32,
                  border: '2px solid #111',
                  borderRadius: '50%',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'border 0.2s',
                }}
                onClick={() => setShowSizeSlider((v) => !v)}
                onMouseEnter={() => setHoveredControl('size')}
                onMouseLeave={() => setHoveredControl(null)}
                onFocus={() => setHoveredControl('size')}
                onBlur={() => setHoveredControl(null)}
              >
                <div
                  style={{
                    width: Math.max(6, Math.min(20, size)),
                    height: Math.max(6, Math.min(20, size)),
                    background: color,
                    borderRadius: '50%',
                    transition: 'width 0.2s, height 0.2s, background 0.2s',
                  }}
                />
              </button>
              {!isMobile && hoveredControl === 'size' && (
                <div style={tooltipStyle}>Pencil Size</div>
              )}
              {!isMobile && showSizeSlider && (
                <div
                  ref={sliderRef}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 36,
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    border: '1px solid #EFEFEF',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    padding: '12px 8px',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="range"
                    min={6}
                    max={20}
                    value={size}
                    onChange={e => setSize(Number(e.target.value))}
                    style={{
                      writingMode: 'bt-lr',
                      WebkitAppearance: 'slider-vertical',
                      width: 20,
                      height: 80,
                    }}
                  />
                </div>
              )}
            </div>
            {/* Color palette popup */}
            <div style={{ position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                ref={paletteButtonRef}
                title="Color Palette"
                style={iconButtonStyle(false)}
                onClick={() => setShowPalette((v) => !v)}
                onMouseEnter={() => setHoveredControl('palette')}
                onMouseLeave={() => setHoveredControl(null)}
                onFocus={() => setHoveredControl('palette')}
                onBlur={() => setHoveredControl(null)}
              >
                <Palette size={24} weight="regular" color={color} strokeWidth={3} />
              </button>
              {hoveredControl === 'palette' && (
                <div style={tooltipStyle}>Color</div>
              )}
              {showPalette && (
                <div
                  ref={palettePopupRef}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 48,
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    border: '1px solid #EFEFEF',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    padding: '16px 12px',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 12,
                  }}
                >
                  {PALETTE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setColor(c); setShowPalette(false); }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: c === color ? '3px solid #148EFF' : '2px solid #eee',
                        background: c,
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'border 0.2s',
                        boxShadow: c === color ? '0 0 0 2px #148EFF33' : 'none',
                        margin: 0,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            {/* Add Characters */}
            <div className="add-characters-btn-mobile-hide" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                title="Add Characters"
                style={iconButtonStyle(tool === TOOL.ADD_CHAR)}
                onClick={() => setTool(TOOL.ADD_CHAR)}
                onMouseEnter={() => setHoveredControl('addchar')}
                onMouseLeave={() => setHoveredControl(null)}
                onFocus={() => setHoveredControl('addchar')}
                onBlur={() => setHoveredControl(null)}
              >
                <UsersThree size={24} weight="regular" color={tool === TOOL.ADD_CHAR ? '#fff' : '#444'} strokeWidth={3} />
              </button>
              {hoveredControl === 'addchar' && (
                <div style={tooltipStyle}>Add Characters</div>
              )}
            </div>
            {/* Eraser */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                title="Eraser"
                onClick={() => setTool(TOOL.ERASER)}
                style={iconButtonStyle(tool === TOOL.ERASER)}
                onMouseEnter={() => setHoveredControl('eraser')}
                onMouseLeave={() => setHoveredControl(null)}
                onFocus={() => setHoveredControl('eraser')}
                onBlur={() => setHoveredControl(null)}
              >
                <Eraser size={24} weight="regular" color={tool === TOOL.ERASER ? '#fff' : '#444'} strokeWidth={3} />
              </button>
              {hoveredControl === 'eraser' && (
                <div style={tooltipStyle}>Eraser</div>
              )}
            </div>
            {/* Undo */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                title="Undo"
                onClick={handleUndo}
                style={iconButtonStyle(false)}
                onMouseEnter={() => setHoveredControl('undo')}
                onMouseLeave={() => setHoveredControl(null)}
                onFocus={() => setHoveredControl('undo')}
                onBlur={() => setHoveredControl(null)}
              >
                <ArrowUUpLeft size={24} weight="regular" color="#444" strokeWidth={3} />
              </button>
              {hoveredControl === 'undo' && (
                <div style={tooltipStyle}>Undo</div>
              )}
            </div>
            {/* Redo */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                title="Redo"
                onClick={handleRedo}
                style={iconButtonStyle(false)}
                onMouseEnter={() => setHoveredControl('redo')}
                onMouseLeave={() => setHoveredControl(null)}
                onFocus={() => setHoveredControl('redo')}
                onBlur={() => setHoveredControl(null)}
              >
                <ArrowUUpRight size={24} weight="regular" color="#444" strokeWidth={3} />
              </button>
              {hoveredControl === 'redo' && (
                <div style={tooltipStyle}>Redo</div>
              )}
            </div>
            {/* Clear */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                title="Clear"
                onClick={handleClear}
                style={iconButtonStyle(false)}
                onMouseEnter={() => setHoveredControl('clear')}
                onMouseLeave={() => setHoveredControl(null)}
                onFocus={() => setHoveredControl('clear')}
                onBlur={() => setHoveredControl(null)}
              >
                <Trash size={24} weight="regular" color="#444" strokeWidth={3} />
              </button>
              {hoveredControl === 'clear' && (
                <div style={tooltipStyle}>Clear</div>
              )}
            </div>
            {/* Save */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                title="Save"
                onClick={handleSave}
                style={iconButtonStyle(false)}
                onMouseEnter={() => setHoveredControl('save')}
                onMouseLeave={() => setHoveredControl(null)}
                onFocus={() => setHoveredControl('save')}
                onBlur={() => setHoveredControl(null)}
              >
                <FloppyDisk size={24} weight="regular" color="#444" strokeWidth={3} />
              </button>
              {hoveredControl === 'save' && (
                <div style={tooltipStyle}>Save</div>
              )}
            </div>
          </div>
        </div>
        {/* Mobile pencil size slider modal */}
        {pencilSizeSliderModal}
        {/* Mobile tooltips */}
        {isMobile && hoveredControl && (
          ReactDOM.createPortal(
            <div style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 70,
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                background: '#7A7A7A',
                borderRadius: 8,
                fontFamily: 'Comic Sans MS',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: 13,
                lineHeight: '16px',
                textAlign: 'center',
                color: '#FFFFFF',
                padding: '8px 16px',
                whiteSpace: 'nowrap',
                pointerEvents: 'auto',
              }}>
                {hoveredControl === 'pencil' && 'Pencil'}
                {hoveredControl === 'size' && 'Pencil Size'}
                {hoveredControl === 'palette' && 'Color'}
                {hoveredControl === 'addchar' && 'Add Characters'}
                {hoveredControl === 'eraser' && 'Eraser'}
                {hoveredControl === 'undo' && 'Undo'}
                {hoveredControl === 'redo' && 'Redo'}
                {hoveredControl === 'clear' && 'Clear'}
                {hoveredControl === 'save' && 'Save'}
              </div>
            </div>,
            document.body
          )
        )}
      </div>
  );
}

export default DrawingGame; 