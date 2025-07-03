import { motion } from "framer-motion";

export default function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}     // estado inicial (antes de aparecer)
      animate={{ opacity: 1, y: 0 }}      // animação ao aparecer
      exit={{ opacity: 0, y: -20 }}       // animação ao sair
      transition={{ duration: 0.3 }}      // duração da transição
    >
      {children}
    </motion.div>
  );
}
