"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar({
  initialSearch,
  searchQuery,
  setSearchQuery,
}: {
  initialSearch?: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const router = useRouter();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleSearchInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const handleSearchIconClick = () => {
    setSearchBarOpen((prev) => !prev);
    setSearchQuery("");
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white mb-8">
      <div className="flex items-center justify-between px-2 sm:px-4 md:px-6 py-2 sm:py-4 relative min-h-[56px]">
        {/* Centered logo/text absolutely */}
        <span
          className="absolute left-1/2 -translate-x-1/2 text-base sm:text-lg md:text-xl font-bold tracking-wider text-gray-900"
          style={{ fontFamily: "var(--font-abril)" }}
        >
          <Link
            href="/"
            className="focus:outline-none no-underline"
            onClick={() => {
              setSearchBarOpen(false);
              setSearchQuery("");
            }}
          >
            shoof local
          </Link>
        </span>
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 ml-auto">
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
          <Link
            href="/submit"
            className="ml-1 sm:ml-2 px-3 sm:px-4 py-2 bg-purple-700 text-white rounded-full font-semibold flex items-center gap-1 sm:gap-2 shadow hover:bg-purple-800 transition-colors text-xs sm:text-sm"
            style={{ whiteSpace: "nowrap" }}
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="hidden xs:inline">Submit Brand</span>
          </Link>
        </div>
      </div>
      <div
        className={`w-full bg-white border-t border-gray-200 flex justify-center overflow-hidden transition-all duration-500 ease-in-out`}
        style={{
          maxHeight: searchBarOpen ? "80px" : "0px",
          marginTop: "2px",
          marginBottom: "2px",
        }}
      >
        <div
          className={`w-full max-w-xl flex items-center relative transition-all duration-500 ease-in-out ${
            searchBarOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <span className="absolute left-4 text-gray-400 flex items-center h-full pointer-events-none">
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search brands..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchInputKeyDown}
            className="w-full pl-10 pr-10 py-3 sm:pl-12 sm:pr-12 sm:py-4 rounded-full bg-white text-gray-900 text-base sm:text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 border border-gray-200 placeholder-gray-400"
            style={{ minHeight: "44px", maxWidth: "100%" }}
            autoFocus={searchBarOpen}
          />
          <button
            onClick={() => {
              setSearchBarOpen(false);
              setSearchQuery("");
            }}
            className="absolute right-4 text-gray-400 hover:text-gray-700 text-2xl"
            aria-label="Close search"
            style={{ top: "50%", transform: "translateY(-50%)" }}
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
