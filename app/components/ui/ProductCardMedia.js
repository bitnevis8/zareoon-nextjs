"use client";

import ProductImage from "./ProductImage";
import SupplyCountryFlag from "./SupplyCountryFlag";

export default function ProductCardMedia({
  product,
  slug,
  imageUrl,
  alt = "",
  width = 400,
  height = 300,
  className = "object-cover w-full h-full",
  figureClassName = "",
}) {
  const supplyCountry = product?.supplyCountry || "IR";
  const supplyCity = product?.supplyCity || "";

  return (
    <div className={`relative w-full h-full overflow-hidden ${figureClassName}`}>
      <ProductImage
        slug={slug || product?.slug}
        imageUrl={imageUrl ?? product?.imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
      <div className="absolute top-2 right-2 z-10">
        <SupplyCountryFlag countryCode={supplyCountry} city={supplyCity} />
      </div>
    </div>
  );
}
