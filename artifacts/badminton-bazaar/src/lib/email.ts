import emailjs from "@emailjs/browser";

/**
 * EmailJS configuration — set these env vars in the Replit Secrets panel:
 *   VITE_EMAILJS_SERVICE_ID   — EmailJS "Service ID" (e.g. service_xxxxxxx)
 *   VITE_EMAILJS_TEMPLATE_ID  — EmailJS "Template ID" (e.g. template_xxxxxxx)
 *   VITE_EMAILJS_PUBLIC_KEY   — EmailJS "Public Key" from Account → General
 *
 * If any of the three are missing the function logs a warning and skips the
 * send, so the checkout still works even before EmailJS is configured.
 */
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "";
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "";
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? "";

export interface OrderEmailParams {
  founderEmail: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  additionalContact: string;
  paymentReference: string;
  /** base64 data-URL of the uploaded payment screenshot */
  paymentProof: string;
  items: { name: string; brand: string; price: number; quantity: number }[];
  total: number;
  createdAt: string;
}

function money(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export async function sendOrderEmail(params: OrderEmailParams): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn(
      "[Badminton Bazaar] EmailJS not configured — email skipped.\n" +
        "Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY."
    );
    return;
  }

  const itemsHtml = params.items
    .map(
      (item) =>
        `• ${item.brand} ${item.name} × ${item.quantity}  —  ${money(item.price * item.quantity)}`
    )
    .join("\n");

  const orderDate = new Date(params.createdAt).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      /* ── Recipient ── */
      to_email: params.founderEmail,

      /* ── Invoice header ── */
      order_id: params.orderId,
      order_date: orderDate,

      /* ── Customer details ── */
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
      customer_address: params.customerAddress,
      additional_contact: params.additionalContact || "—",

      /* ── Payment ── */
      payment_reference: params.paymentReference,
      order_total: money(params.total),

      /* ── Order lines ── */
      items_list: itemsHtml,

      /* ── Proof image (base64 data-URL — embed as <img src="{{payment_proof}}"> in template) ── */
      payment_proof: params.paymentProof,
    },
    PUBLIC_KEY
  );
}
