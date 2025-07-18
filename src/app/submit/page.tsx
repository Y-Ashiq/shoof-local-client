export const dynamic = "force-dynamic";
("use client");
import React, { useState, useEffect } from "react";

const SubmitPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [links, setLinks] = useState<string[]>([""]);
  // Replace tags state with selectedTagIds and availableTags
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<
    { _id: string; name: string }[]
  >([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);

  // Helper for step titles
  const stepTitles = [
    "Personal Information",
    "Brand Details",
    "Links",
    "Review & Submit",
  ];

  // Helper for progress
  const totalSteps = stepTitles.length;

  // Step navigation
  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Review summary
  const renderSummary = () => (
    <div className="space-y-4">
      <div>
        <div className="font-semibold text-gray-700">Name:</div>
        <div className="text-gray-900">{name}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Description:</div>
        <div className="text-gray-900">{description}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Image:</div>
        {image ? (
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="w-32 h-32 object-cover rounded border border-gray-200 shadow mt-2"
          />
        ) : (
          <span className="text-gray-500">No image uploaded</span>
        )}
      </div>
      <div>
        <div className="font-semibold text-gray-700">Links:</div>
        <ul className="list-disc ml-6 text-gray-900">
          {links.filter(Boolean).length > 0 ? (
            links.map((l, i) => <li key={i}>{l}</li>)
          ) : (
            <li className="text-gray-500">No links provided</li>
          )}
        </ul>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Tags:</div>
        <ul className="flex flex-wrap gap-2 text-gray-900">
          {selectedTagIds.length > 0 ? (
            selectedTagIds.map((tagId) => {
              const tag = availableTags.find((t) => t._id === tagId);
              if (!tag) return null;
              return (
                <li
                  key={tagId}
                  className="bg-gray-200 px-2 py-0.5 rounded-full text-xs"
                >
                  {tag.name}
                </li>
              );
            })
          ) : (
            <li className="text-gray-500">No tags provided</li>
          )}
        </ul>
      </div>
    </div>
  );

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const addLink = () => setLinks([...links, ""]);
  const removeLink = (index: number) => {
    if (links.length === 1) return;
    setLinks(links.filter((_, i) => i !== index));
  };

  // Dropdown handlers for tags
  const toggleDropdown = () => setDropdownOpen((open) => !open);
  const handleSelectTag = (id: string) => {
    if (!selectedTagIds.includes(id)) {
      setSelectedTagIds([...selectedTagIds, id]);
    }
    setDropdownOpen(false);
  };
  const handleRemoveTag = (id: string) => {
    setSelectedTagIds(selectedTagIds.filter((tagId) => tagId !== id));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      if (image) formData.append("file", image);
      links.forEach((link, i) => formData.append(`links[${i}]`, link));
      selectedTagIds.forEach((tagId, i) =>
        formData.append(`tags[${i}]`, tagId)
      );

      const res = await fetch("https://shoof-local.onrender.com/submit-brand", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSuccess(true);
      setName("");
      setDescription("");
      setImage(null);
      setLinks([""]);
      setSelectedTagIds([]);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Add reset all handler
  const resetAll = () => {
    setName("");
    setDescription("");
    setImage(null);
    setLinks([""]);
    setSelectedTagIds([]);
    setStep(1);
    setSuccess(false);
    setError("");
  };

  // Add Enter key navigation for steps
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Don't trigger on textarea, dropdown, or if dropdown is open
    const target = e.target as HTMLElement;
    if (
      target.tagName === "TEXTAREA" ||
      (dropdownOpen && step === 3) // prevent Enter in tag dropdown
    ) {
      return;
    }
    if (e.key === "Enter") {
      if (step < totalSteps) {
        // Validate current step before advancing
        if (
          (step === 1 && !name) ||
          (step === 2 && !description) ||
          (step === 3 && links.some((l) => !l))
        ) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        nextStep();
      }
      // On last step, let form submit
    }
  };

  // Fetch available tags on mount
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
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchTags();
  }, []);

  if (cancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-300 to-blue-400">
        <div className="bg-white rounded-xl shadow-xl p-4 sm:p-8 md:p-10 max-w-lg w-full text-center">
          <h2 className="text-2xl font-semibold mb-4">Upload Cancelled</h2>
          <button
            className="mt-4 text-blue-600 hover:underline"
            onClick={() => setCancelled(false)}
          >
            Go back to form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 sm:px-4 md:px-0">
      <div className="w-full max-w-3xl mx-auto">
        {/* Stepper and Reset */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-8 md:mt-12 mb-6 md:mb-8 gap-4 md:gap-0">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-0.5">
              {stepTitles.map((title, idx) => (
                <div key={title} className="flex items-center w-full">
                  <div
                    className={`h-1 w-full ${
                      step > idx + 1
                        ? "bg-purple-600"
                        : step === idx + 1
                        ? "bg-purple-600"
                        : "bg-gray-200"
                    } transition-all`}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {stepTitles.map((title, idx) => (
                <div
                  key={title}
                  className={`text-xs md:text-sm font-semibold ${
                    step === idx + 1 ? "text-purple-700" : "text-gray-400"
                  }`}
                >
                  {title}
                </div>
              ))}
            </div>
          </div>
          <button
            className="w-full md:w-auto ml-0 md:ml-8 px-4 py-1 border border-red-300 text-red-500 rounded hover:bg-red-50 font-medium text-sm"
            onClick={resetAll}
            type="button"
          >
            Reset All
          </button>
        </div>
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl px-2 sm:px-4 md:px-8 py-6 sm:py-8 md:py-10 mb-6 md:mb-8 shadow-sm">
          <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="mb-6 max-w-lg w-full">
                <label className="block font-semibold mb-1 text-gray-900">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            {/* Step 2: Brand Details */}
            {step === 2 && (
              <div className="mb-6 max-w-2xl w-full flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex-1 min-w-[180px] md:min-w-[220px] relative">
                  <label className="block font-semibold mb-1 text-gray-900">
                    Image Upload
                  </label>
                  <div
                    className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer min-h-[120px] md:min-h-[140px] ${
                      image ? "border-purple-400 bg-purple-50" : ""
                    }`}
                    onClick={() => {
                      if (!image) fileInputRef.current?.click();
                    }}
                    onKeyDown={(e) => {
                      if (!image && (e.key === "Enter" || e.key === " "))
                        fileInputRef.current?.click();
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Upload image"
                  >
                    {image ? (
                      <div className="flex flex-col items-center w-full">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded mb-2 border border-gray-200"
                        />
                        <span className="text-gray-700 text-xs mb-2">
                          {image.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage();
                          }}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="w-8 h-8 text-gray-300 mb-2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 16a4 4 0 01.88-7.903A5.002 5.002 0 0117 9h1a3 3 0 110 6h-1"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 12v6m0 0l-3-3m3 3l3-3"
                          />
                        </svg>
                        <span className="text-gray-400 text-sm">
                          Drop files to upload <span className="mx-1">or</span>
                        </span>
                        <span
                          className="text-purple-600 underline cursor-pointer text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          browse
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                    style={{ display: image ? "none" : "block" }}
                    tabIndex={-1}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-4 justify-center min-w-[180px] md:min-w-[220px]">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-900">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded px-3 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[60px] md:min-h-[80px]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Step 3: Links */}
            {step === 3 && (
              <div className="mb-6 max-w-2xl w-full">
                <label className="block font-semibold mb-1 text-gray-900">
                  Social Media & Website Links{" "}
                  <span className="text-red-500">*</span>
                </label>
                {links.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center mb-2 gap-2 sm:gap-0"
                  >
                    <input
                      type="url"
                      className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="https://..."
                      value={link}
                      onChange={(e) => handleLinkChange(idx, e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(idx)}
                      className="sm:ml-2 px-2 py-1 text-red-500 hover:text-red-700 text-lg rounded"
                      disabled={links.length === 1}
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
                >
                  + Add Link
                </button>
                {/* Tags input - dashboard style */}
                <div className="mt-6">
                  <label className="block font-semibold mb-1 text-gray-900">
                    Tags (select all that apply)
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 flex justify-between items-center shadow-sm"
                      onClick={toggleDropdown}
                      disabled={loading}
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
            )}
            {/* Step 4: Review & Submit */}
            {step === 4 && (
              <div className="mb-6 max-w-2xl w-full">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                  Review Your Submission
                </h2>
                {renderSummary()}
              </div>
            )}
            {/* Helper text and confidentiality notice */}
            <div className="mt-4 mb-8">
              <div className="text-xs text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </div>
              <div className="flex items-start mt-2 text-xs text-gray-400">
                <svg
                  className="w-4 h-4 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01"
                  />
                </svg>
                <span>
                  <span className="font-medium text-gray-500">
                    Confidentiality Notice:
                  </span>{" "}
                  Your submission details are used solely for processing and
                  verification purposes.
                </span>
              </div>
            </div>
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  className="border border-gray-300 text-gray-700 py-2 px-6 rounded font-semibold hover:bg-gray-100 transition-colors w-full sm:w-auto"
                  onClick={prevStep}
                >
                  Previous
                </button>
              )}
              {step < totalSteps && (
                <button
                  type="button"
                  className="bg-purple-700 text-white py-2 px-6 rounded font-semibold hover:bg-purple-800 transition-colors w-full sm:w-auto"
                  onClick={nextStep}
                  disabled={
                    (step === 1 && !name) ||
                    (step === 2 && !description) ||
                    (step === 3 && links.some((l) => !l))
                  }
                >
                  Next
                </button>
              )}
              {step === totalSteps && (
                <button
                  type="submit"
                  className="bg-purple-700 text-white py-2 px-6 rounded font-semibold hover:bg-purple-800 disabled:opacity-50 transition-colors w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
            {success && (
              <div className="text-green-600 mt-4 text-center">
                Submitted successfully!
              </div>
            )}
            {error && (
              <div className="text-red-600 mt-4 text-center">{error}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitPage;
