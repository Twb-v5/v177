import { motion } from "framer-motion";
import { VIRTUES } from "./quranData";

export function VirtuesSection() {
  return (
    <div className="flex flex-col gap-2">
      {VIRTUES.map((v, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-start gap-3 p-3.5 rounded-xl"
          style={{ background: "rgba(200,168,75,0.06)", border: "1px solid rgba(200,168,75,0.15)" }}
        >
          <span className="text-[20px] shrink-0 leading-none mt-0.5">{v.icon}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-relaxed text-right">«{v.text}»</p>
            <p className="text-[10px] mt-1" style={{ color: "rgba(200,168,75,0.65)" }}>
              رواه {v.source}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
