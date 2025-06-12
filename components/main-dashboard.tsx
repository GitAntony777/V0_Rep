import React from "react"
import { OrderForm } from "./order-form-fixed"

const MainDashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Κεντρικός Πίνακας Ελέγχου</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Φόρμα Παραγγελίας</h2>
          <React.Suspense fallback={<OrderFormFallback />}>
            <OrderForm />
          </React.Suspense>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Στατιστικά</h2>
          <p>Εμφάνιση στατιστικών δεδομένων εδώ.</p>
        </div>
      </div>
    </div>
  )
}

// Fallback για το OrderForm αν δεν φορτώσει
const OrderFormFallback = () => (
  <div className="p-8 text-center">
    <p>Φόρτωση φόρμας παραγγελίας...</p>
  </div>
)

export default MainDashboard
