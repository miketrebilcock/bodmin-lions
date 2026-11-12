// Cloudflare Worker for bodminlions.org.uk.
// Hugo's ./public folder is served as static assets (free, never runs this code). Only /api/* reaches this
// Worker (see "run_worker_first" in wrangler.jsonc), which handles the online grant application form
// (/funding/apply/) and emails it to the club with Cloudflare Email Routing's send_email binding.
//
// Setup (Cloudflare dashboard, domain added to Cloudflare):
//   1. Email → Email Routing → enable it, and add bodmin.lions@outlook.com as a destination address
//      (Cloudflare emails it a link — click it to verify). The Worker can only send to verified addresses.
//   2. GRANT_FROM in wrangler.jsonc must be an address on that domain (it doesn't need a mailbox).
//
// Nothing is stored: the application exists only in the email.

const FIELDS = [
  // [form name, label, required, max length]
  ["name", "Name", true, 120],
  ["organisation", "Group or organisation", false, 160],
  ["address", "Address", true, 400],
  ["postcode", "Postcode", true, 10],
  ["email", "Email", true, 200],
  ["phone", "Telephone", false, 30],
  ["mobile", "Mobile", false, 30],
  ["purpose", "Purpose of support", true, 5000],
  ["total_cost", "Total cost (£, inc. VAT)", true, 20],
  ["amount_requested", "Lions funding requested (£)", true, 20],
  ["fundraising_done", "Done any fundraising / asked others?", true, 3],
  ["fundraising", "Fundraising details", true, 3000],
  ["funds_raised", "Funds raised so far (£)", false, 20],
  ["interests", "Personal interests (trustees)", false, 1000],
  ["further", "Further information", false, 3000],
  ["consent_data", "Agrees to use of data", true, 3],
  ["consent_publicity", "Agrees to publicity if successful", false, 3],
  ["accept", "Accepts requirements", true, 3],
  ["signature", "Signed (typed name)", true, 120],
];

const SECTIONS = [
  ["1. Applicant details", ["name", "organisation", "address", "postcode", "email", "phone", "mobile"]],
  ["2. Purpose of support", ["purpose", "total_cost", "amount_requested"]],
  ["3. Additional information", ["fundraising_done", "fundraising", "funds_raised", "interests", "further"]],
  ["4–6. Consent and acceptance", ["consent_data", "consent_publicity", "accept", "signature"]],
];

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/grant-request") {
      if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
      return grantRequest(request, env, url);
    }
    if (url.pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};

async function grantRequest(request, env, url) {
  const go = (path) => Response.redirect(new URL(path, url.origin).toString(), 303);

  // Only accept posts from our own form.
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) return new Response("Forbidden", { status: 403 });
  if (Number(request.headers.get("Content-Length") || 0) > 100_000) return go("/funding/problem/");

  let form;
  try {
    form = await request.formData();
  } catch {
    return go("/funding/problem/");
  }

  // Honeypot filled in: almost certainly a bot. Pretend it worked so it doesn't try again.
  if ((form.get("website") || "").toString().trim() !== "") return go("/funding/thanks/");

  const data = {};
  for (const [key, , required, max] of FIELDS) {
    const value = (form.get(key) || "").toString().replace(/\r\n?/g, "\n").trim();
    if (value.length > max || (required && !value)) return go("/funding/problem/");
    data[key] = value;
  }
  if (!EMAIL_RE.test(data.email) || !["Yes", "No"].includes(data.fundraising_done)) {
    return go("/funding/problem/");
  }
  data.consent_publicity ||= "No";

  const received = new Date().toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "long", timeStyle: "short" });
  const who = data.organisation ? `${data.organisation} (${data.name})` : data.name;
  const subject = `Grant application: ${oneLine(who)} – £${oneLine(data.amount_requested)}`.slice(0, 200);

  try {
    // The binding (wrangler.jsonc) only allows GRANT_TO, which must be verified in Email Routing.
    await env.EMAIL.send({
      to: env.GRANT_TO,
      from: { email: env.GRANT_FROM, name: "Bodmin Lions website" },
      replyTo: data.email,
      subject,
      text: toText(data, received),
      html: toHtml(data, received),
    });
  } catch (err) {
    console.error("grant-request: send failed", err?.code, err?.message);
    return go("/funding/problem/");
  }
  return go("/funding/thanks/");
}

const label = Object.fromEntries(FIELDS.map(([k, l]) => [k, l]));
const oneLine = (s) => s.replace(/\s+/g, " ").trim();
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function toText(data, received) {
  let out = `Grant application received from the website on ${received}.\nReply to this email to contact the applicant.\n`;
  for (const [title, keys] of SECTIONS) {
    out += `\n== ${title} ==\n`;
    for (const k of keys) out += `${label[k]}: ${data[k] || "—"}\n`;
  }
  return out;
}

function toHtml(data, received) {
  let out = `<p>Grant application received from the website on ${esc(received)}.<br>Reply to this email to contact the applicant.</p>`;
  for (const [title, keys] of SECTIONS) {
    out += `<h2 style="font-size:16px;margin:20px 0 6px">${esc(title)}</h2><table cellpadding="6" style="border-collapse:collapse;width:100%">`;
    for (const k of keys) {
      const v = data[k] ? esc(data[k]).replace(/\n/g, "<br>") : "—";
      out += `<tr><th align="left" valign="top" style="border:1px solid #ccc;width:35%;background:#f4f6fa">${esc(label[k])}</th><td style="border:1px solid #ccc">${v}</td></tr>`;
    }
    out += "</table>";
  }
  return out;
}
