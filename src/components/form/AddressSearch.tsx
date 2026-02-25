import { useRef, useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { useAddressSearch } from '../../hooks/useAddressSearch';
import type { BANFeature } from '../../types/ban.types';

interface AddressSearchProps {
  onAddressSelected: (feature: BANFeature) => void;
  placeholder?: string;
  className?: string;
}

export function AddressSearch({
  onAddressSelected,
  placeholder = 'Saisissez l\'adresse du bien (ex: 12 rue de la Paix, Paris)',
  className,
}: AddressSearchProps) {
  const { query, setQuery, suggestions, loading, clearSuggestions } = useAddressSearch({
    debounceMs: 300,
    minLength: 3,
  });
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSelect(feature: BANFeature) {
    setQuery(feature.properties.label);
    clearSuggestions();
    setOpen(false);
    onAddressSelected(feature);
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 text-base"
          autoComplete="street-address"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="text"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          <ul className="py-1 max-h-48 sm:max-h-72 overflow-auto">
            {suggestions.map((feature, i) => (
              <li key={feature.properties.id ?? i}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(feature)}
                  className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                >
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-navy-600" />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {feature.properties.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {feature.properties.postcode} {feature.properties.city}
                      {feature.properties.context ? ` — ${feature.properties.context}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
