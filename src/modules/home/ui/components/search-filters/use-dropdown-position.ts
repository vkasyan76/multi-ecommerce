
import { RefObject } from 'react'

export const useDropDownPosition = (ref: RefObject<HTMLDivElement | null> |  RefObject<HTMLDivElement>) => {

    const getDropDownPosition  = () => {
        if (!ref.current) return { top: 0, left: 0 }

        const rect = ref.current.getBoundingClientRect()
        const dropdownWidth = 240; // Width of dropdown (w-60 = 15rem = 240px)

        // Calculate the initial position
        let left = rect.left + window.scrollX
        const top = rect.bottom + window.scrollY
        

        // Check if dropdown goes off the right side of the viewport
        if( left + dropdownWidth > window.innerWidth) {
            // Allign to right edge of button instead
        left = rect.right  + window.scrollX - dropdownWidth
        }

        // if still off-screen, align to the right edge of viewport with some padding
        if(left <0) {
            left = window.innerWidth - dropdownWidth - 16 // 16px padding
        }

        // Ensure dropdown doesn't go off the left side of the viewport
        if (left < 0) {
            left = 16
        }

        return { top, left }

    }

  return {
    getDropDownPosition}
}

