// Αυτό το script εμφ ανίζει τα προϊόντα που είναι αποθηκευμένα στο localStorage
// και μπορεί να χρησιμοποιηθεί για debugging

// Διαβάζουμε τα προϊόντα από το localStorage
const savedProducts = localStorage.getItem("products")

if (savedProducts) {
  try {
    const products = JSON.parse(savedProducts)
    console.log("Αριθμός προϊόντων:", products.length)
    console.log("Προϊόντα:", products)

    // Εμφανίζουμε λεπτομέρειες για κάθε προϊόν
    products.forEach((product, index) => {
      console.log(`Προϊόν #${index + 1}:`)
      console.log(`  ID: ${product.id}`)
      console.log(`  Όνομα: ${product.name}`)
      console.log(`  Τιμή: ${product.price}`)
      console.log(`  Μονάδα: ${product.unitName || "Δεν ορίστηκε"}`)
    })
  } catch (error) {
    console.error("Σφάλμα κατά την ανάλυση των προϊόντων:", error)
  }
} else {
  console.log("Δεν βρέθηκαν αποθηκευμένα προϊόντα στο localStorage")
}

// Προσθέτουμε μερικά προϊόντα για δοκιμή αν δεν υπάρχουν
if (!savedProducts || JSON.parse(savedProducts).length === 0) {
  const defaultProducts = [
    { id: "1", name: "Αρνί Ψητό (ολόκληρο)", price: 18.5, unitName: "Κιλά" },
    { id: "2", name: "Κοκορέτσι", price: 12.0, unitName: "Κιλά" },
    { id: "3", name: "Κοντοσούβλι Χοιρινό", price: 14.8, unitName: "Κιλά" },
    { id: "4", name: "Μπριζόλες Αρνίσιες", price: 16.2, unitName: "Κιλά" },
    { id: "5", name: "Αρνί Γεμιστό", price: 19.5, unitName: "Κιλά" },
    { id: "6", name: "Γύρος Χοιρινός", price: 13.5, unitName: "Κιλά" },
    { id: "7", name: "Κεμπάπ", price: 11.0, unitName: "Κιλά" },
    { id: "8", name: "Λουκάνικα Χωριάτικα", price: 9.8, unitName: "Κιλά" },
    { id: "9", name: "Σουβλάκι Χοιρινό", price: 10.5, unitName: "Κιλά" },
    { id: "10", name: "Κιμάς Μοσχαρίσιος", price: 12.5, unitName: "Κιλά" },
  ]

  localStorage.setItem("products", JSON.stringify(defaultProducts))
  console.log("Προστέθηκαν δοκιμαστικά προϊόντα στο localStorage")
}
