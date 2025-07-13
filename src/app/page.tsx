"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Brand {
  _id: string;
  name: string;
  description: string;
  image: string;
  tags?: string[];
  links?: string[];
  primaryColor?: string;
}

const HomePage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Brand[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const page = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(8); // Brands per page

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/brands?page=${page}`, {
          headers: {
            "x-api-key": "MySecertAPIKey",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch brands");
        const data = await res.json();
        let newBrands;
        if (Array.isArray(data)) {
          newBrands = data;
          setTotalPages(1);
        } else {
          newBrands = data.brands || [];
          setTotalPages(data.totalPages || 1);
        }
        if (newBrands.length === 0 && page > 1) {
          // If no brands and not on first page, go back to previous page
          router.push(`/?page=${page - 1}`);
          return;
        }
        setBrands(newBrands);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    router.push(`/?page=${newPage}`);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/brands/search?search=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            "x-api-key": "MySecertAPIKey",
          },
        }
      );
      if (!res.ok) {
        setSearchResults([]);
        return;
      }
      const data = await res.json();
      setSearchResults(data);
    } catch (err: any) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleSearchIconClick = () => {
    setSearchBarOpen((prev) => !prev);
    setSearchQuery("");
    setSearchResults([]);
  };

  function getContrastYIQ(hexcolor: string) {
    if (!hexcolor) return "#222";
    let color = hexcolor.replace("#", "");
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#222" : "#fff";
  }

  function getLinkIcon(link: string) {
    if (/facebook\.com/i.test(link)) {
      return (
        <svg
          className="inline"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.525 8.998h-3.02V7.498c0-.464.309-.572.527-.572h2.465V4.13L14.51 4.12c-3.01 0-3.49 2.26-3.49 3.71v1.168H8.5v3.002h2.52V20h3.485v-7.998h2.34l.18-3.004z" />
        </svg>
      );
    }
    if (/instagram\.com/i.test(link)) {
      return (
        <svg
          className="inline"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <circle cx="17.5" cy="6.5" r="1.5" />
        </svg>
      );
    }
    if (/tiktok\.com/i.test(link)) {
      return (
        <svg
          className="inline"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12.75 2v12.25a2.25 2.25 0 1 1-2.25-2.25c.124 0 .246.012.364.035V9.5a5.25 5.25 0 1 0 5.25 5.25V7.75c.414.31.885.55 1.4.7V11.5a7.75 7.75 0 1 1-7.75-7.75h3.986c.09.57.32 1.1.664 1.55H12.75z" />
        </svg>
      );
    }
    if (/twitter\.com/i.test(link)) {
      return (
        <svg
          className="inline"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4 1.64a9.09 9.09 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.5 1c-2.5 0-4.5 2.01-4.5 4.5 0 .35.04.69.11 1.02C7.69 6.4 4.07 4.67 1.64 1.64c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.94 3.65A4.48 4.48 0 0 1 1 6.13v.06c0 2.13 1.52 3.91 3.54 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.72 2.16 2.97 4.07 3A9.05 9.05 0 0 1 1 19.54a12.8 12.8 0 0 0 6.95 2.04c8.34 0 12.9-6.91 12.9-12.9 0-.2 0-.39-.01-.58A9.22 9.22 0 0 0 23 3z" />
        </svg>
      );
    }
    return (
      <svg
        className="inline"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <ellipse cx="12" cy="12" rx="4" ry="10" />
        <path d="M2 12h20" />
      </svg>
    );
  }

  const handleCardClick = async (brandId: string) => {
    setModalOpen(true);
    setModalLoading(true);
    setModalError("");
    try {
      const res = await fetch(`http://localhost:3000/brands/${brandId}`, {});
      if (!res.ok) throw new Error("Failed to fetch brand details");
      const data = await res.json();
      setSelectedBrand(data);
    } catch (err: any) {
      setModalError(err.message || "Unknown error");
      setSelectedBrand(null);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBrand(null);
    setModalError("");
  };

  const displayBrands = searchQuery ? searchResults : brands;

  return (
    <>
      {/* Navbar */}
      <nav className="w-full border-b border-gray-200 bg-white mb-8">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Hamburger Icon */}
            <button aria-label="Open menu" className="focus:outline-none">
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <span
              className="text-lg sm:text-xl md:text-2xl font-bold tracking-wider text-gray-900"
              style={{ fontFamily: "var(--font-abril)" }}
            >
              shoof local
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Icon on the right */}
            <button
              aria-label="Search"
              className="focus:outline-none hover:opacity-80 transition-opacity"
              onClick={handleSearchIconClick}
            >
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>
        {/* Search bar extends below navbar when open */}
        {searchBarOpen && (
          <div className="w-full bg-white border-t border-gray-200 flex justify-center py-4 animate-fadeIn">
            <div className="w-full max-w-xl flex items-center relative">
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 text-base shadow focus:outline-none focus:ring-0 border-0"
                autoFocus
              />
              <button
                onClick={() => {
                  setSearchBarOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="absolute right-2 text-gray-400 hover:text-gray-700"
                aria-label="Close search"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </nav>
      {/* Main content */}
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Brands"}
          </h1>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {searchLoading && (
            <div className="text-gray-600 mb-4">Searching...</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {displayBrands.map((brand) => {
              const bgColor = brand.primaryColor || "#fff";
              const textColor = getContrastYIQ(bgColor);
              return (
                <div
                  key={brand._id}
                  className="rounded-xl shadow-lg flex flex-col justify-between h-full border border-gray-200 cursor-pointer transition-transform hover:scale-105"
                  style={{ background: bgColor, color: textColor }}
                  onClick={() => handleCardClick(brand._id)}
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-center mb-4">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow"
                        style={{ margin: "0 auto" }}
                      >
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="w-16 h-16 object-cover rounded-full"
                          style={{ display: "block" }}
                        />
                      </div>
                    </div>
                    <h2
                      className="text-xl font-bold mb-2 text-center"
                      style={{ color: textColor }}
                    >
                      {brand.name}
                    </h2>
                    <p
                      className="text-sm mb-4 text-center"
                      style={{ color: textColor }}
                    >
                      {brand.description.length > 100
                        ? brand.description.slice(0, 100) + "..."
                        : brand.description}
                    </p>
                    {brand.tags && brand.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center mb-2">
                        {brand.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="bg-white/20 px-2 py-0.5 rounded text-xs"
                            style={{
                              color: textColor,
                              border: `1px solid ${textColor}`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {brand.links && brand.links.length > 0 && (
                    <div className="p-4 border-t border-white/20 flex flex-wrap gap-2 justify-center">
                      {brand.links.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-80 flex items-center gap-1 text-xl"
                          style={{ color: textColor }}
                          onClick={(e) => e.stopPropagation()}
                          title={link}
                        >
                          {getLinkIcon(link)}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {brands.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full border border-black bg-white text-black font-semibold shadow-sm transition-colors duration-150 hover:bg-gray-200 disabled:opacity-50"
                onClick={() => {
                  if (page > 1) {
                    router.push(`/?page=${page - 1}`);
                  }
                }}
                disabled={page === 1 || loading}
                aria-label="Previous page"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="mx-2 px-4 py-2 rounded-full border border-black bg-black text-white font-bold shadow-sm">
                 {page}
              </span>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full border border-black bg-white text-black font-semibold shadow-sm transition-colors duration-150 hover:bg-gray-200 disabled:opacity-50"
                onClick={() => {
                  router.push(`/?page=${page + 1}`);
                }}
                disabled={loading}
                aria-label="Next page"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          )}
          {displayBrands.length === 0 && !loading && !searchLoading && (
            <div className="text-center text-gray-400 py-8">
              {searchQuery
                ? "No brands found matching your search."
                : "No brands found."}
            </div>
          )}
        </div>
      </div>
      {/* Modal for brand details */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeModal}
          style={{
            WebkitBackdropFilter: "blur(8px)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>
            {modalLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : modalError ? (
              <div className="text-red-600 text-center py-12">{modalError}</div>
            ) : selectedBrand ? (
              <div>
                <div className="flex flex-col items-center mb-6">
                  <img
                    src={selectedBrand.image}
                    alt={selectedBrand.name}
                    className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 shadow mb-2"
                  />
                  <h2 className="text-2xl font-bold mb-1 text-center text-gray-900">
                    {selectedBrand.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center mb-2">
                    {selectedBrand.tags &&
                      selectedBrand.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-300 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4 text-center whitespace-pre-line">
                  {selectedBrand.description}
                </p>
                {selectedBrand.links && selectedBrand.links.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {selectedBrand.links.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 flex items-center gap-1 text-2xl text-blue-700"
                        title={link}
                      >
                        {getLinkIcon(link)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
