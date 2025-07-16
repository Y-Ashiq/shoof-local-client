import React, { useEffect, useRef, useState } from "react";

export interface Tag {
  _id: string;
  name: string;
}

interface TagFilterProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  setSelectedTagIds: (ids: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

const TagFilter: React.FC<TagFilterProps> = ({
  availableTags,
  selectedTagIds,
  setSelectedTagIds,
  className = "",
  style = {},
  placeholder = "Filter by tags...",
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div
      className={`relative w-full max-w-xs min-w-0 ${className}`}
      ref={dropdownRef}
      style={style}
    >
      {/* Pills for selected tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTagIds.map((id) => {
          const tag = availableTags.find((t) => t._id === id);
          if (!tag) return null;
          return (
            <span
              key={id}
              className="bg-purple-700 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 border border-purple-700 shadow-sm"
              style={{ fontSize: "12px", minHeight: "24px" }}
            >
              {tag.name}
              <button
                type="button"
                className="ml-1 text-white hover:text-gray-200 focus:outline-none"
                onClick={() =>
                  setSelectedTagIds(selectedTagIds.filter((tid) => tid !== id))
                }
                aria-label="Remove tag"
                style={{ fontSize: "14px", lineHeight: 1 }}
              >
                &times;
              </button>
            </span>
          );
        })}
        {selectedTagIds.length > 0 && (
          <button
            type="button"
            className="ml-2 px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs font-semibold border border-gray-300 hover:bg-gray-300"
            onClick={() => setSelectedTagIds([])}
            style={{ fontSize: "12px", minHeight: "24px" }}
          >
            Clear
          </button>
        )}
      </div>
      {/* Dropdown button */}
      <button
        type="button"
        className="w-full max-w-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300 flex justify-between items-center shadow-sm hover:border-purple-400 transition-all duration-150 min-w-0"
        style={{ minHeight: "32px", fontSize: "14px" }}
        onClick={() => setDropdownOpen((open) => !open)}
      >
        <span className="truncate text-sm">
          {selectedTagIds.length === 0
            ? placeholder
            : `${selectedTagIds.length} tag(s) selected`}
        </span>
        <svg
          className={`ml-2 w-4 h-4 transition-transform ${
            dropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* Dropdown list */}
      {dropdownOpen && (
        <div
          className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-44 overflow-auto p-2 flex flex-wrap gap-2 animate-fade-in w-full max-w-xs min-w-0"
          style={{}}
        >
          {availableTags.length === 0 ? (
            <div className="px-4 py-2 text-gray-400 text-xs w-full">
              No tags available
            </div>
          ) : (
            availableTags
              .filter((tag) => !selectedTagIds.includes(tag._id))
              .map((tag) => (
                <button
                  key={tag._id}
                  type="button"
                  className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 text-xs font-semibold hover:bg-purple-200 transition-colors border border-purple-200 shadow-sm flex items-center"
                  style={{ fontSize: "12px", minHeight: "24px" }}
                  onClick={() => {
                    setSelectedTagIds([...selectedTagIds, tag._id]);
                  }}
                >
                  {tag.name}
                </button>
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default TagFilter;
