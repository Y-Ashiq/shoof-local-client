import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  loading,
}) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full border border-black bg-white text-black font-semibold shadow-sm transition-colors duration-150 hover:bg-gray-200 disabled:opacity-50"
        onClick={handlePrev}
        disabled={currentPage === 1 || loading}
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
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          className={`mx-1 px-4 py-2 rounded-full border font-bold shadow-sm ${
            currentPage === i + 1
              ? "bg-black text-white border-black"
              : "bg-white text-black border-black hover:bg-gray-200"
          }`}
          onClick={() => onPageChange(i + 1)}
          disabled={loading}
        >
          {i + 1}
        </button>
      ))}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full border border-black bg-white text-black font-semibold shadow-sm transition-colors duration-150 hover:bg-gray-200 disabled:opacity-50"
        onClick={handleNext}
        disabled={currentPage === totalPages || loading}
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
  );
};

export default Pagination;
