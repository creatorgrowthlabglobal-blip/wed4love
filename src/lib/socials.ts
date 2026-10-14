// Central config for social and WhatsApp links.
// TODO: swap placeholders with real URLs. WHATSAPP_NUMBER must be international format, digits only (e.g. "34600123456").
export const WHATSAPP_NUMBER = "";
export const WHATSAPP_PREFILL = "Hi Wed4Love! I have a question about my wedding invitation.";

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/wed4love_official",
  pinterest: "#",
  facebook:  "#",
  tiktok:    "#",
};

export const whatsappHref = () => {
  if (!WHATSAPP_NUMBER) return "";
  const text = encodeURIComponent(WHATSAPP_PREFILL);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
};
