"use client"

// PDF Service για δημιουργία PDF αρχείων παραγγελιών
// Χρησιμοποιεί τις βιβλιοθήκες jsPDF και html2canvas

import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface OrderPdfData {
  id: string
  customer: string
  customerAddress: string
  customerPhone: string
  orderDate: string
  deliveryDate: string
  items: any[]
  subtotal: number
  orderDiscount: number
  total: number
  status: string
  comments?: string
  pendingIssues?: string
  employee: string
  period: string
}

export class PdfService {
  private static isJsPdfLoaded = false
  private static isHtml2CanvasLoaded = false

  // Φόρτωση των απαραίτητων βιβλιοθηκών
  private static async loadLibraries(): Promise<void> {
    const loadPromises: Promise<void>[] = []

    if (!this.isJsPdfLoaded) {
      loadPromises.push(
        new Promise<void>((resolve, reject) => {
          const script = document.createElement("script")
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
          script.onload = () => {
            this.isJsPdfLoaded = true
            resolve()
          }
          script.onerror = reject
          document.head.appendChild(script)
        }),
      )
    }

    if (!this.isHtml2CanvasLoaded) {
      loadPromises.push(
        new Promise<void>((resolve, reject) => {
          const script = document.createElement("script")
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
          script.onload = () => {
            this.isHtml2CanvasLoaded = true
            resolve()
          }
          script.onerror = reject
          document.head.appendChild(script)
        }),
      )
    }

    return Promise.all(loadPromises).then(() => {})
  }

