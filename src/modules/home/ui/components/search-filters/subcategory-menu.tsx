import Link from "next/link";
// import { CustomCategory } from "../types";
import { CategoriesGetManyOutput } from "@/modules/categories/types";

interface Props {
  // category: CustomCategory;
  category: CategoriesGetManyOutput[1];
  isOpen: boolean;
  // position: {
  //   top: number;
  //   left: number;
  // };
}

export const SubcategoryMenu = ({ category, isOpen }: Props) => {
  if (
    !isOpen ||
    !category.subcategories ||
    category.subcategories.length === 0
  ) {
    return null;
  }

  const backgroundColor = category.color || "#F5F5F5";

  return (
    <div
      // fix: Problem – dropdown position is messed up on scroll - remove the position prop and change to absolute
      // className="fixed z-100"
      className="absolute z-100"
      // style={{
      //   top: position.top,
      //   left: position.left,
      // }}
      style={{
        top: "100%",
        left: 0,
      }}
    >
      {/* Invisible bridge to maintain hover */}
      <div className="h-3 w-60"></div>
      <div
        style={{ backgroundColor }}
        className="w-60 text-black rounded-md overflow-hdden border shadow-[4px_4px_8px_rgba(0,0,0.1)] -translate-x-[2px] -translate-y-[2px]"
      >
        {/* <p>
                Subcategory menu
            </p> */}
        <div>
          {category.subcategories?.map((subcategory) => (
            <Link
              key={subcategory.slug}
              href={`/${category.slug}/${subcategory.slug}`}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center underline font-medium"
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
