import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

/**
 * Composant combiné Code postal + Ville avec auto-complétion
 * via l'API gouvernementale api-adresse.data.gouv.fr (sans clé API)
 * Fonctionne uniquement pour la France.
 */
export default function ZipCodeCityInput({ zipCode, city, country, onZipChange, onCityChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  const isFrance = !country || country.trim().toLowerCase() === "france" || country.trim().toLowerCase() === "fr";

  const fetchCities = async (zip) => {
    if (!zip || zip.length < 2 || !isFrance) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(zip)}&type=municipality&limit=6&postcode=${encodeURIComponent(zip)}`
      );
      const data = await res.json();
      const cities = (data.features || [])
        .map(f => ({
          city: f.properties.city || f.properties.label,
          postcode: f.properties.postcode,
        }))
        .filter((v, i, arr) => arr.findIndex(x => x.city === v.city) === i); // dédupliquer
      setSuggestions(cities);
      // Auto-remplir si une seule ville
      if (cities.length === 1) {
        onCityChange(cities[0].city);
        if (!zipCode) onZipChange(cities[0].postcode);
        setSuggestions([]);
      } else if (cities.length > 1) {
        setShowSuggestions(true);
      }
    } catch {
      // Silently ignore
    }
    setLoading(false);
  };

  const handleZipChange = (value) => {
    onZipChange(value);
    clearTimeout(debounceRef.current);
    if (value.length >= 4) {
      debounceRef.current = setTimeout(() => fetchCities(value), 400);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectCity = (suggestion) => {
    onCityChange(suggestion.city);
    onZipChange(suggestion.postcode);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Fermer les suggestions si clic en dehors
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3" ref={containerRef}>
      <div className="relative">
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Code postal *</Label>
        <div className="relative">
          <Input
            value={zipCode || ""}
            onChange={e => handleZipChange(e.target.value)}
            placeholder="75001"
            className="h-11 rounded-xl pr-8"
            inputMode="numeric"
          />
          {loading && (
            <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>
      <div className="relative">
        <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ville *</Label>
        <Input
          value={city || ""}
          onChange={e => onCityChange(e.target.value)}
          onFocus={() => suggestions.length > 1 && setShowSuggestions(true)}
          placeholder="Paris"
          className="h-11 rounded-xl"
        />
        {showSuggestions && suggestions.length > 1 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => selectCity(s)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-rose-50 hover:text-rose-700 transition border-b border-gray-100 last:border-0"
              >
                <span className="font-semibold">{s.postcode}</span> — {s.city}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}