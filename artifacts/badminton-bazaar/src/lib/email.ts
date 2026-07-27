import emailjs from "@emailjs/browser";

/**
 * EmailJS configuration — set these env vars in the Replit Secrets panel:
 *   VITE_EMAILJS_SERVICE_ID          — EmailJS "Service ID" (e.g. service_xxxxxxx)
 *   VITE_EMAILJS_TEMPLATE_ID         — EmailJS template for NEW ORDER notifications to founder
 *   VITE_EMAILJS_PUBLIC_KEY          — EmailJS "Public Key" from Account → General
 *   VITE_EMAILJS_CUSTOMER_TEMPLATE_ID — (optional) separate template for customer status emails
 *                                        Falls back to VITE_EMAILJS_TEMPLATE_ID if not set.
 *
 * Both templates should support a {{to_email}} variable as the recipient.
 * In the EmailJS template editor, set "To Email" field to {{to_email}}.
 *
 * If any of the required three are missing the function logs a warning and skips
 * the send, so the app still works even before EmailJS is fully configured.
 */
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "";
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "";
const CUSTOMER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID || TEMPLATE_ID;
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

export interface StatusEmailParams {
  customerEmail: string;
  customerName: string;
  orderId: string;
  status: "approved" | "rejected";
  /** Delivery date for approvals; rejection reason for rejections */
  statusMessage: string;
  items: { name: string; brand: string; price: number; quantity: number }[];
  total: number;
}

function money(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

/** Send new-order notification to the founder/admin. */
export async function sendOrderEmail(params: OrderEmailParams): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn(
      "[Badminton Bazaar] EmailJS not configured — founder email skipped.\n" +
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

/**
 * Send order status update (approved / rejected) directly to the customer.
 * Uses VITE_EMAILJS_CUSTOMER_TEMPLATE_ID (falls back to VITE_EMAILJS_TEMPLATE_ID).
 *
 * Required template variables:
 *   {{to_email}}      — customer's email (set as "To Email" in the template)
 *   {{customer_name}} — customer's name
 *   {{order_id}}      — invoice number
 *   {{order_status}}  — "APPROVED ✓" or "REJECTED"
 *   {{status_message}}— delivery date (approved) or rejection reason (rejected)
 *   {{items_list}}    — line-by-line order items
 *   {{order_total}}   — formatted total
 */
export async function sendStatusEmail(params: StatusEmailParams): Promise<void> {
  if (!SERVICE_ID || !CUSTOMER_TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn(
      "[Badminton Bazaar] EmailJS not configured — customer status email skipped."
    );
    return;
  }

  const itemsText = params.items
    .map(
      (item) =>
        `• ${item.brand} ${item.name} × ${item.quantity} — ${money(item.price * item.quantity)}`
    )
    .join("\n");

  const statusLabel = params.status === "approved" ? "APPROVED ✓" : "REJECTED ✗";

  await emailjs.send(
    SERVICE_ID,
    CUSTOMER_TEMPLATE_ID,
    {
      to_email: params.customerEmail,
      customer_name: params.customerName,
      order_id: params.orderId,
      order_status: statusLabel,
      status_message: params.statusMessage,
      items_list: itemsText,
      order_total: money(params.total),
    },
    PUBLIC_KEY
  );
}
