import { getDb, saveDb, cuid, nowIso } from "./db";
import { normalizePhone } from "./utils";

export async function sendSms(opts: {
  to: string;
  body: string;
  orderId?: string;
  userId?: string;
}) {
  const to = normalizePhone(opts.to);
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  let status = "logged";
  let providerId: string | undefined;

  if (sid && token && from) {
    try {
      const twilio = (await import("twilio")).default;
      const client = twilio(sid, token);
      const msg = await client.messages.create({ to, from, body: opts.body });
      status = msg.status || "sent";
      providerId = msg.sid;
    } catch (err) {
      console.error("Twilio SMS failed", err);
      status = "failed";
    }
  } else {
    console.log(`[SMS DEV] to=${to} body=${opts.body}`);
  }

  const row = {
    id: cuid(),
    toPhone: to,
    body: opts.body,
    status,
    providerId: providerId || null,
    orderId: opts.orderId || null,
    userId: opts.userId || null,
    createdAt: nowIso(),
  };
  getDb().smsLogs.push(row);
  saveDb(true);
  return row;
}

export function orderStatusMessage(
  orderNumber: string,
  status: string,
  totalLabel?: string
) {
  const base = `Prime Fusion order ${orderNumber}`;
  switch (status) {
    case "PAID":
    case "RECEIVED":
      return `${base} is in. We are firing up the grill — bold flavor on the way.`;
    case "PREPARING":
      return `${base} is cooking now. Almost ready for you.`;
    case "READY":
      return `${base} is ready for pickup at the truck window. Come get it while it is hot.`;
    case "COMPLETED":
      return `${base} is complete. Thank you for choosing Prime Fusion.${
        totalLabel ? ` Receipt total: ${totalLabel}.` : ""
      }`;
    case "CANCELLED":
      return `${base} was cancelled. Message us if you need help.`;
    default:
      return `${base} update: ${status.replace(/_/g, " ")}`;
  }
}
