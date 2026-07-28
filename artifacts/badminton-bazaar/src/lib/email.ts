/**
 * Email via formsubmit.co — no API keys required.
 *
 * Set one env var in the Replit Secrets panel:
 *   VITE_FOUNDER_EMAIL  — the email address that receives order notifications
 *                         (e.g. yourname@gmail.com).
 *
 * First-time setup: formsubmit.co sends a one-time activation email to
 * VITE_FOUNDER_EMAIL on the very first order. Click the link in that email,
 * then all future orders and status updates are delivered automatically.
 *
 * Customer status emails (approved / rejected) are CC'd to the customer so
 * both you and the customer receive the update — and only your email needs
 * the one-time activation.
 */
const FOUNDER_EMAIL = import.meta.env.VITE_FOUNDER_EMAIL || "aviiboi77@gmail.com";

function money(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

async function formPost(
  toEmail: string,
  payload: Record<string, string>
): Promise<void> {
  const res = await fetch(
    `https://formsubmit.co/ajax/${toEmail}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _captcha: "false",
        _template: "table",
        ...payload,
      }),
    }
  );
  if (!res.ok) throw new Error(`formsubmit.co HTTP ${res.status}`);
  const data = await res.json();
  if (data.success !== "true") throw new Error(`formsubmit.co: ${data.message}`);
}

/* ─── Types ─────────────────────────────────────────────────── */

export interface OrderEmailParams {
  founderEmail: string; // kept for interface compatibility — uses VITE_FOUNDER_EMAIL
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  additionalContact: string;
  paymentReference: string;
  /** base64 data-URL — NOT sent (formsubmit.co doesn't support inline images) */
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

/* ─── New-order notification → founder ──────────────────────── */

export async function sendOrderEmail(params: OrderEmailParams): Promise<void> {
  const target = FOUNDER_EMAIL || params.founderEmail;
  if (!target) {
    console.warn(
      "[Badminton Bazaar] VITE_FOUNDER_EMAIL not set — order email skipped.\n" +
        "Add it in the Replit Secrets panel."
    );
    return;
  }

  const orderDate = new Date(params.createdAt).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const itemLines = params.items
    .map(
      (i) =>
        `${i.brand} ${i.name} × ${i.quantity}  →  ${money(i.price * i.quantity)}`
    )
    .join("\n");

  await formPost(target, {
    _subject: `🛒 New Order #${params.orderId} — Badminton Bazaar`,
    _replyto: params.customerEmail,
    // CC the customer so they also receive the order confirmation
    _cc: params.customerEmail,

    "Order ID": params.orderId,
    "Order Date": orderDate,
    "Customer Name": params.customerName,
    "Customer Email": params.customerEmail,
    "Phone": params.customerPhone,
    "Address": params.customerAddress,
    "Additional Contact": params.additionalContact || "—",
    "Payment Reference": params.paymentReference,
    "Items Ordered": itemLines,
    "Order Total": money(params.total),
    "Status": "PENDING — please review in your admin panel",
  });
}

/* ─── Status update (approved / rejected) → founder + customer CC ── */

export async function sendStatusEmail(params: StatusEmailParams): Promise<void> {
  const target = FOUNDER_EMAIL;
  if (!target) {
    console.warn(
      "[Badminton Bazaar] VITE_FOUNDER_EMAIL not set — status email skipped."
    );
    return;
  }

  const statusLabel =
    params.status === "approved" ? "✅ APPROVED" : "❌ REJECTED";

  const itemLines = params.items
    .map(
      (i) =>
        `${i.brand} ${i.name} × ${i.quantity}  →  ${money(i.price * i.quantity)}`
    )
    .join("\n");

  const messageLabel =
    params.status === "approved" ? "Estimated Delivery" : "Reason";

  await formPost(target, {
    _subject: `Order #${params.orderId} ${statusLabel} — Badminton Bazaar`,
    // CC the customer so they receive the same email
    _cc: params.customerEmail,

    "Order Status": statusLabel,
    "Order ID": params.orderId,
    "Customer Name": params.customerName,
    "Customer Email": params.customerEmail,
    [messageLabel]: params.statusMessage,
    "Items": itemLines,
    "Order Total": money(params.total),
  });
}
