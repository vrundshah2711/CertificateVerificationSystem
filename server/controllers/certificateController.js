const Certificate = require("../models/Certificate");
const puppeteer = require("puppeteer");

function formatDate(d) {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toDateString();
}

function certificateHtml(cert) {
  const studentName = cert.studentName || "";
  const domain = cert.domain || "";
  const certificateId = cert.certificateId || "";
  const startDate = formatDate(cert.startDate);
  const endDate = formatDate(cert.endDate);
  const issuedAt = formatDate(cert.issuedAt);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Certificate ${certificateId}</title>
    <style>
      @page { size: A4 landscape; margin: 14mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        color: #0f172a;
        background: #ffffff;
      }
      .sheet {
        width: 100%;
        height: 100%;
        padding: 10px;
        border-radius: 24px;
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.22), rgba(16, 185, 129, 0.18));
      }
      .frame {
        width: 100%;
        height: 100%;
        border-radius: 18px;
        border: 1px solid rgba(15, 23, 42, 0.10);
        padding: 28px 30px;
        background:
          radial-gradient(1100px 420px at 18% 0%, rgba(37, 99, 235, 0.10), transparent 60%),
          radial-gradient(900px 420px at 82% 100%, rgba(16, 185, 129, 0.10), transparent 60%),
          #fff;
        position: relative;
        overflow: hidden;
      }
      .frame::before {
        content: "";
        position: absolute;
        inset: -40px;
        background:
          radial-gradient(closest-side, rgba(15, 23, 42, 0.06), transparent 70%),
          radial-gradient(closest-side, rgba(15, 23, 42, 0.04), transparent 70%);
        filter: blur(10px);
        opacity: 0.45;
        pointer-events: none;
      }
      .frame::after {
        content: "VERIFIED";
        position: absolute;
        right: 34px;
        bottom: 24px;
        font-size: 64px;
        font-weight: 900;
        letter-spacing: 0.18em;
        color: rgba(15, 23, 42, 0.06);
        transform: rotate(-8deg);
        pointer-events: none;
      }
      .header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .logo {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(16, 185, 129, 0.95));
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
      }
      .brand {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .brand .org {
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        font-size: 12px;
        color: rgba(15, 23, 42, 0.65);
      }
      .brand .title {
        font-size: 36px;
        font-weight: 900;
        letter-spacing: -0.02em;
        margin: 0;
      }
      .badge {
        position: relative;
        border: 1px solid rgba(15, 23, 42, 0.12);
        border-radius: 999px;
        padding: 10px 14px;
        font-size: 12px;
        color: rgba(15, 23, 42, 0.75);
        background: rgba(255,255,255,0.82);
      }
      .content {
        position: relative;
        margin-top: 26px;
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 22px;
      }
      .main {
        border-radius: 16px;
        border: 1px solid rgba(15, 23, 42, 0.10);
        padding: 22px 24px;
        background: rgba(255,255,255,0.82);
      }
      .label { font-size: 12px; color: rgba(15, 23, 42, 0.65); letter-spacing: 0.08em; text-transform: uppercase; }
      .name { margin: 10px 0 0; font-size: 44px; font-weight: 900; letter-spacing: -0.02em; }
      .desc { margin: 12px 0 0; font-size: 16px; line-height: 1.55; color: rgba(15,23,42,0.82); }
      .meta {
        border-radius: 16px;
        border: 1px solid rgba(15, 23, 42, 0.10);
        padding: 18px;
        background: rgba(255,255,255,0.82);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .row { display: flex; flex-direction: column; gap: 6px; }
      .value { font-size: 14px; font-weight: 700; color: rgba(15, 23, 42, 0.92); word-break: break-word; }
      .footer {
        position: relative;
        margin-top: 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        color: rgba(15, 23, 42, 0.65);
        font-size: 12px;
      }
      .sig {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }
      .sig .line {
        width: 220px;
        height: 1px;
        background: rgba(15, 23, 42, 0.20);
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="frame">
        <div class="header">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="logo"></div>
            <div class="brand">
              <div class="org">Certificate Verification System</div>
              <h1 class="title">Certificate of Completion</h1>
            </div>
          </div>
          <div class="badge">Certificate ID: <strong>${certificateId}</strong></div>
        </div>

        <div class="content">
          <div class="main">
            <div class="label">This certificate is proudly presented to</div>
            <div class="name">${studentName}</div>
            <div class="desc">
              for successfully completing the <strong>${domain}</strong> program
              from <strong>${startDate}</strong> to <strong>${endDate}</strong>.
            </div>
          </div>

          <div class="meta">
            <div class="row">
              <div class="label">Issued on</div>
              <div class="value">${issuedAt}</div>
            </div>
            <div class="row">
              <div class="label">Verification</div>
              <div class="value">Verified via secure database lookup</div>
            </div>
            <div class="row">
              <div class="label">Certificate ID</div>
              <div class="value">${certificateId}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div>To verify: search by Certificate ID in the portal.</div>
          <div class="sig">
            <div class="line"></div>
            <div>Authorized Signature</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

// ✅ Add Certificate
exports.addCertificate = async (req, res) => {
  try {
    const cert = new Certificate(req.body);
    await cert.save();
    res.status(201).json(cert);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Get Certificate by ID
exports.getCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      certificateId: req.params.id
    });

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json(cert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Download Certificate PDF by ID
exports.getCertificatePdf = async (req, res) => {
  let browser;
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.id }).lean();
    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(certificateHtml(cert), { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      printBackground: true,
      format: "A4",
      landscape: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${String(cert.certificateId).replace(/[^a-zA-Z0-9_-]/g, "")}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate PDF", error: error.message });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
};