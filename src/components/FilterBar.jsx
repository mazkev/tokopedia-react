import { useState } from 'react';
import { locations } from '../data/products';

export default function FilterBar({ filters, onChange }) {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const toggle = (key, value) => {
    onChange({ ...filters, [key]: filters[key] === value ? null : value });
  };

  const applyPrice = () => {
    onChange({
      ...filters,
      minPrice: minPrice ? parseInt(minPrice) : null,
      maxPrice: maxPrice ? parseInt(maxPrice) : null,
    });
  };

  return (
    <section className="filter-section" id="filter-section">
      <div className="filter-bar">
        <span className="filter-label">🔽 Filter:</span>

        {/* Condition */}
        <button
          className={`filter-chip ${filters.condition === 'Baru' ? 'active' : ''}`}
          onClick={() => toggle('condition', 'Baru')}
          id="filter-baru"
        >
          Baru
        </button>
        <button
          className={`filter-chip ${filters.condition === 'Bekas' ? 'active' : ''}`}
          onClick={() => toggle('condition', 'Bekas')}
          id="filter-bekas"
        >
          Bekas
        </button>

        {/* Location */}
        {locations.slice(0, 5).map((loc) => (
          <button
            key={loc}
            className={`filter-chip ${filters.location === loc ? 'active' : ''}`}
            onClick={() => toggle('location', loc)}
          >
            {loc}
          </button>
        ))}

        {/* Price Range */}
        <div className="filter-price">
          <input
            className="filter-input"
            type="number"
            placeholder="Harga Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            id="filter-min-price"
          />
          <span style={{ color: '#9E9E9E' }}>-</span>
          <input
            className="filter-input"
            type="number"
            placeholder="Harga Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            id="filter-max-price"
          />
          <button className="filter-chip active" onClick={applyPrice} id="filter-apply-price">
            Terapkan
          </button>
        </div>
      </div>
    </section>
  );
}
