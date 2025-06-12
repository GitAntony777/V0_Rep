// Προσθήκη νέων προϊόντων από φωτογραφίες
const newProducts = [
  {
    id: Date.now().toString(),
    code: "PROD_004",
    name: "Κεφτεδάκια της Γιαγιάς",
    description: "Παραδοσιακά κεφτεδάκια από φρέσκο κιμά μοσχαρίσιο, έτοιμα για τηγάνισμα ή ψήσιμο",
    price: 8.5,
    categoryId: "3",
    categoryName: "Μοσχάρι",
    unitId: "1",
    unitName: "Κιλά",
    comments: "Φρέσκα καθημερινά, ιδανικά για οικογενειακό φαγητό",
    imageUrl: "/images/keftedakia-giagias.jpg",
    createdAt: new Date().toISOString().split("T")[0],
  },
  {
    id: (Date.now() + 1).toString(),
    code: "PROD_005",
    name: "Κιμάς Μοσχαρίσιος",
    description: "Φρέσκος κιμάς από εκλεκτό μοσχάρι, ιδανικός για κεφτέδες, μουσακά και παστίτσιο",
    price: 9.8,
    categoryId: "3",
    categoryName: "Μοσχάρι",
    unitId: "1",
    unitName: "Κιλά",
    comments: "Αλέθεται καθημερινά, χωρίς συντηρητικά",
    imageUrl: "/images/kimas-mosxarisios.jpg",
    createdAt: new Date().toISOString().split("T")[0],
  },
  {
    id: (Date.now() + 2).toString(),
    code: "PROD_006",
    name: "Γύρος Χοιρινός",
    description: "Κομμάτια χοιρινού κρέατος μαρινάτα και μαγειρεμένα, έτοιμα για σερβίρισμα",
    price: 11.2,
    categoryId: "2",
    categoryName: "Χοιρινό",
    unitId: "1",
    unitName: "Κιλά",
    comments: "Μαγειρεμένο την ίδια μέρα, ιδανικό για γύρο και πίτες",
    imageUrl: "/images/gyros-xoirinos.jpg",
    createdAt: new Date().toISOString().split("T")[0],
  },
  {
    id: (Date.now() + 3).toString(),
    code: "PROD_007",
    name: "Κεμπάπ Σπεσιάλ",
    description: "Παραδοσιακά κεμπάπ από μίγμα κιμά μοσχαρίσιου και αρνίσιου με ανατολίτικα μπαχαρικά",
    price: 13.5,
    categoryId: "5",
    categoryName: "Παρασκευάσματα",
    unitId: "1",
    unitName: "Κιλά",
    comments: "Παρασκευάζεται με παραδοσιακή συνταγή, έτοιμο για ψήσιμο",
    imageUrl: "/images/kebab.jpg",
    createdAt: new Date().toISOString().split("T")[0],
  },
  {
    id: (Date.now() + 4).toString(),
    code: "PROD_008",
    name: "Καρέ Χοιρινό Γεμιστό με Δημητριακά",
    description: "Εκλεκτό καρέ χοιρινό γεμιστό με μίγμα δημητριακών και μυρωδικών, ιδανικό για εορτές",
    price: 16.8,
    categoryId: "2",
    categoryName: "Χοιρινό",
    unitId: "1",
    unitName: "Κιλά",
    comments: "Premium προϊόν, κατάλληλο για ειδικές περιστάσεις",
    imageUrl: "/images/kare-gemisto-xoirino.jpg",
    createdAt: new Date().toISOString().split("T")[0],
  },
]

// Φόρτωση υπαρχόντων προϊόντων
let existingProducts = []
try {
  const savedProducts = localStorage.getItem("products")
  if (savedProducts) {
    existingProducts = JSON.parse(savedProducts)
  }
} catch (error) {
  console.error("Error loading existing products:", error)
}

// Προσθήκη νέων προϊόντων
const updatedProducts = [...existingProducts, ...newProducts]

// Αποθήκευση στο localStorage
try {
  localStorage.setItem("products", JSON.stringify(updatedProducts))
  console.log("✅ Προστέθηκαν επιτυχώς 5 νέα προϊόντα:")
  newProducts.forEach((product) => {
    console.log(`- ${product.name} (${product.code}) - €${product.price}/kg`)
  })
  console.log("\n📊 Σύνολο προϊόντων στο σύστημα:", updatedProducts.length)
} catch (error) {
  console.error("❌ Σφάλμα κατά την αποθήκευση:", error)
}
