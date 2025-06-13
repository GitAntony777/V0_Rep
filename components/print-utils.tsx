"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface PrintUtilsProps {
  title: string
  data: any
  type: "order" | "customer" | "product" | "report"
}

export function PrintUtils({ title, data, type }: PrintUtilsProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    let content = ""

    if (type === "order") {
      content = generateOrderPrintContent(data)
    } else if (type === "customer") {
      content = generateCustomerPrintContent(data)
    } else if (type === "product") {
      content = generateProductPrintContent(data)
    } else if (type === "report") {
      content = generateReportPrintContent(data)
    }

    printWindow.document.write(content)
    printWindow.document.close()
  }

  const generateOrderPrintContent = (orderData: any) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-box { width: 48%; }
            .info-box h3 { margin-bottom: 5px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .product-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .product-table th, .product-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .product-table th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; text-align: right; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
            .status { padding: 5px 10px; border-radius: 4px; display: inline-block; }
            .status-new { background-color: #e2e8f0; }
            .status-ready { background-color: #c6f6d5; }
            .status-pending { background-color: #fed7d7; }
            .status-delivered { background-color: #bfdbfe; }
            .notes { margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ΤΟ ΜΠΕΛΛΕΣ - Κρεοπωλείο</h1>
            <p>Παραγγελία #${orderData.id}</p>
            <p>Περίοδος: ${orderData.period || "Δεν καθορίστηκε"}</p>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <h3>Στοιχεία Πελάτη</h3>
              <p><strong>Όνομα:</strong> ${orderData.customerName}</p>
              <p><strong>Διεύθυνση:</strong> ${orderData.customerAddress}</p>
              <p><strong>Τηλέφωνο:</strong> ${orderData.customerPhone}</p>
            </div>
            
            <div class="info-box">
              <h3>Στοιχεία Παραγγελίας</h3>
              <p><strong>Ημ. Παραγγελίας:</strong> ${new Date(orderData.orderDate).toLocaleDateString("el-GR")}</p>
              <p><strong>Ημ. Παράδοσης:</strong> ${new Date(orderData.deliveryDate).toLocaleDateString("el-GR")}</p>
              <p><strong>Υπάλληλος:</strong> ${orderData.employee}</p>
              <p><strong>Κατάσταση:</strong> <span class="status status-${getStatusClass(orderData.status)}">${
                orderData.status
              }</span></p>
            </div>
          </div>
          
          <h3>Προϊόντα Παραγγελίας</h3>
          <table class="product-table">
            <thead>
              <tr>
                <th>Προϊόν</th>
                <th>Ποσότητα</th>
                <th>Τιμή Μονάδος</th>
                <th>Έκπτωση</th>
                <th>Σύνολο</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.items
                .map(
                  (item: any) => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity} ${item.unit}</td>
                  <td>€${Number(item.unitPrice).toFixed(2)}</td>
                  <td>${item.discount}%</td>
                  <td>€${Number(item.total).toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="totals">
            <p><strong>Υποσύνολο:</strong> €${Number(orderData.subtotal).toFixed(2)}</p>
            ${
              orderData.orderDiscount > 0
                ? `<p><strong>Έκπτωση (${orderData.orderDiscount}%):</strong> -€${(
                    (Number(orderData.subtotal) * Number(orderData.orderDiscount)) / 100
                  ).toFixed(2)}</p>`
                : ""
            }
            <p><strong>Συνολικό Κόστος:</strong> €${Number(orderData.total).toFixed(2)}</p>
          </div>
          
          ${
            orderData.pendingIssues
              ? `
          <div class="notes">
            <h3>Εκκρεμότητες</h3>
            <p>${orderData.pendingIssues}</p>
          </div>
          `
              : ""
          }
          
          ${
            orderData.comments
              ? `
          <div class="notes">
            <h3>Σχόλια Παραγγελίας</h3>
            <p>${orderData.comments}</p>
          </div>
          `
              : ""
          }
          
          <div class="footer">
            <p>ΤΟ ΜΠΕΛΛΕΣ - Κρεοπωλείο | Τηλ: 210-1234567 | Email: info@belles.gr</p>
            <p>Εκτυπώθηκε στις ${new Date().toLocaleString("el-GR")}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `
  }

  const generateCustomerPrintContent = (customerData: any) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .customer-info { margin-bottom: 30px; }
            .customer-info h2 { margin-bottom: 10px; }
            .customer-info p { margin: 5px 0; }
            .orders-table { width: 100%; border-collapse: collapse; }
            .orders-table th, .orders-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .orders-table th { background-color: #f2f2f2; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ΤΟ ΜΠΕΛΛΕΣ - Κρεοπωλείο</h1>
            <p>Στοιχεία Πελάτη</p>
          </div>
          
          <div class="customer-info">
            <h2>${customerData.firstName} ${customerData.lastName}</h2>
            <p><strong>Κωδικός:</strong> ${customerData.code}</p>
            <p><strong>Διεύθυνση:</strong> ${customerData.address}</p>
            <p><strong>Τηλέφωνο:</strong> ${customerData.mobile}</p>
            <p><strong>Email:</strong> ${customerData.email || "-"}</p>
            <p><strong>ΑΦΜ:</strong> ${customerData.taxId || "-"}</p>
          </div>
          
          ${
            customerData.orders && customerData.orders.length > 0
              ? `
          <h3>Ιστορικό Παραγγελιών</h3>
          <table class="orders-table">
            <thead>
              <tr>
                <th>Κωδικός</th>
                <th>Ημερομηνία</th>
                <th>Ποσό</th>
                <th>Κατάσταση</th>
              </tr>
            </thead>
            <tbody>
              ${customerData.orders
                .map(
                  (order: any) => `
                <tr>
                  <td>${order.id}</td>
                  <td>${new Date(order.orderDate).toLocaleDateString("el-GR")}</td>
                  <td>€${Number(order.total).toFixed(2)}</td>
                  <td>${order.status}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          `
              : "<p>Δεν υπάρχουν καταχωρημένες παραγγελίες για αυτόν τον πελάτη.</p>"
          }
          
          <div class="footer">
            <p>ΤΟ ΜΠΕΛΛΕΣ - Κρεοπωλείο | Τηλ: 210-1234567 | Email: info@belles.gr</p>
            <p>Εκτυπώθηκε στις ${new Date().toLocaleString("el-GR")}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `
  }

  const generateProductPrintContent = (productData: any) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .product-info { display: flex; margin-bottom: 30px; }
            .product-image { width: 200px; height: 200px; object-fit: cover; margin-right: 20px; border: 1px solid #ddd; }
            .product-details { flex: 1; }
            .product-details h2 { margin-bottom: 10px; }
            .product-details p { margin: 5px 0; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ΤΟ ΜΠΕΛΛΕΣ - Κρεοπωλείο</h1>
            <p>Στοιχεία Προϊόντος</p>
          </div>
          
          <div class="product-info">
            ${
              productData.image
                ? `<img src="${productData.image}" alt="${productData.name}" class="product-image">`
                : ""
            }
            <div class="product-details">
              <h2>${productData.name}</h2>
              <p><strong>Κωδικός:</strong> ${productData.code}</p>
              <p><strong>Κατηγορία:</strong> ${productData.category}</p>
              <p><strong>Τιμή:</strong> €${Number(productData.price).toFixed(2)}/${productData.unitName || "Κιλό"}</p>
              <p><strong>Διαθεσιμότητα:</strong> ${productData.inStock ? "Σε απόθεμα" : "Εκτός αποθέματος"}</p>
              <p><strong>Περιγραφή:</strong> ${productData.description || "-"}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>ΤΟ ΜΠΕΛΛΕΣ - Κρεοπωλείο | Τηλ: 210-1234567 | Email: info@belles.gr</p>
            <p>Εκτυπώθηκε στις ${new Date().toLocaleString("el-GR")}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `
  }

  const generateReportPrintContent = (reportData: any) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .report-info { margin-bottom: 20px; }
            .report-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .report-table th, .report-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .report-table th { background-color: #f2f2f2; }
            .summary { margin-top: 30px; }
            .chart-container { margin-top: 30px; text-align: center; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ΤΟ ΜΠΕΛΛΕΣ - Κρεοπωλείο</h1>
            <p>${reportData.title}</p>
            <p>Περίοδος: ${reportData.period}</p>
          </div>
          
          <div class="report-info">
            <p><strong>Ημερομηνία Δημιουργίας:</strong> ${new Date().toLocaleDateString("el-GR")}</p>
            <p><strong>Χρονικό Διάστημα:</strong> ${new Date(reportData.startDate).toLocaleDateString("el-GR")} - ${new Date(
              reportData.endDate,
            ).toLocaleDateString("el-GR")}</p>
          </div>
          
          <table class="report-table">
            <thead>
              <tr>
                ${reportData.headers.map((header: string) => `<th>${header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${reportData.data
                .map(
                  (row: any[]) => `
                <tr>
                  ${row.map((cell) => `<td>${cell}</td>`).join("")}
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="summary">
            <h3>Σύνοψη</h3>
            ${reportData.summary
              .map(
                (item: { label: string; value: string }) => `
              <p><strong>${item.label}:</strong> ${item.value}</p>
            `,
              )
              .join("")}
          </div>
          
          <div class="footer">
            <p>ΤΟ ΜΠΕΛΛΕΣ - Κρεοπωλείο | Τηλ: 210-1234567 | Email: info@belles.gr</p>
            <p>Εκτυπώθηκε στις ${new Date().toLocaleString("el-GR")}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Παραδόθηκε":
        return "delivered"
      case "Μέσα":
        return "ready"
      case "Εκκρεμότητες":
      case "Μέσα/Εκκρεμότητες":
        return "pending"
      default:
        return "new"
    }
  }

  return (
    <Button variant="outline" onClick={handlePrint}>
      <Printer className="h-4 w-4 mr-2" />
      {title}
    </Button>
  )
}
