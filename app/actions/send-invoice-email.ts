"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvoiceEmailProps {
  customerName: string;
  customerEmail: string;
  invoiceId: string;
  date: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
}

export async function sendInvoiceEmail({
  customerName,
  customerEmail,
  invoiceId,
  date,
  items,
  total,
}: SendInvoiceEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Invoice App <onboarding@resend.dev>", // Default Resend testing domain
      to: [customerEmail],
      subject: `Invoice #${invoiceId} from Invoice App`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Invoice #${invoiceId}</h1>
          <p>Hi ${customerName},</p>
          <p>Here is your invoice for the recent services.</p>
          
          <div style="margin: 20px 0; border: 1px solid #eaeaea; border-radius: 5px; padding: 20px;">
            <p><strong>Date:</strong> ${date}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="border-bottom: 1px solid #eaeaea; text-align: left;">
                  <th style="padding: 10px 0;">Item</th>
                  <th style="padding: 10px 0; text-align: right;">Qty</th>
                  <th style="padding: 10px 0; text-align: right;">Price</th>
                  <th style="padding: 10px 0; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (item) => `
                  <tr style="border-bottom: 1px solid #eaeaea;">
                    <td style="padding: 10px 0;">${item.name}</td>
                    <td style="padding: 10px 0; text-align: right;">${item.qty}</td>
                    <td style="padding: 10px 0; text-align: right;">$${item.price.toFixed(
                      2
                    )}</td>
                    <td style="padding: 10px 0; text-align: right;">$${(
                      item.qty * item.price
                    ).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 10px 0; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold;">$${total.toFixed(
                    2
                  )}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p>Thank you for your business!</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Server action error:", error);
    return { success: false, error: "Failed to send email" };
  }
}
