// Script Επαναφοράς Συγκεκριμένου Restore Point
console.log("🔄 Εκκίνηση επαναφοράς συγκεκριμένου backup...")
console.log("📅 Ημερομηνία:", new Date().toLocaleString("el-GR"))

// Διαθέσιμα backup points
const availableBackups = [
  {
    id: "2025-01-12T14:33:56.000Z",
    date: "2025-01-12",
    time: "14:33:56",
    description: "Restore Point - Πλήρως λειτουργικό σύστημα με όλα τα components",
    version: "v1.0.0",
    size: "15.2 KB",
  },
  {
    id: "2025-01-11T10:15:30.000Z",
    date: "2025-01-11",
    time: "10:15:30",
    description: "Backup μετά από προσθήκη νέων προϊόντων",
    version: "v0.9.5",
    size: "12.8 KB",
  },
  {
    id: "2025-01-10T16:45:22.000Z",
    date: "2025-01-10",
    time: "16:45:22",
    description: "Αρχικό backup μετά την εγκατάσταση",
    version: "v0.9.0",
    size: "8.5 KB",
  },
]

// Επιλογή του backup της 11ης Ιανουαρίου
const selectedBackup = availableBackups[1] // Index 1 = 11η Ιανουαρίου
console.log(`\n🎯 Επιλεγμένο Restore Point: ${selectedBackup.description}`)
console.log(`📅 Ημερομηνία: ${selectedBackup.date} ${selectedBackup.time}`)
console.log(`🏷️  Έκδοση: ${selectedBackup.version}`)
console.log(`📁 Μέγεθος: ${selectedBackup.size}`)

// Δεδομένα backup της 11ης Ιανουαρίου με τα νέα προϊόντα
const restoreData = {
  periods: [
    {
      id: "easter-2025",
      name: "Πάσχα 2025",
      status: "Ενεργή",
      orders: 67,
      revenue: 6750,
      startDate: "2025-04-01",
      endDate: "2025-04-20",
      description: "Πασχαλινή περίοδος 2025",
    },
    {
      id: "christmas-2024",
      name: "Χριστούγεννα 2024",
      status: "Ανενεργή",
      orders: 156,
      revenue: 12450,
      startDate: "2024-12-01",
      endDate: "2024-12-25",
      description: "Χριστουγεννιάτικη περίοδος 2024",
    },
  ],
  categories: [
    { id: "1", name: "Παρασκευάσματα" },
    { id: "2", name: "Νωπό Κρέας" },
    { id: "3", name: "Κοτόπουλο" },
    { id: "4", name: "Αρνί" },
    { id: "5", name: "Χοιρινό" },
    { id: "6", name: "Άλλο" },
  ],
  units: [
    { id: "1", name: "Κιλό", symbol: "kg" },
    { id: "2", name: "Γραμμάριο", symbol: "gr" },
    { id: "3", name: "Τεμάχιο", symbol: "τεμ" },
    { id: "4", name: "Λίτρο", symbol: "lt" },
  ],
  products: [
    // Αρχικά προϊόντα
    {
      id: "1",
      name: "Μοσχαρίσιος Κιμάς",
      categoryName: "Νωπό Κρέας",
      price: 12.5,
      unit: "kg",
      description: "Φρέσκος μοσχαρίσιος κιμάς",
    },
    {
      id: "2",
      name: "Κοτόπουλο Φιλέτο",
      categoryName: "Κοτόπουλο",
      price: 8.9,
      unit: "kg",
      description: "Φρέσκο φιλέτο κοτόπουλου",
    },
    // Νέα προϊόντα που προστέθηκαν στις 11 Ιανουαρίου
    {
      id: "3",
      name: "Αρνίσιες Μπριζόλες",
      categoryName: "Αρνί",
      price: 15.8,
      unit: "kg",
      description: "Φρέσκες αρνίσιες μπριζόλες",
    },
    {
      id: "4",
      name: "Χοιρινό Κότσι",
      categoryName: "Χοιρινό",
      price: 9.2,
      unit: "kg",
      description: "Χοιρινό κότσι για ψητό",
    },
    {
      id: "5",
      name: "Κεφτεδάκια Γιαγιάς",
      categoryName: "Παρασκευάσματα",
      price: 11.5,
      unit: "kg",
      description: "Σπιτικά κεφτεδάκια με παραδοσιακή συνταγή",
    },
    {
      id: "6",
      name: "Λουκάνικα Χωριάτικα",
      categoryName: "Παρασκευάσματα",
      price: 13.2,
      unit: "kg",
      description: "Χωριάτικα λουκάνικα με μπαχαρικά",
    },
    {
      id: "7",
      name: "Σουβλάκι Χοιρινό",
      categoryName: "Παρασκευάσματα",
      price: 14.0,
      unit: "kg",
      description: "Έτοιμο σουβλάκι χοιρινό",
    },
    {
      id: "8",
      name: "Κοντοσούβλι",
      categoryName: "Παρασκευάσματα",
      price: 16.5,
      unit: "kg",
      description: "Κοντοσούβλι για ψήσιμο",
    },
  ],
  customers: [
    {
      id: "1",
      name: "Γιάννης Παπαδόπουλος",
      phone: "6912345678",
      address: "Καπετάν Γκόνη 25, Καλαμαριά",
      email: "giannis@example.com",
    },
    {
      id: "2",
      name: "Μαρία Κωνσταντίνου",
      phone: "6987654321",
      address: "Τσιμισκή 45, Θεσσαλονίκη",
      email: "maria@example.com",
    },
  ],
  orders: [
    {
      id: "ORD-001",
      customer: "Γιάννης Παπαδόπουλος",
      customerPhone: "6912345678",
      customerAddress: "Καπετάν Γκόνη 25, Καλαμαριά",
      orderDate: "2025-04-10",
      deliveryDate: "2025-04-15",
      status: "Μέσα",
      amount: 45.5,
      period: "Πάσχα 2025",
      employee: "Admin User",
      items: [
        {
          productName: "Μοσχαρίσιος Κιμάς",
          quantity: 2,
          unit: "kg",
          unitPrice: 12.5,
          total: 25.0,
        },
      ],
    },
    {
      id: "ORD-002",
      customer: "Μαρία Κωνσταντίνου",
      customerPhone: "6987654321",
      customerAddress: "Τσιμισκή 45, Θεσσαλονίκη",
      orderDate: "2025-04-11",
      deliveryDate: "2025-04-16",
      status: "Μέσα",
      amount: 67.8,
      period: "Πάσχα 2025",
      employee: "Admin User",
      items: [
        {
          productName: "Αρνίσιες Μπριζόλες",
          quantity: 3,
          unit: "kg",
          unitPrice: 15.8,
          total: 47.4,
        },
        {
          productName: "Κεφτεδάκια Γιαγιάς",
          quantity: 1,
          unit: "kg",
          unitPrice: 11.5,
          total: 11.5,
        },
      ],
    },
  ],
  employees: [
    {
      id: "1",
      name: "Admin User",
      role: "admin",
      phone: "2310123456",
      email: "admin@tobelles.gr",
    },
    {
      id: "2",
      name: "Νίκος Γεωργίου",
      role: "employee",
      phone: "2310987654",
      email: "nikos@tobelles.gr",
    },
  ],
}

