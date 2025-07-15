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
  primaryColor?: string;
}

interface BrandCardProps {
  brand: Brand;
  onClick?: (brandId: string) => void;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand, onClick }) => {
  const bgColor = brand.primaryColor || "#fff";
  // Use black/white for tag text for best contrast
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
  const textColor = getContrastYIQ(bgColor);

  return (
    <div
      className="rounded-xl shadow-lg flex flex-col justify-between h-full border border-gray-200 cursor-pointer transition-transform hover:scale-105"
      style={{
        background: bgColor,
        color: textColor,
        minHeight: "300px",
        maxHeight: "300px",
        minWidth: "260px",
        maxWidth: "1fr",
      }}
      onClick={() => onClick && onClick(brand._id)}
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
          className="text-sm mb-4 text-center flex-1"
          style={{ color: textColor }}
        >
          {brand.description.length > 100
            ? brand.description.slice(0, 100) + "..."
            : brand.description}
        </p>
        {brand.tags && brand.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-2 max-w-full overflow-hidden">
            {brand.tags.slice(0, 3).map((tagObj) => (
              <span
                key={tagObj._id}
                className="bg-white/20 px-2 py-0.5 rounded-full text-xs break-all truncate max-w-[100px]"
                style={{
                  color: textColor,
                  border: `1px solid ${textColor}`,
                }}
              >
                {tagObj.tags}
              </span>
            ))}
            {brand.tags.length > 3 && (
              <span
                className="bg-white/20 px-2 py-0.5 rounded-full text-xs"
                style={{
                  color: textColor,
                  border: `1px solid ${textColor}`,
                }}
              >
                +{brand.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandCard;
