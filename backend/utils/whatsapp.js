// backend/utils/whatsapp.js
export async function sendWhatsAppMessage(to, templateName) {
  const url = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: to, // must be in international format e.g. 233XXXXXXXXX
    type: "template",
    template: {
      name: templateName, // e.g. "hello_world" for now
      language: { code: "en_US" }
    }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log("📨 WhatsApp API response:", data);
    return data;
  } catch (err) {
    console.error("❌ WhatsApp send error:", err);
    return null;
  }
}
