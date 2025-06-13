"use client"

import { useState, useEffect } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Αρχικός έλεγχος
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Έλεγχος κατά την αρχικοποίηση
    checkIfMobile()

    // Προσθήκη event listener για αλλαγές στο μέγεθος του παραθύρου
    window.addEventListener("resize", checkIfMobile)

    // Καθαρισμός του event listener κατά την αποδόμηση του component
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  return isMobile
}

// Alias για συμβατότητα με υπάρχοντα components
export const useMobile = useIsMobile
