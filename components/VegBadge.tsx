/**
 * Indian food-labelling convention: green square = vegetarian,
 * red square = non-vegetarian. Recolored for dark stall surfaces —
 * bright green keeps the convention legible on charcoal.
 */
export function VegBadge({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      role="img"
      aria-label={label(isVeg)}
      title={label(isVeg)}
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border ${
        isVeg ? "border-[#4ADE80]" : "border-chili"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-round ${
          isVeg ? "bg-[#4ADE80]" : "bg-chili"
        }`}
      />
    </span>
  );
}

function label(isVeg: boolean) {
  return isVeg ? "Vegetarian" : "Non-vegetarian";
}
