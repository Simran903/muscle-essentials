import React, { FC, useEffect, useMemo, useRef, useState } from "react";

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
  className?: string;
  openUp?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

type NormalizedOption = {
  value: string;
  label: string;
};

export const CustomDropdown: FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  className = "",
  openUp = false,
  searchable = false,
  searchPlaceholder = "Search...",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const targetNode = event.target as Node | null;

      if (!dropdownRef.current || !targetNode) return;

      if (!dropdownRef.current.contains(targetNode)) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeDropdown = (): void => {
    setIsOpen(false);
    setQuery("");
  };

  const toggleDropdown = (): void => {
    if (isOpen) {
      closeDropdown();
      return;
    }

    setIsOpen(true);
  };

  const filteredOptions = useMemo<NormalizedOption[]>(() => {
    const normalizedOptions = options.map((option) =>
      typeof option === "string"
        ? { value: option, label: option }
        : { value: option.value, label: option.label }
    );

    if (!searchable) return normalizedOptions;

    const normalizedQuery: string = query.trim().toLowerCase();
    if (!normalizedQuery) return normalizedOptions;

    return normalizedOptions.filter((option: NormalizedOption) =>
      option.label.toLowerCase().includes(normalizedQuery)
    );
  }, [options, query, searchable]);

  const selectedOption = useMemo<NormalizedOption | undefined>(() => {
    return filteredOptions.find((option) => option.value === value)
  }, [filteredOptions, value]);

  return (
    <div
      className={`relative w-full min-w-48 ${className}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="inline-flex justify-between w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        onClick={toggleDropdown}
      >
        <span className="truncate">{selectedOption?.label ?? value}</span>
        <svg
          className={`-mr-1 ml-2 h-5 w-5 shrink-0 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 left-0 z-300 w-full min-w-48 rounded-lg bg-white shadow-2xl ring-2 ring-gray-200/90 border border-gray-100 ${
            openUp ? "bottom-full mb-2 origin-bottom-right" : "mt-2 origin-top-right"
          }`}
        >
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          )}

          <div
            className="py[1] max-h-240 overflow-y-auto overscroll-contain"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {filteredOptions.map((option: NormalizedOption) => (
              <button
                type="button"
                key={option.value}
                className={`block px-4 py-2.5 text-sm w-full text-left transition-colors duration-150 ${
                  value === option.value
                    ? "bg-blue[100] text-blue[900] font-medium".replace(
                        /\[(\d+)\]/g,
                        "$1px"
                      )
                    : "text-gray[800] hover:bg-gray[100] hover:text-gray[950]"
                        .replace(/\[(\d+)\]/g, "$1px")
                        .replace(/text-gray\[800\]/g, "text-gray").replace(/hover:text-gray\[950\]/g, "hover:text-gray")
                }`}
                onClick={() => {
                  onChange(option.value);
                  closeDropdown();
                }}
              >
                {option.label}
              </button>
            ))}

            {filteredOptions.length === 0 && (
              <div className="px-4 py-2.5 text-sm text-gray">No matching options</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Dropdown = CustomDropdown;