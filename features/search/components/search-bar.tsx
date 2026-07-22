import { Search, X } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
};

/** Campo de busca controlado — a instantaneidade e o debounce ficam a cargo de quem consome. */
export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar por nome, ingrediente ou categoria",
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Buscar no cardápio"
        className="h-12 w-full rounded-full border border-input bg-background pr-11 pl-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
