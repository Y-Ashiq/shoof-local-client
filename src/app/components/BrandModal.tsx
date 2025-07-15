import React from "react";

interface TagObj {
  _id: string;
  tags: string;
}

interface Brand {
  _id: string;
  name: string;
  description: string;
  image: string;
  tags?: TagObj[];
  links?: string[];
}

interface BrandModalProps {
  open: boolean;
  onClose: () => void;
  brand: Brand | null;
  loading?: boolean;
  error?: string;
}

const BrandModal: React.FC<BrandModalProps> = ({
  open,
  onClose,
  brand,
  loading,
  error,
}) => {
  if (!open) return null;

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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
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
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-red-600 text-center py-12">{error}</div>
        ) : brand ? (
          <div>
            <div className="flex flex-col items-center mb-6">
              <img
                src={brand.image}
                alt={brand.name}
                className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 shadow mb-2"
              />
              <h2 className="text-2xl font-bold mb-1 text-center text-gray-900">
                {brand.name}
              </h2>
              {brand.tags && brand.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-2 max-w-full overflow-hidden">
                  {brand.tags.map((tagObj, idx) => (
                    <span
                      key={tagObj._id || idx}
                      className="bg-gray-100 px-2 py-0.5 rounded-full text-xs border border-gray-300 text-gray-700 break-all truncate max-w-[100px]"
                    >
                      {tagObj.tags}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-gray-700 mb-4 text-center whitespace-pre-line">
              {brand.description}
            </p>
            {brand.links && brand.links.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {brand.links.map((link, i) => (
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
  );
};

export default BrandModal;
