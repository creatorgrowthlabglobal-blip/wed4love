import { motion } from "framer-motion";
import { whatsappHref } from "@/lib/socials";

const WHATSAPP_GREEN = "#25D366";
const WHATSAPP_GREEN_DARK = "#128C7E";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
    <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.015-.53-.015-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.26 2.922 1.5 1.818 3.397 3.11 5.572 3.712.472.13.945.187 1.418.187.746 0 1.49-.1 2.192-.3.59-.173.918-.645 1.03-1.26.1-.516.1-.73.1-.788 0-.158-.1-.187-.56-.4-.4-.144-1.418-.6-2.133-.95a.47.47 0 0 0-.42-.1zM16.013 2.72c-7.344 0-13.286 5.942-13.286 13.286 0 2.407.645 4.728 1.864 6.76L2.73 29.282l6.65-1.743a13.316 13.316 0 0 0 6.633 1.75c7.343 0 13.285-5.942 13.285-13.285S23.356 2.72 16.013 2.72zm0 24.277c-2.077 0-4.097-.558-5.858-1.618l-.42-.244-4.364 1.145 1.17-4.253-.272-.44A11.015 11.015 0 0 1 4.74 16c0-6.247 5.025-11.273 11.273-11.273S27.286 9.753 27.286 16s-5.025 10.997-11.273 10.997z"/>
  </svg>
);

const WhatsAppFab = () => {
  const href = whatsappHref();
  if (!href) return null; // hide until WHATSAPP_NUMBER is configured

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed z-[60] bottom-5 right-5 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-full flex items-center justify-center transition-transform active:scale-95"
      style={{
        background: `linear-gradient(135deg, ${WHATSAPP_GREEN} 0%, ${WHATSAPP_GREEN_DARK} 100%)`,
        color: "white",
        boxShadow: "0 12px 32px rgba(37, 211, 102, 0.5), 0 4px 12px rgba(0,0,0,0.15)",
      }}
      whileHover={{ scale: 1.08 }}
    >
      {/* Pulse ring */}
      <span
        className="absolute inset-0 rounded-full animate-ping"
        style={{ background: WHATSAPP_GREEN, opacity: 0.35 }}
        aria-hidden
      />
      <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 relative" />
    </motion.a>
  );
};

export default WhatsAppFab;