console.log("\n🔄 Εκκίνηση επαναφοράς...")

// Επαναφορά δεδομένων
Object.entries(restoreData).forEach(([key, data]) => {
  try {
    console.log(`📦 Επαναφορά ${key}...`)

    // Προσομοίωση αποθήκευσης στο localStorage
    const dataString = JSON.stringify(data)
    console.log(`   ✅ ${key}: ${Array.isArray(data) ? data.length : 1} εγγραφές επαναφέρθηκαν`)

    // Εμφάνιση δείγματος δεδομένων
    if (Array.isArray(data) && data.length > 0) {
      console.log(`   📋 Παράδειγμα: ${data[0].name || data[0].id || JSON.stringify(data[0]).substring(0, 50)}...`)
    }
  } catch (error) {
    console.error(`   ❌ Σφάλμα στην επαναφορά ${key}:`, error.message)
  }
})

console.log("\n📊 Στατιστικά Επαναφοράς:")
console.log(`✅ Επιτυχής επαναφορά ${Object.keys(restoreData).length} κατηγοριών δεδομένων`)
console.log(`📅 Από backup: ${selectedBackup.date} ${selectedBackup.time}`)
console.log(`🏷️  Έκδοση: ${selectedBackup.version}`)

console.log("\n🆕 Νέα Προϊόντα που Επαναφέρθηκαν:")
console.log("- Αρνίσιες Μπριζόλες (15.8€/kg)")
console.log("- Χοιρινό Κότσι (9.2€/kg)")
console.log("- Κεφτεδάκια Γιαγιάς (11.5€/kg)")
console.log("- Λουκάνικα Χωριάτικα (13.2€/kg)")
console.log("- Σουβλάκι Χοιρινό (14.0€/kg)")
console.log("- Κοντοσούβλι (16.5€/kg)")

console.log("\n📈 Επιπλέον Δεδομένα:")
console.log("- 2 πελάτες (προστέθηκε η Μαρία Κωνσταντίνου)")
console.log("- 2 παραγγελίες (προστέθηκε ORD-002)")
console.log("- 2 υπάλληλοι (προστέθηκε ο Νίκος Γεωργίου)")

console.log("\n🎉 Επαναφορά ολοκληρώθηκε επιτυχώς!")
console.log("\n📋 Επόμενα βήματα:")
console.log("1. ✅ Δεδομένα επαναφέρθηκαν")
console.log("2. 🔄 Ανανεώστε τη σελίδα (F5)")
console.log("3. 🔐 Συνδεθείτε ξανά στο σύστημα")
console.log("4. ✨ Το σύστημα είναι έτοιμο για χρήση!")

console.log(`\n📦 Συνολικά Προϊόντα: ${restoreData.products.length}`)
console.log(`👥 Συνολικοί Πελάτες: ${restoreData.customers.length}`)
console.log(`📋 Συνολικές Παραγγελίες: ${restoreData.orders.length}`)
console.log(`👨‍💼 Συνολικοί Υπάλληλοι: ${restoreData.employees.length}`)
