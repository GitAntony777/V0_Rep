"use client"

import { Button } from "@/components/ui/button"
import { Printer, Download } from "lucide-react"

interface PrintUtilsProps {
  title: string
  data: any
  type: "customer" | "product" | "order" | "employee" | "report"
}

export function PrintUtils({ title, data, type }: PrintUtilsProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = generatePrintContent(title, data, type)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .company-info { text-align: center; margin-bottom: 20px; }
            .content { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 0.9em; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="company-info">
            <h1>ΤΟ ΜΠΕΛΛΕΣ - Κρεοπωλείο</h1>
            <p>Καπετάν Γκόνη 34, 55131 Καλαμαρια, Θεσσαλονίκη</p>
            <p>Τηλ: 2310-123456 | Email: info@tobelles.gr</p>
          </div>
          <div class="header">
            <h2>${title}</h2>
            <p>Ημερομηνία εκτύπωσης: ${new Date().toLocaleDateString("el-GR")}</p>
          </div>
          <div class="content">
            ${printContent}
          </div>
          <div class="footer">
            <p>Εκτυπώθηκε από το σύστημα διαχείρισης παραγγελιών - ΤΟ ΜΠΕΛΛΕΣ</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  const handleExport = () => {
    const csvContent = generateCSVContent(data, type)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-1" />
        Εκτύπωση
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4 mr-1" />
        Εξαγωγή CSV
      </Button>
    </div>
  )
}

function generatePrintContent(title: string, data: any, type: string): string {
  switch (type) {
    case "customer":
      return generateCustomerPrintContent(data)
    case "product":
      return generateProductPrintContent(data)
    case "order":
      return generateOrderPrintContent(data)
    case "employee":
      return generateEmployeePrintContent(data)
    case "report":
      return generateReportPrintContent(data)
    default:
      return "<p>Μη υποστηριζόμενος τύπος εκτύπωσης</p>"
  }
}

function generateCustomerPrintContent(customers: any[]): string {
  return `
    <table>
      <thead>
        <tr>
          <th>Κωδικός</th>
          <th>Ονοματεπώνυμο</th>
          <th>Διεύθυνση</th>
          <th>Τηλέφωνο</th>
          <th>Παραγγελίες</th>
          <th>Σύνολο</th>
        </tr>
      </thead>
      <tbody>
        ${customers
          .map(
            (customer) => `
          <tr>
            <td>${customer.code}</td>
            <td>${customer.firstName} ${customer.lastName}</td>
            <td>${customer.address}</td>
            <td>${customer.mobile}</td>
            <td>${customer.totalOrders}</td>
            <td>€${customer.totalSpent.toLocaleString()}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    <div class="total">
      Σύνολο Πελατών: ${customers.length}
    </div>
  `
}

function generateProductPrintContent(products: any[]): string {
  return `
    <table>
      <thead>
        <tr>
          <th>Κωδικός</th>
          <th>Ονομασία</th>
          <th>Κατηγορία</th>
          <th>Τιμή</th>
          <th>Μονάδα</th>
        </tr>
      </thead>
      <tbody>
        ${products
          .map(
            (product) => `
          <tr>
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td>${product.categoryName}</td>
            <td>€${product.price.toFixed(2)}</td>
            <td>${product.unitName}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    <div class="total">
      Σύνολο Προϊόντων: ${products.length}
    </div>
  `
}

function generateOrderPrintContent(order: any): string {
  return `
    <div style="margin-bottom: 20px;">
      <h3>Στοιχεία Παραγγελίας</h3>
      <p><strong>Κωδικός:</strong> ${order.id || "N/A"}</p>
      <p><strong>Πελάτης:</strong> ${order.customerName || "N/A"}</p>
      <p><strong>Διεύθυνση:</strong> ${order.customerAddress || "N/A"}</p>
      <p><strong>Τηλέφωνο:</strong> ${order.customerPhone || "N/A"}</p>
      <p><strong>Ημερομηνία Παραγγελίας:</strong> ${order.orderDate ? new Date(order.orderDate).toLocaleDateString("el-GR") : "N/A"}</p>
      <p><strong>Ημερομηνία Παράδοσης:</strong> ${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("el-GR") : "N/A"}</p>
      <p><strong>Κατάσταση:</strong> ${order.status || "N/A"}</p>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Προϊόν</th>
          <th>Ποσότητα</th>
          <th>Μονάδα</th>
          <th>Τιμή</th>
          <th>Σύνολο</th>
          <th>Σχόλια</th>
        </tr>
      </thead>
      <tbody>
        ${
          order.items && Array.isArray(order.items)
            ? order.items
                .map(
                  (item: any) => `
          <tr>
            <td>${item.productName || "N/A"}</td>
            <td>${item.quantity || 0}</td>
            <td>${item.unit || "N/A"}</td>
            <td>€${(item.price || item.unitPrice || 0).toFixed(2)}</td>
            <td>€${(item.total || 0).toFixed(2)}</td>
            <td>${item.comments || item.instructions || "-"}</td>
          </tr>
        `,
                )
                .join("")
            : "<tr><td colspan='6'>Δεν υπάρχουν προϊόντα</td></tr>"
        }
      </tbody>
    </table>
    
    <div class="total">
      <p>Υποσύνολο: €${(order.subtotal || 0).toFixed(2)}</p>
      ${order.orderDiscount && order.orderDiscount > 0 ? `<p>Έκπτωση Παραγγελίας (${order.orderDiscount}%): -€${(((order.subtotal || 0) * (order.orderDiscount || 0)) / 100).toFixed(2)}</p>` : ""}
      <p>Συνολικό Κόστος: €${(order.total || order.amount || 0).toFixed(2)}</p>
    </div>
    
    ${order.comments ? `<div style="margin-top: 20px;"><strong>Σχόλια:</strong> ${order.comments}</div>` : ""}
    ${order.pendingIssues ? `<div style="margin-top: 20px;"><strong>Εκκρεμότητες:</strong> ${order.pendingIssues}</div>` : ""}
  `
}

function generateEmployeePrintContent(employees: any[]): string {
  return `
    <table>
      <thead>
        <tr>
          <th>Κωδικός</th>
          <th>Ονοματεπώνυμο</th>
          <th>Κινητό</th>
          <th>Email</th>
          <th>Username</th>
          <th>Ημερομηνία Πρόσληψης</th>
        </tr>
      </thead>
      <tbody>
        ${employees
          .map(
            (employee) => `
          <tr>
            <td>${employee.code}</td>
            <td>${employee.firstName} ${employee.lastName}</td>
            <td>${employee.mobile}</td>
            <td>${employee.email || "-"}</td>
            <td>${employee.username}</td>
            <td>${new Date(employee.createdAt).toLocaleDateString("el-GR")}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    <div class="total">
      Σύνολο Υπαλλήλων: ${employees.length}
    </div>
  `
}

function generateReportPrintContent(data: any): string {
  return `
    <div style="margin-bottom: 30px;">
      <h3>Συνοπτικά Στοιχεία</h3>
      <p><strong>Συνολικά Έσοδα:</strong> €${data.totalRevenue?.toLocaleString() || "0"}</p>
      <p><strong>Συνολικές Παραγγελίες:</strong> ${data.totalOrders || 0}</p>
      <p><strong>Μέση Αξία Παραγγελίας:</strong> €${data.averageOrderValue || 0}</p>
    </div>
    
    <h3>Κορυφαίοι Πελάτες</h3>
    <table>
      <thead>
        <tr>
          <th>Πελάτης</th>
          <th>Παραγγελίες</th>
          <th>Σύνολο</th>
        </tr>
      </thead>
      <tbody>
        ${
          data.topCustomers
            ?.map(
              (customer: any) => `
          <tr>
            <td>${customer.name}</td>
            <td>${customer.orders}</td>
            <td>€${customer.total.toLocaleString()}</td>
          </tr>
        `,
            )
            .join("") || ""
        }
      </tbody>
    </table>
    
    <h3>Κορυφαία Προϊόντα</h3>
    <table>
      <thead>
        <tr>
          <th>Προϊόν</th>
          <th>Ποσότητα</th>
          <th>Έσοδα</th>
        </tr>
      </thead>
      <tbody>
        ${
          data.topProducts
            ?.map(
              (product: any) => `
          <tr>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>€${product.revenue.toLocaleString()}</td>
          </tr>
        `,
            )
            .join("") || ""
        }
      </tbody>
    </table>
  `
}

function generateCSVContent(data: any, type: string): string {
  switch (type) {
    case "customer":
      return generateCustomerCSV(data)
    case "product":
      return generateProductCSV(data)
    case "employee":
      return generateEmployeeCSV(data)
    default:
      return "Τύπος,Δεδομένα\n"
  }
}

function generateCustomerCSV(customers: any[]): string {
  const headers = "Κωδικός,Όνομα,Επώνυμο,Διεύθυνση,Κινητό,Email,Παραγγελίες,Σύνολο\n"
  const rows = customers
    .map(
      (customer) =>
        `${customer.code},"${customer.firstName}","${customer.lastName}","${customer.address}",${customer.mobile},"${customer.email || ""}","${customer.totalOrders}",${customer.totalSpent}`,
    )
    .join("\n")
  return headers + rows
}

function generateProductCSV(products: any[]): string {
  const headers = "Κωδικός,Ονομασία,Κατηγορία,Τιμή,Μονάδα\n"
  const rows = products
    .map(
      (product) => `${product.code},"${product.name}","${product.categoryName}",${product.price},"${product.unitName}"`,
    )
    .join("\n")
  return headers + rows
}

function generateEmployeeCSV(employees: any[]): string {
  const headers = "Κωδικός,Όνομα,Επώνυμο,Κινητό,Email,Username\n"
  const rows = employees
    .map(
      (employee) =>
        `${employee.code},"${employee.firstName}","${employee.lastName}",${employee.mobile},"${employee.email || ""}","${employee.username}"`,
    )
    .join("\n")
  return headers + rows
}
