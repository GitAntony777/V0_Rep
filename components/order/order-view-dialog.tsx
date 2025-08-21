"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit } from "lucide-react"
import { PrintUtils } from "../print-utils"

interface OrderViewDialogProps {
  order: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (order: any) => void
}

export function OrderViewDialog({ order, open, onOpenChange, onEdit }: OrderViewDialogProps) {
  if (!order) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Παραδόθηκε":
        return "default"
      case "Μέσα":
        return "secondary"
      case "Εκκρεμότητες":
      case "Μέσα/Εκκρεμότητες":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Προβολή Παραγγελίας #{order.id}</DialogTitle>
          <DialogDescription>Λεπτομέρειες παραγγελίας</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Στοιχεία Πελάτη</h3>
              <p className="font-medium">{order.customer}</p>
              <p className="text-sm">{order.customerAddress}</p>
              <p className="text-sm">{order.customerPhone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Στοιχεία Παραγγελίας</h3>
              <p>
                <span className="font-medium">Κωδικός:</span> {order.id}
              </p>
              <p>
                <span className="font-medium">Ημ. Παραγγελίας:</span>{" "}
                {new Date(order.orderDate).toLocaleDateString("el-GR")}
              </p>
              <p>
                <span className="font-medium">Ημ. Παράδοσης:</span>{" "}
                {new Date(order.deliveryDate).toLocaleDateString("el-GR")}
              </p>
              <p>
                <span className="font-medium">Υπάλληλος:</span> {order.employee}
              </p>
              <p>
                <span className="font-medium">Κατάσταση:</span>{" "}
                <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Προϊόντα Παραγγελίας</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Προϊόν</TableHead>
                    <TableHead>Ποσότητα</TableHead>
                    <TableHead>Τιμή Μονάδος</TableHead>
                    <TableHead>Έκπτωση</TableHead>
                    <TableHead>Σύνολο</TableHead>
                    <TableHead>Οδηγίες</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        €{isNaN(Number(item.unitPrice)) ? "0.00" : Number(item.unitPrice).toFixed(2)}
                      </TableCell>
                      <TableCell>{item.discount}%</TableCell>
                      <TableCell>€{isNaN(Number(item.total)) ? "0.00" : Number(item.total).toFixed(2)}</TableCell>
                      <TableCell>{item.instructions || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Υποσύνολο:</span>
              <span>€{isNaN(Number(order.subtotal)) ? "0.00" : Number(order.subtotal).toFixed(2)}</span>
            </div>

            {order.orderDiscount > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Έκπτωση ({order.orderDiscount}%):</span>
                <span>
                  -€
                  {isNaN((Number(order.subtotal) * Number(order.orderDiscount)) / 100)
                    ? "0.00"
                    : ((Number(order.subtotal) * Number(order.orderDiscount)) / 100).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
              <span>Συνολικό Κόστος:</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                €{isNaN(Number(order.total)) ? "0.00" : Number(order.total).toFixed(2)}
              </Badge>
            </div>
          </div>

          {order.pendingIssues && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-800 mb-1">Εκκρεμότητες</h3>
              <p className="text-red-700">{order.pendingIssues}</p>
            </div>
          )}

          {order.comments && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Σχόλια Παραγγελίας</h3>
              <p className="text-blue-700">{order.comments}</p>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Κλείσιμο
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onEdit(order)}>
                <Edit className="h-4 w-4 mr-1" />
                Επεξεργασία
              </Button>
              <PrintUtils
                title="Εκτύπωση Παραγγελίας"
                data={{
                  id: order.id,
                  customerName: order.customer,
                  customerAddress: order.customerAddress,
                  customerPhone: order.customerPhone,
                  orderDate: order.orderDate,
                  deliveryDate: order.deliveryDate,
                  items: order.items,
                  subtotal: order.subtotal,
                  orderDiscount: order.orderDiscount,
                  total: order.total,
                  status: order.status,
                  comments: order.comments,
                  pendingIssues: order.pendingIssues,
                  employee: order.employee,
                  period: order.period,
                }}
                type="order"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
