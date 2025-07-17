import React, { useState } from "react";
import { Analytics } from '@vercel/analytics/react';
import DrawingGame from "./DrawingGame";
import SpotTheDifferenceGame from "./SpotTheDifferenceGame";
import Header from "./Header";
import Footer from "./Footer";
import "./App.css";

function App() {
  const [page, setPage] = useState(0);
  
  const handlePrev = () => setPage((prev) => (prev === 0 ? 1 : prev - 1));
  const handleNext = () => setPage((prev) => (prev === 1 ? 0 : prev + 1));
  
  const games = [
    <DrawingGame />, 
    <SpotTheDifferenceGame />
  ];

  return (
    <div className="App">
      <Header />
      {games[page]}
      <Footer onPrevPage={handlePrev} onNextPage={handleNext} page={page} totalPages={games.length} />
      <Analytics />
    </div>
  );
}

export default App;
