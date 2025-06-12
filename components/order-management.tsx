import { OrderForm } from "./order-form-fixed"

const OrderManagement = () => {
  const renderContent = () => {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Order Management</h1>
        <div className="space-y-6">
          <OrderForm />
          {/* Rest of the existing order management content */}
        </div>
      </div>
    )
  }

  return <div>{renderContent()}</div>
}

export default OrderManagement
