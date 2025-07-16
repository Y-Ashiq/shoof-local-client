import React, { useEffect, useRef, useState } from "react";

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
  const [show, setShow] = useState(open);
  const [animate, setAnimate] = useState("in");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setShow(true);
      setAnimate("in");
    } else if (show) {
      setAnimate("out");
      timeoutRef.current = setTimeout(() => setShow(false), 300); // match animation duration
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open]);

  if (!show) return null;

  function getLinkIcon(link: string) {
    if (/facebook\.com/i.test(link)) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          className="inline"
          width="22"
          height="22"
          fill="currentColor"
        >
          {/*!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.*/}
          <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256h0z" />
        </svg>
      );
    }
    if (/instagram\.com/i.test(link)) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="inline"
          width="22"
          height="22"
          fill="currentColor"
        >
          {/*!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.*/}
          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
        </svg>
      );
    }
    if (/tiktok\.com/i.test(link)) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="inline"
          width="22"
          height="22"
          fill="currentColor"
        >
          {/*!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.*/}
          <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" />
        </svg>
      );
    }
    if (/twitter\.com/i.test(link)) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          className="inline"
          width="22"
          height="22"
          fill="currentColor"
        >
          {/*!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.*/}
          <path d="M459.4 151.7c.3 4.5 .3 9.1 .3 13.6 0 138.7-105.6 298.6-298.6 298.6-59.5 0-114.7-17.2-161.1-47.1 8.4 1 16.6 1.3 25.3 1.3 49.1 0 94.2-16.6 130.3-44.8-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13 1.6 19.8 1.6 9.4 0 18.8-1.3 27.6-3.6-48.1-9.7-84.1-52-84.1-103v-1.3c14 7.8 30.2 12.7 47.4 13.3-28.3-18.8-46.8-51-46.8-87.4 0-19.5 5.2-37.4 14.3-53 51.7 63.7 129.3 105.3 216.4 109.8-1.6-7.8-2.6-15.9-2.6-24 0-57.8 46.8-104.9 104.9-104.9 30.2 0 57.5 12.7 76.7 33.1 23.7-4.5 46.5-13.3 66.6-25.3-7.8 24.4-24.4 44.8-46.1 57.8 21.1-2.3 41.6-8.1 60.4-16.2-14.3 20.8-32.2 39.3-52.6 54.3z" />
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
        className={`bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative transition-all duration-300 transform-gpu scale-95 opacity-0 ${
          animate === "in" ? "animate-modalIn" : "animate-modalOut"
        }`}
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