  // Δημιουργία PDF από δεδομένα παραγγελίας
  public static async generateOrderPdf(orderData: OrderPdfData): Promise<Blob> {
    await this.loadLibraries()

    return new Promise((resolve, reject) => {
      try {
        // Δημιουργία προσωρινού div για το περιεχόμενο του PDF
        const tempDiv = document.createElement("div")
        tempDiv.style.position = "absolute"
        tempDiv.style.left = "-9999px"
        tempDiv.style.top = "-9999px"
        tempDiv.style.width = "800px" // Σταθερό πλάτος για καλύτερη μορφοποίηση
        tempDiv.innerHTML = this.generateOrderHtml(orderData)
        document.body.appendChild(tempDiv)

        // Χρήση html2canvas για μετατροπή του HTML σε εικόνα
        // @ts-ignore
        // @ts-ignore
        html2canvas(tempDiv, {
          scale: 1.5, // Καλύτερη ποιότητα
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        }).then((canvas) => {
          // Δημιουργία PDF με jsPDF
          // @ts-ignore
          // @ts-ignore
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          })

          // Προσθήκη της εικόνας στο PDF
          const imgData = canvas.toDataURL("image/png")
          const pdfWidth = pdf.internal.pageSize.getWidth()
          const pdfHeight = pdf.internal.pageSize.getHeight()
          const imgWidth = canvas.width
          const imgHeight = canvas.height
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
          const imgX = (pdfWidth - imgWidth * ratio) / 2
          const imgY = 10 // Περιθώριο πάνω

          pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)

          // Αφαίρεση του προσωρινού div
          document.body.removeChild(tempDiv)

          // Μετατροπή του PDF σε Blob
          const pdfBlob = pdf.output("blob")
          resolve(pdfBlob)
        })
      } catch (error) {
        console.error("Σφάλμα κατά τη δημιουργία PDF:", error)
        reject(error)
      }
    })
  }

  // Δημιουργία HTML περιεχομένου για το PDF
  private static generateOrderHtml(orderData: OrderPdfData): string {
    const itemsHTML = orderData.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; border: 1px solid #ddd;">${item.productName}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity} ${item.unit}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">€${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.discount}%</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">€${item.total.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.instructions || "-"}</td>
        </tr>
      `,
      )
      .join("")

    const discountHTML =
      orderData.orderDiscount > 0
        ? `
        <tr>
          <td style="padding: 8px; text-align: right; font-weight: bold;">Έκπτωση Παραγγελίας (${orderData.orderDiscount}%):</td>
          <td style="padding: 8px; text-align: right; color: #e74c3c;">-€${((orderData.subtotal * orderData.orderDiscount) / 100).toFixed(2)}</td>
        </tr>
      `
        : ""

    return `
      <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: white;">
        <div style="max-width: 800px; margin: 0 auto;">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2c3e50; padding-bottom: 20px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">ΤΟ ΜΠΕΛΛΕΣ</h1>
            <p style="color: #7f8c8d; margin: 5px 0; font-size: 16px;">Κρεοπωλείο</p>
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">Καπετάν Γκόνη 34, 55131 Καλαμαρια, Θεσσαλονίκη</p>
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">Τηλ: 2310-123456 | Email: info@tobelles.gr</p>
          </div>

          <!-- Title -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #27ae60; margin: 0; font-size: 24px;">
              ΠΑΡΑΓΓΕΛΙΑ Νο ${orderData.id}
            </h2>
            <p style="margin: 10px 0;">Ημερομηνία εκτύπωσης: ${new Date().toLocaleDateString("el-GR")}</p>
          </div>

          <!-- Customer Info -->
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">Στοιχεία Πελάτη</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong>Όνομα:</strong> ${orderData.customer}<br>
                <strong>Διεύθυνση:</strong> ${orderData.customerAddress}
              </div>
              <div>
                <strong>Τηλέφωνο:</strong> ${orderData.customerPhone}<br>
              </div>
            </div>
          </div>

          <!-- Order Info -->
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">Στοιχεία Παραγγελίας</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong>Ημερομηνία Παραγγελίας:</strong> ${new Date(orderData.orderDate).toLocaleDateString("el-GR")}<br>
                <strong>Ημερομηνία Παράδοσης:</strong> ${new Date(orderData.deliveryDate).toLocaleDateString("el-GR")}
              </div>
              <div>
                <strong>Κατάσταση:</strong> <span style="color: ${orderData.status === "Παραδόθηκε" ? "#27ae60" : orderData.status.includes("Εκκρεμότητες") ? "#e74c3c" : "#f39c12"};">${orderData.status}</span><br>
                <strong>Υπάλληλος:</strong> ${orderData.employee}<br>
                <strong>Περίοδος:</strong> ${orderData.period}
              </div>
            </div>
          </div>

          <!-- Products Table -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">Προϊόντα Παραγγελίας</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
              <thead>
                <tr style="background-color: #34495e; color: white;">
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Προϊόν</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Ποσότητα</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Τιμή</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Έκπτωση</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Σύνολο</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Οδηγίες</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; text-align: right; font-weight: bold;">Υποσύνολο:</td>
                <td style="padding: 8px; text-align: right; font-size: 16px;">€${orderData.subtotal.toFixed(2)}</td>
              </tr>
              ${discountHTML}
              <tr style="border-top: 2px solid #2c3e50;">
                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #2c3e50;">Συνολικό Κόστος:</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 20px; color: #27ae60;">€${orderData.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <!-- Comments and Issues -->
          ${
            orderData.comments || orderData.pendingIssues
              ? `
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
              ${orderData.comments ? `<div style="margin-bottom: 15px;"><strong>Σχόλια:</strong><br>${orderData.comments}</div>` : ""}
              ${orderData.pendingIssues ? `<div><strong style="color: #e74c3c;">Εκκρεμότητες:</strong><br><span style="color: #e74c3c;">${orderData.pendingIssues}</span></div>` : ""}
            </div>
          `
              : ""
          }

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1; color: #7f8c8d;">
            <p style="margin: 0; font-size: 14px;">Εκτυπώθηκε από το σύστημα διαχείρισης παραγγελιών - ΤΟ ΜΠΕΛΛΕΣ</p>
          </div>

        </div>
      </div>
    `
  }
}

// Hook για χρήση του PDF service
export function usePdfService() {
  const generateOrderPdf = async (orderData: OrderPdfData): Promise<Blob> => {
    return await PdfService.generateOrderPdf(orderData)
  }

  return {
    generateOrderPdf,
  }
}
