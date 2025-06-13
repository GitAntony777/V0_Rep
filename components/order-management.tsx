"use client"

import { OrderManagementSimplified } from "@/components/order/order-management-simplified"

interface OrderManagementProps {
  userRole: "admin" | "employee" | null
}

export function OrderManagement({ userRole }: OrderManagementProps) {
  return <OrderManagementSimplified userRole={userRole} />
}
