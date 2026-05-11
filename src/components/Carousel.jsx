import { useState, useEffect, useRef, useCallback } from 'react';

const banners = [
  '/images/banner1.png',
  '/images/banner2.png',
  '/images/banner3.png',
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const go = (dir) => {
    setCurrent((prev) => (prev + dir + banners.length) % banners.length);
    resetTimer();
  };

  return (
    <section className="carousel-section" id="carousel-section">
      <div className="carousel-container">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((src, i) => (
            <div className="carousel-slide" key={i}>
              <img src={src} alt={`Promo banner ${i + 1}`} />
            </div>
          ))}
        </div>
        <button className="carousel-btn prev" onClick={() => go(-1)} aria-label="Previous">‹</button>
        <button className="carousel-btn next" onClick={() => go(1)} aria-label="Next">›</button>
        <div className="carousel-dots">
          {banners.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === current ? 'active' : ''}`}
              onClick={() => { setCurrent(i); resetTimer(); }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
