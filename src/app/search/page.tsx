"use client";
import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import BrandCard from "../components/BrandCard";
import BrandModal from "../components/BrandModal";
import TagFilter from "../components/TagFilter";
import Pagination from "../components/Pagination";
export const dynamic = "force-dynamic";

interface Brand {
  _id: string;
  name: string;
  description: string;
  image: string;
  tags?: string[];
  links?: string[];
  primaryColor?: string;
}

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

const SearchPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.get("search") || "";
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchBarOpen, setSearchBarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<
    { _id: string; name: string }[]
  >([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const handleCardClick = async (brandId: string) => {
    setModalOpen(true);
    setModalLoading(true);
    setModalError("");
    try {
      const res = await fetch(
        `https://shoof-local.onrender.com/brands/${brandId}`
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

  // Filter brands by selected tags
  const filteredBrands = brands.filter(
    (brand) =>
      selectedTagIds.length === 0 ||
      (Array.isArray(brand.tags) &&
        selectedTagIds.every((id) =>
          (brand.tags ?? []).some((tagObj) => {
            if (typeof tagObj === "string") return tagObj === id;
            if (
              typeof tagObj === "object" &&
              tagObj !== null &&
              "_id" in tagObj &&
              typeof (tagObj as any)._id === "string"
            ) {
              return (tagObj as any)._id === id;
            }
            return false;
          })
        ))
  );

  // Fetch tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("https://shoof-local.onrender.com/tags");
        if (!res.ok) throw new Error("Failed to fetch tags");
        const data = await res.json();
        setAvailableTags(
          Array.isArray(data)
            ? data.map((item: any) => ({ _id: item._id, name: item.tags }))
            : []
        );
      } catch (err) {}
    };
    fetchTags();
  }, []);

  useEffect(() => {
    // Build the query string from all searchParams
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    if (!search.trim()) {
      setBrands([]);
      setTotalPages(1);
      return;
    }
    setLoading(true);
    setError("");
    fetch(
      `https://shoof-local.onrender.com/brands/search/?${params.toString()}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch search results");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setBrands(data);
          setTotalPages(1);
        } else {
          setBrands(data.brands || []);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch((err) => setError(err.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, [search, searchParams, page]);

  return (
    <>
      <Navbar
        initialSearch={search}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
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
            Search Results for "{search}"
          </h1>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          <div className="relative min-h-[300px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-black" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredBrands.map((brand) => (
                  <BrandCard
                    key={brand._id}
                    brand={{
                      ...brand,
                      tags: Array.isArray(brand.tags)
                        ? brand.tags.map((tag) =>
                            typeof tag === "string"
                              ? {
                                  _id: tag,
                                  tags:
                                    availableTags.find((t) => t._id === tag)
                                      ?.name || tag,
                                }
                              : tag
                          )
                        : [],
                    }}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            )}
          </div>
          {filteredBrands.length === 0 && !loading && (
            <div className="text-center text-gray-400 py-8">
              No brands found matching your search.
            </div>
          )}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </div>
      </div>
      {/* Modal for brand details */}
      <BrandModal
        open={modalOpen}
        onClose={closeModal}
        brand={
          selectedBrand
            ? {
                ...selectedBrand,
                tags: Array.isArray(selectedBrand.tags)
                  ? selectedBrand.tags.map((tag) =>
                      typeof tag === "string"
                        ? {
                            _id: tag,
                            tags:
                              availableTags.find((t) => t._id === tag)?.name ||
                              tag,
                          }
                        : tag
                    )
                  : [],
              }
            : null
        }
        loading={modalLoading}
        error={modalError}
      />
    </>
  );
};

const SearchPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <SearchPageContent />
  </Suspense>
);

export default SearchPage;
