"use client";
import React, { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "./components/Navbar";
import BrandCard from "./components/BrandCard";
import BrandModal from "./components/BrandModal";
import TagFilter from "./components/TagFilter";
import Pagination from "./components/Pagination";
export const dynamic = "force-dynamic";

interface TagObj {
  _id: string;
  tags: string;
}

interface Brand {
  _id: string;
  name: string;
  description: string;
  image: string;
  tags?: TagObj[]; // Now array of objects
  links?: string[];
  primaryColor?: string;
}

const HomePageContent = () => {
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
  const [availableTags, setAvailableTags] = useState<
    { _id: string; name: string }[]
  >([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const brandGridRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const queryParam = searchParams.get("query") || "";
  const page = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(8); // Brands per page

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://shoof-local.onrender.com/brands?page=${page}`
        );
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
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    // Fetch tags for mapping IDs to names
    const fetchTags = async () => {
      try {
        const res = await fetch("https://shoof-local.onrender.com/tags");
        if (!res.ok) throw new Error("Failed to fetch tags");
        const data = await res.json();
        setAvailableTags(
          Array.isArray(data)
            ? data.map((item) => ({ _id: item._id, name: item.tags }))
            : []
        );
      } catch (err) {}
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    fetch(
      `https://shoof-local.onrender.com/brands/search?search=${encodeURIComponent(
        searchQuery
      )}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch search results");
        return res.json();
      })
      .then((data) => setSearchResults(data))
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false));
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery) {
    }
  }, [searchResults, searchQuery]);

  // Sync searchQuery with query param
  useEffect(() => {
    if (queryParam !== searchQuery) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  // Sync selectedTagIds with tags param in URL
  useEffect(() => {
    const tagsFromUrl = searchParams.getAll("tags");
    if (tagsFromUrl.sort().join() !== selectedTagIds.sort().join()) {
      setSelectedTagIds(tagsFromUrl);
    }
  }, [searchParams]);

  // Update URL when selectedTagIds change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tags");
    selectedTagIds.forEach((id) => params.append("tags", id));
    router.replace(`/?${params.toString()}`);
    // eslint-disable-next-line
  }, [selectedTagIds]);

  // Fetch brands with tags filter
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        let url = `https://shoof-local.onrender.com/brands?page=${page}`;
        if (selectedTagIds.length > 0) {
          selectedTagIds.forEach((id) => {
            url += `&tags=${encodeURIComponent(id)}`;
          });
        }
        const res = await fetch(url, {
          headers: {
            "x-api-key": "MySecertAPIKey",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch brands");
        const data = await res.json();
        let newBrands;
        let newTotalPages;
        if (Array.isArray(data)) {
          newBrands = data;
          newTotalPages = 1;
        } else {
          newBrands = data.brands || [];
          newTotalPages = data.totalPages || 1;
        }
        if (newBrands.length === 0 && page > 1) {
          router.push(`/?page=${page - 1}`);
          return;
        }
        setBrands(newBrands);
        setTotalPages(newTotalPages);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
    // eslint-disable-next-line
  }, [page, selectedTagIds]);

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
        `https://shoof-local.onrender.com/brands/search?search=${encodeURIComponent(
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

  const handleSearchInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
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
      const res = await fetch(
        `https://shoof-local.onrender.com/brands/${brandId}`,
        {}
      );
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

  // Pill-style tag filter UI
  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node)
      ) {
        setTagDropdownOpen(false);
      }
    }
    if (tagDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tagDropdownOpen]);

  // Compute displayed brands: live search + tag filter
  const displayedBrands = Array.isArray(searchQuery ? searchResults : brands)
    ? (searchQuery ? searchResults : brands).filter(
        (brand) =>
          selectedTagIds.length === 0 ||
          (Array.isArray(brand.tags)
            ? selectedTagIds.every((id) =>
                (brand.tags as TagObj[]).some((tagObj) => tagObj._id === id)
              )
            : false)
      )
    : [];

  return (
    <>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {/* Tag filter custom dropdown */}
      <div className="max-w-7xl mx-auto mb-6">
        <TagFilter
          availableTags={availableTags}
          selectedTagIds={selectedTagIds}
          setSelectedTagIds={setSelectedTagIds}
        />
      </div>
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
          <div className="relative min-h-[300px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-10">
                <span className="loader"></span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {displayedBrands.length === 0 && !searchLoading ? (
                  <div className="col-span-full text-center text-gray-400 py-8">
                    {searchQuery
                      ? "No brands found matching your search."
                      : "No brands found."}
                  </div>
                ) : (
                  displayedBrands.map((brand) => (
                    <BrandCard
                      key={brand._id}
                      brand={brand}
                      onClick={handleCardClick}
                    />
                  ))
                )}
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => router.push(`/?page=${newPage}`)}
            />
          )}
        </div>
      </div>
      <BrandModal
        open={modalOpen}
        onClose={closeModal}
        brand={selectedBrand}
        loading={modalLoading}
        error={modalError}
      />
    </>
  );
};

const HomePage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <HomePageContent />
  </Suspense>
);

export default HomePage;
