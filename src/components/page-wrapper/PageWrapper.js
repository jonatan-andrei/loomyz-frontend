import { motion } from "framer-motion";
import { useRef } from "react";

export default function PageWrapper({ children }) {
  const firstRender = useRef(true);

  return (
    <motion.div
      initial={firstRender.current ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={() => {
        firstRender.current = false;
      }}
    >
      <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white min-h-screen flex flex-col">
        <header className="p-4">
          <a
            href="/choose-activity-type"
            className="text-xl font-bold text-white hover:text-yellow-300 transition"
          >
            Loomyz
          </a>
        </header>
        {children}
      </div>
    </motion.div>
  );
}
