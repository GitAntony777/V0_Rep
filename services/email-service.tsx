"use client"

import { PdfService } from "./pdf-service"

// EmailJS service για αποστολή emails
// Για να λειτουργήσει, χρειάζεται να δημιουργήσετε λογαριασμό στο https://www.emailjs.com/
// και να ρυθμίσετε τα service ID, template ID και public key

interface OrderEmailData {
  id: string
  customer: string
  customerEmail: string
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

interface EmailServiceConfig {
  serviceId: string
  templateId: string
  publicKey: string
}

// Προσωρινή διαμόρφωση - θα πρέπει να αντικατασταθεί με πραγματικά στοιχεία
const EMAIL_CONFIG: EmailServiceConfig = {
  serviceId: "your_service_id", // Αντικαταστήστε με το δικό σας service ID
  templateId: "your_template_id", // Αντικαταστήστε με το δικό σας template ID
  publicKey: "your_public_key", // Αντικαταστήστε με το δικό σας public key
}

export class EmailService {
  private static isEmailJSLoaded = false

  // Φόρτωση του EmailJS script
  private static async loadEmailJS(): Promise<void> {
    if (this.isEmailJSLoaded) return

    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"
      script.onload = () => {
        // @ts-ignore
        window.emailjs.init(EMAIL_CONFIG.publicKey)
        this.isEmailJSLoaded = true
        resolve()
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // Δημιουργία HTML περιεχομένου για το email
  private static generateOrderEmailHTML(orderData: OrderEmailData, isUpdate = false): string {
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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${isUpdate ? "Μεταβολή - Επεξεργασία" : ""} Παραγγελία ${orderData.id}</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 800px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2c3e50; padding-bottom: 20px;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">ΤΟ ΜΠΕΛΛΕΣ</h1>
              <p style="color: #7f8c8d; margin: 5px 0; font-size: 16px;">Κρεοπωλείο</p>
              <p style="color: #7f8c8d; margin: 0; font-size: 14px;">Καπετάν Γκόνη 34, 55131 Καλαμαρια, Θεσσαλονίκη</p>
              <p style="color: #7f8c8d; margin: 0; font-size: 14px;">Τηλ: 2310-123456 | Email: info@tobelles.gr</p>
            </div>

            <!-- Title -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: ${isUpdate ? "#e74c3c" : "#27ae60"}; margin: 0; font-size: 24px;">
                ${isUpdate ? "ΜΕΤΑΒΟΛΗ - ΕΠΕΞΕΡΓΑΣΙΑ ΠΑΡΑΓΓΕΛΙΑΣ" : "ΠΑΡΑΓΓΕΛΙΑ"} Νο ${orderData.id}
              </h2>
              ${isUpdate ? '<p style="color: #e74c3c; margin: 10px 0; font-weight: bold;">Η παραγγελία σας έχει ενημερωθεί</p>' : ""}
              <p style="margin: 10px 0;">Βρείτε συνημμένη την παραγγελία σας σε μορφή PDF.</p>
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
                  <strong>Email:</strong> ${orderData.customerEmail}
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
              <p style="margin: 0; font-size: 14px;">Σας ευχαριστούμε για την εμπιστοσύνη σας!</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">Για οποιαδήποτε απορία, επικοινωνήστε μαζί μας στο 2310-123456</p>
            </div>

          </div>
        </body>
      </html>
    `
  }

  // Αποστολή email παραγγελίας με συνημμένο PDF
  public static async sendOrderEmail(orderData: OrderEmailData, isUpdate = false): Promise<boolean> {
    try {
      // Έλεγχος αν υπάρχει email πελάτη
      if (!orderData.customerEmail || !orderData.customerEmail.includes("@")) {
        console.warn("Δεν υπάρχει έγκυρο email πελάτη για αποστολή")
        return false
      }

      // Φόρτωση EmailJS
      await this.loadEmailJS()

      // Δημιουργία PDF
      const pdfBlob = await PdfService.generateOrderPdf(orderData)

      // Μετατροπή του PDF σε base64
      const pdfBase64 = await this.blobToBase64(pdfBlob)

      // Προετοιμασία δεδομένων email
      const emailParams = {
        to_email: orderData.customerEmail,
        to_name: orderData.customer,
        subject: `${isUpdate ? "Μεταβολή - Επεξεργασία" : ""} Παραγγελία Νο ${orderData.id} - Κρεοπωλείο "Το Μπέλλες"`,
        order_id: orderData.id,
        customer_name: orderData.customer,
        order_html: this.generateOrderEmailHTML(orderData, isUpdate),
        company_name: "ΤΟ ΜΠΕΛΛΕΣ - Κρεοπωλείο",
        company_phone: "2310-123456",
        company_email: "info@tobelles.gr",
        order_total: `€${orderData.total.toFixed(2)}`,
        delivery_date: new Date(orderData.deliveryDate).toLocaleDateString("el-GR"),
        order_status: orderData.status,
        pdf_attachment: pdfBase64,
        pdf_name: `Παραγγελία_${orderData.id}.pdf`,
      }

      // Αποστολή email
      // @ts-ignore
      const result = await window.emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.templateId, emailParams)

      console.log("Email στάλθηκε επιτυχώς:", result)
      return true
    } catch (error) {
      console.error("Σφάλμα κατά την αποστολή email:", error)
      return false
    }
  }

  // Μετατροπή Blob σε base64
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64data = reader.result as string
        // Αφαίρεση του prefix "data:application/pdf;base64," για να μείνει μόνο το base64 string
        const base64Content = base64data.split(",")[1]
        resolve(base64Content)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // Έλεγχος αν το EmailJS είναι διαμορφωμένο
  public static isConfigured(): boolean {
    return (
      EMAIL_CONFIG.serviceId !== "your_service_id" &&
      EMAIL_CONFIG.templateId !== "your_template_id" &&
      EMAIL_CONFIG.publicKey !== "your_public_key"
    )
  }

  // Εμφάνιση οδηγιών διαμόρφωσης
  public static getSetupInstructions(): string {
    return `
      Για να ενεργοποιήσετε την αποστολή emails:
      
      1. Δημιουργήστε λογαριασμό στο https://www.emailjs.com/
      2. Δημιουργήστε ένα Email Service (Gmail, Outlook, κλπ.)
      3. Δημιουργήστε ένα Email Template
      4. Αντικαταστήστε τα στοιχεία στο αρχείο services/email-service.tsx:
         - serviceId: Το ID του service σας
         - templateId: Το ID του template σας  
         - publicKey: Το public key σας
      
      Το template θα πρέπει να περιέχει τις μεταβλητές:
      {{to_email}}, {{to_name}}, {{subject}}, {{order_html}}, {{pdf_attachment}}, {{pdf_name}}, κλπ.
      
      Για να συμπεριλάβετε το PDF ως συνημμένο στο template σας, προσθέστε:
      <input type="hidden" name="pdf_attachment" value="{{pdf_attachment}}">
      <input type="hidden" name="pdf_name" value="{{pdf_name}}">
    `
  }
}

// Hook για χρήση του email service
export function useEmailService() {
  const sendOrderEmail = async (orderData: OrderEmailData, isUpdate = false) => {
    if (!EmailService.isConfigured()) {
      console.warn("EmailJS δεν είναι διαμορφωμένο")
      console.log(EmailService.getSetupInstructions())
      return false
    }

    return await EmailService.sendOrderEmail(orderData, isUpdate)
  }

  return {
    sendOrderEmail,
    isConfigured: EmailService.isConfigured(),
    setupInstructions: EmailService.getSetupInstructions(),
  }
}
