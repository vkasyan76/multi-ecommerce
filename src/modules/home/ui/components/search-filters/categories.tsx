"use client";

import { useEffect, useRef, useState } from "react";
// import { CustomCategory } from "../types";
import { CategoriesGetManyOutput } from "@/modules/categories/types";
import { CategoryDropdown } from "./category-dropdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ListFilterIcon } from "lucide-react";
import { CategoriesSidebar } from "./categories-sidebar";
import { useParams } from "next/navigation";

// interface Props {
//   data: CustomCategory[]; //
// }

// After TRCP introduction CategoryDropdown and SubcategoryMenu still expect a very specific shape. We define it in src\modules\categories\types.ts: CategoriesGetManyOutput

interface Props {
  data: CategoriesGetManyOutput; //
}

export const Categories = ({ data }: Props) => {
  // client way of accessing params:
  const params = useParams();

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const viewAllRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(data.length);
  const [isAnyHovered, setIsAnyHovered] = useState(false);
  // used to display all categories which were hidden:
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categoryParam = params.category as string | undefined;

  // const activeCategory = "all";
  const activeCategory = categoryParam || "all";

  // visual hint for the view all button:
  const activeCategoryIndex = data.findIndex(
    (category) => category.slug === activeCategory
  );
  const isActiveCategoryHidden =
    activeCategoryIndex >= visibleCount && activeCategoryIndex !== -1;

  // 1.	Check if the container and data exist.
  // 2.	Record the top position of the first button.
  // 3.	Loop through all buttons:
  // o	For each button, get its top position.
  // o	If it's the same as the first button's top, it means it's in the same row.
  // o	Add that button to visibleCategories.

  // The reason the useEffect function knows that containerRef refers to the container <div> that wraps the category buttons is because of the way React refs work in combination with JSX.

  useEffect(() => {
    const calcuateVisible = () => {
      if (!containerRef.current || !measureRef.current || !viewAllRef.current)
        return;

      const containerWidth = containerRef.current.offsetWidth;
      // ref for the "View all" button
      const viewAllWidth = viewAllRef.current.offsetWidth;
      const availableWidth = containerWidth - viewAllWidth;

      const items = Array.from(containerRef.current.children);

      let totalWidth = 0;
      let visible = 0;

      for (const item of items) {
        // information about the size and position of an element in the viewport.
        const width = item.getBoundingClientRect().width;
        // totalWidth is the running total of how much horizontal space the currently visible buttons take up.
        // width is the width of the next button.
        // availableWidth is the space available for category buttons (total container width minus "View All").
        // If the width of the next button does not fit in the remaining space, the loop stops.
        if (totalWidth + width > availableWidth) {
          break;
        }
        // otherwise increase width by width of that item & increase visibe count
        totalWidth += width;
        visible++;
      }

      setVisibleCount(visible);
    };
    // when the window is resized, o recalculate the visible items
    const resizeObserver = new ResizeObserver(calcuateVisible);
    resizeObserver.observe(containerRef.current!);

    return () => resizeObserver.disconnect();
  }, [data.length]);

  return (
    <div className="relative w-full">
      {/* Categories: {JSON.stringify(data, null, 2)}  */}

      {/* Categories sidebar */}
      <CategoriesSidebar
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen} // passed as OnClick in the ViewAll button
        // data={data}
      />

      {/* Hidden div to measure all items */}

      <div
        ref={measureRef}
        className="absolute opacity-0 pointer-events-none flex"
        style={{ position: "fixed", top: -9999, left: -9999 }}
      >
        {data.map((category) => (
          <div key={category.id}>
            <CategoryDropdown
              category={category}
              isActive={activeCategory === category.slug}
              isNavigationHovered={false}
            />
          </div>
        ))}
      </div>

      {/* Visible items */}

      <div
        className="flex flex-nowrap items-center"
        ref={containerRef}
        onMouseEnter={() => setIsAnyHovered(true)}
        onMouseLeave={() => setIsAnyHovered(false)}
      >
        {/* TODO: Hardcode "All" button */}

        {data.slice(0, visibleCount).map((category) => (
          <div key={category.id}>
            <CategoryDropdown
              category={category}
              isActive={activeCategory === category.slug}
              isNavigationHovered={isAnyHovered}
            />
          </div>
        ))}

        <div ref={viewAllRef} className="shrink-0">
          <Button
            variant="elevated"
            className={cn(
              "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black",
              isActiveCategoryHidden &&
                !isAnyHovered &&
                "bg-white border-primary"
            )}
            onClick={() => setIsSidebarOpen(true)}
          >
            View all
            <ListFilterIcon className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
