"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Brand {
  _id: string;
  name: string;
  description: string;
  image: string;
  tags: string[];
  status: string;
  links: string[];
  createdAt: string;
  updatedAt: string;
}

const BrandReviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const brandId = params?.brandId as string;
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [patchLoading, setPatchLoading] = useState(false);
  const [patchError, setPatchError] = useState("");
  const [patchSuccess, setPatchSuccess] = useState("");
  const [editLinks, setEditLinks] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [availableTags, setAvailableTags] = useState<
    { _id: string; name: string }[]
  >([]);
  // Change selectedTagIds to selectedTagId (string)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    // Auth check
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!brandId) return;
    const fetchBrand = async () => {
      try {
        const res = await fetch(`https://shoof-local.onrender.com/brands/${brandId}`, {
          headers: { token: token || "" },
        });
        if (res.status === 401) {
          setUnauthorized(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch brand");
        const data = await res.json();
        setBrand(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [brandId, router]);

  useEffect(() => {
    if (brand) {
      setEditName(brand.name);
      setEditDescription(brand.description);
      setEditLinks(brand.links && brand.links.length > 0 ? brand.links : [""]);
      setSelectedTagIds(
        brand.tags
          ? brand.tags.map((t: any) => (typeof t === "string" ? t : t._id))
          : []
      );
    }
  }, [brand]);

  useEffect(() => {
    // Fetch available tags
    const fetchTags = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("https://shoof-local.onrender.com/tags", {
          headers: { token: token || "" },
        });
        if (res.status === 401) {
          setUnauthorized(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch tags");
        const data = await res.json();
        setAvailableTags(
          Array.isArray(data)
            ? data.map((item) => ({ _id: item._id, name: item.tags }))
            : []
        );
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchTags();
  }, []);

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...editLinks];
    newLinks[index] = value;
    setEditLinks(newLinks);
  };

  const addLink = () => setEditLinks([...editLinks, ""]);
  const removeLink = (index: number) => {
    if (editLinks.length === 1) return;
    setEditLinks(editLinks.filter((_, i) => i !== index));
  };

  const handleTagDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedTagIds(options);
  };
  const handleRemoveTag = (id: string) => {
    setSelectedTagIds(selectedTagIds.filter((tagId) => tagId !== id));
  };

  // Dropdown toggle handler
  const toggleDropdown = () => setDropdownOpen((open) => !open);
  const handleSelectTag = (id: string) => {
    if (!selectedTagIds.includes(id)) {
      setSelectedTagIds([...selectedTagIds, id]);
    }
    setDropdownOpen(false);
  };

  const handleUpdate = () =>
    handlePatch({
      name: editName,
      description: editDescription,
      links: editLinks,
      tags: selectedTagIds,
    });

  const handleApprove = () => handlePatch({ status: "approved" });
  const handleReject = () => handlePatch({ status: "rejected" });

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this brand? This action cannot be undone."
      )
    )
      return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://shoof-local.onrender.com/dashboard/brands/${brandId}`,
        {
          method: "DELETE",
          headers: {
            token: token || "",
          },
        }
      );
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to delete brand");
      router.push("/dashboard");
    } catch (err: any) {
      setDeleteError(err.message || "Unknown error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePatch = async (fields: Partial<Brand>) => {
    setPatchLoading(true);
    setPatchError("");
    setPatchSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://shoof-local.onrender.com/dashboard/brands/${brandId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify(fields),
        }
      );
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to update brand");
      const updated = await res.json();
      setBrand(updated);
      setPatchSuccess("Brand updated successfully!");
    } catch (err: any) {
      setPatchError(err.message || "Unknown error");
    } finally {
      setPatchLoading(false);
    }
  };

  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-bold text-gray-800 text-center">
          404 | Page Not Found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl mx-auto mt-12">
        <button
          className="mb-4 text-purple-700 hover:underline"
          onClick={() => router.back()}
        >
          &larr; Back to Dashboard
        </button>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {brand && (
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div className="flex-shrink-0">
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="w-32 h-32 object-cover rounded border border-gray-200"
                />
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-1 text-gray-900">
                  Name
                </label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={patchLoading}
                />
                <label className="block font-semibold mb-1 text-gray-900 mt-4">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[80px]"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  disabled={patchLoading}
                />
                <div className="mb-2 mt-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      brand.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : brand.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {brand.status}
                  </span>
                </div>
                <div className="text-gray-600 text-sm mb-2">
                  Created: {new Date(brand.createdAt).toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm mb-2">
                  Updated: {new Date(brand.updatedAt).toLocaleString()}
                </div>
                <div className="mt-4">
                  <div className="font-semibold text-gray-700 mb-1">Links:</div>
                  {editLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center mb-2">
                      <input
                        type="url"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="https://..."
                        value={link}
                        onChange={(e) => handleLinkChange(idx, e.target.value)}
                        disabled={patchLoading}
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(idx)}
                        className="ml-2 px-2 py-1 text-red-500 hover:text-red-700 text-lg rounded"
                        disabled={editLinks.length === 1 || patchLoading}
                        aria-label="Remove link"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLink}
                    className="mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-medium"
                    disabled={patchLoading}
                  >
                    + Add Link
                  </button>
                </div>
                <div className="mt-4 relative">
                  <label className="block font-semibold mb-1 text-gray-900">
                    Tags
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 flex justify-between items-center shadow-sm"
                      onClick={toggleDropdown}
                      disabled={patchLoading}
                    >
                      <span>
                        {selectedTagIds.length === 0
                          ? "Select tags..."
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
                    {dropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-auto p-2 flex flex-wrap gap-2">
                        {availableTags.filter(
                          (tag) => !selectedTagIds.includes(tag._id)
                        ).length === 0 ? (
                          <div className="px-4 py-2 text-gray-400 text-sm w-full">
                            No more tags
                          </div>
                        ) : (
                          availableTags
                            .filter((tag) => !selectedTagIds.includes(tag._id))
                            .map((tag) => (
                              <button
                                key={tag._id}
                                type="button"
                                className="px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-semibold hover:bg-purple-200 transition-colors border border-purple-200 shadow-sm flex items-center"
                                onClick={() => handleSelectTag(tag._id)}
                              >
                                {tag.name}
                              </button>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                  {/* Show selected tags as pills */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTagIds.map((id) => {
                      const tag = availableTags.find((t) => t._id === id);
                      if (!tag) return null;
                      return (
                        <span
                          key={id}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-purple-200 shadow-sm"
                        >
                          {tag.name}
                          <button
                            type="button"
                            className="ml-1 text-purple-500 hover:text-purple-800 focus:outline-none"
                            onClick={() => handleRemoveTag(id)}
                            aria-label="Remove tag"
                          >
                            &times;
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              {brand.status !== "approved" && (
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  onClick={handleApprove}
                  disabled={patchLoading}
                >
                  {patchLoading ? "Approving..." : "Approve"}
                </button>
              )}
              {brand.status !== "rejected" && (
                <button
                  className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  onClick={handleReject}
                  disabled={patchLoading}
                >
                  {patchLoading ? "Rejecting..." : "Reject"}
                </button>
              )}
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleUpdate}
                disabled={
                  patchLoading ||
                  (editName === brand.name &&
                    editDescription === brand.description &&
                    JSON.stringify(editLinks) === JSON.stringify(brand.links) &&
                    JSON.stringify(selectedTagIds) ===
                      JSON.stringify(brand.tags))
                }
              >
                {patchLoading ? "Updating..." : "Update"}
              </button>
              <button
                className="bg-gray-800 text-white px-6 py-2 rounded font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
            {patchSuccess && (
              <div className="text-green-600 mt-4 text-center">
                {patchSuccess}
              </div>
            )}
            {patchError && (
              <div className="text-red-600 mt-4 text-center">{patchError}</div>
            )}
            {deleteError && (
              <div className="text-red-600 mt-4 text-center">{deleteError}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandReviewPage;
