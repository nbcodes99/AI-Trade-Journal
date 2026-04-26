// "use client";

// import { JSX, useEffect, useState } from "react";
// import { motion } from "framer-motion";

// const ICONS = [
//   (props: any) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none">
//       <rect
//         x="9"
//         y="6"
//         width="6"
//         height="12"
//         rx="1"
//         fill="currentColor"
//         opacity="0.8"
//       />
//       <line
//         x1="12"
//         y1="2"
//         x2="12"
//         y2="6"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//       />
//       <line
//         x1="12"
//         y1="18"
//         x2="12"
//         y2="22"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//       />
//     </svg>
//   ),
//   (props: any) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none">
//       <rect
//         x="9"
//         y="6"
//         width="6"
//         height="12"
//         rx="1"
//         fill="currentColor"
//         opacity="0.5"
//       />
//       <line
//         x1="12"
//         y1="1"
//         x2="12"
//         y2="6"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//       />
//       <line
//         x1="12"
//         y1="18"
//         x2="12"
//         y2="23"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//       />
//     </svg>
//   ),
//   (props: any) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none">
//       <polyline
//         points="2,18 7,10 12,14 17,6 22,8"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         opacity="0.9"
//       />
//       <circle cx="22" cy="8" r="1.5" fill="currentColor" />
//     </svg>
//   ),
//   (props: any) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none">
//       <circle
//         cx="12"
//         cy="12"
//         r="9"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         opacity="0.8"
//       />
//       <text
//         x="12"
//         y="16.5"
//         textAnchor="middle"
//         fontSize="11"
//         fill="currentColor"
//         fontWeight="600"
//       >
//         $
//       </text>
//     </svg>
//   ),
//   (props: any) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none">
//       <rect
//         x="3"
//         y="12"
//         width="4"
//         height="9"
//         rx="0.5"
//         fill="currentColor"
//         opacity="0.7"
//       />
//       <rect
//         x="10"
//         y="6"
//         width="4"
//         height="15"
//         rx="0.5"
//         fill="currentColor"
//         opacity="0.9"
//       />
//       <rect
//         x="17"
//         y="9"
//         width="4"
//         height="12"
//         rx="0.5"
//         fill="currentColor"
//         opacity="0.7"
//       />
//     </svg>
//   ),
//   (props: any) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none">
//       <polyline
//         points="22,7 13.5,15.5 8.5,10.5 2,17"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <polyline
//         points="16,7 22,7 22,13"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   ),
//   (props: any) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none">
//       <path
//         d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.4C16.5 22.15 20 17.25 20 12V6L12 2z"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinejoin="round"
//         opacity="0.8"
//       />
//       <polyline
//         points="8.5,12 11,14.5 15.5,9.5"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   ),
//   (props: any) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none">
//       <circle
//         cx="12"
//         cy="12"
//         r="9"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         opacity="0.4"
//       />
//       <circle
//         cx="12"
//         cy="12"
//         r="5.5"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         opacity="0.7"
//       />
//       <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.9" />
//     </svg>
//   ),
//   (props: any) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none">
//       <line
//         x1="19"
//         y1="5"
//         x2="5"
//         y2="19"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//       />
//       <circle
//         cx="6.5"
//         cy="6.5"
//         r="2.5"
//         stroke="currentColor"
//         strokeWidth="1.5"
//       />
//       <circle
//         cx="17.5"
//         cy="17.5"
//         r="2.5"
//         stroke="currentColor"
//         strokeWidth="1.5"
//       />
//     </svg>
//   ),
//   (props: any) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none">
//       <polygon
//         points="13,2 4.5,13.5 11,13.5 11,22 19.5,10.5 13,10.5"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinejoin="round"
//         fill="currentColor"
//         opacity="0.3"
//       />
//     </svg>
//   ),
//   (props: any) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none">
//       <path
//         d="M9 7h6a3 3 0 010 6H9V7z"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinejoin="round"
//       />
//       <path
//         d="M9 13h6.5a3 3 0 010 6H9V13z"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinejoin="round"
//       />
//       <line
//         x1="9"
//         y1="7"
//         x2="9"
//         y2="19"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//       />
//       <line
//         x1="7"
//         y1="9"
//         x2="7"
//         y2="7"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//       />
//       <line
//         x1="7"
//         y1="17"
//         x2="7"
//         y2="19"
//         stroke="currentColor"
//         strokeWidth="1.5"
//         strokeLinecap="round"
//       />
//     </svg>
//   ),
//   (props: any) => (
//     <svg {...props} viewBox="0 0 24 24" fill="none">
//       <path
//         d="M2,18 C5,14 8,16 11,11 S17,6 22,8 L22,20 L2,20 Z"
//         fill="currentColor"
//         opacity="0.15"
//       />
//       <path
//         d="M2,18 C5,14 8,16 11,11 S17,6 22,8"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//         fill="none"
//       />
//     </svg>
//   ),
// ];

// interface FloatingIcon {
//   id: number;
//   Icon: (props: any) => JSX.Element;
//   x: number;
//   y: number;
//   size: number;
//   duration: number;
//   delay: number;
//   floatX: number;
//   floatY: number;
//   rotation: number;
//   opacity: number;
// }

// function generateIcons(count: number): FloatingIcon[] {
//   return Array.from({ length: count }, (_, i) => ({
//     id: i,
//     Icon: ICONS[i % ICONS.length],
//     x: Math.random() * 100,
//     y: Math.random() * 100,
//     size: 18 + Math.random() * 22,
//     duration: 6 + Math.random() * 8,
//     delay: Math.random() * 5,
//     floatX: (Math.random() - 0.5) * 40,
//     floatY: (Math.random() - 0.5) * 40,
//     rotation: (Math.random() - 0.5) * 20,
//     opacity: 0.04 + Math.random() * 0.08,
//   }));
// }

// interface FloatingIconsProps {
//   count?: number;
//   className?: string;
//   color?: string;
// }

// export function FloatingIcons({
//   count = 20,
//   className = "",
//   color = "hsl(var(--primary))",
// }: FloatingIconsProps) {
//   const [icons, setIcons] = useState<FloatingIcon[]>([]);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setIcons(generateIcons(count));
//     setMounted(true);
//   }, [count]);

//   if (!mounted) return null;

//   return (
//     <div
//       className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
//       aria-hidden="true"
//     >
//       {icons.map((item) => (
//         <motion.div
//           key={item.id}
//           className="absolute"
//           style={{
//             left: `${item.x}%`,
//             top: `${item.y}%`,
//             color,
//             opacity: item.opacity,
//           }}
//           animate={{
//             x: [0, item.floatX, 0, -item.floatX * 0.5, 0],
//             y: [0, item.floatY, -item.floatY * 0.6, item.floatY * 0.3, 0],
//             rotate: [0, item.rotation, 0, -item.rotation * 0.5, 0],
//             opacity: [
//               item.opacity,
//               item.opacity * 2.5,
//               item.opacity,
//               item.opacity * 1.5,
//               item.opacity,
//             ],
//           }}
//           transition={{
//             duration: item.duration,
//             delay: item.delay,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         >
//           <item.Icon
//             style={{
//               width: item.size,
//               height: item.size,
//             }}
//           />
//         </motion.div>
//       ))}
//     </div>
//   );
// }

// "use client";

// import { motion } from "framer-motion";
// import { LuChartCandlestick, LuChartNoAxesCombined } from "react-icons/lu";
// import { FaRobot, FaMagic } from "react-icons/fa";
// import { MdOutlineWaterfallChart } from "react-icons/md";
// import { cn } from "@/lib/utils";

// export default function FloatingIcons() {
//   const shapes = [
//     {
//       type: "icon",
//       icon: <LuChartCandlestick className="text-accent w-10 h-10" />,
//       top: "10%",
//       left: "15%",
//       delay: 0,
//     },
//     {
//       type: "icon",
//       icon: <FaRobot className="text-accent w-10 h-10" />,
//       top: "60%",
//       left: "10%",
//       delay: 0.2,
//     },
//     {
//       type: "icon",
//       icon: <MdOutlineWaterfallChart className="text-accent w-10 h-10" />,
//       top: "15%",
//       left: "70%",
//       delay: 0.2,
//     },
//     {
//       type: "icon",
//       icon: <FaMagic className="text-accent w-8 h-8" />,
//       top: "75%",
//       left: "80%",
//       delay: 0.6,
//     },
//     {
//       type: "icon",
//       icon: <LuChartNoAxesCombined className="text-accent w-8 h-8" />,
//       top: "45%",
//       left: "50%",
//       delay: 0.8,
//     },
//   ];

//   return (
//     <div className="absolute inset-0 z-0 pointer-events-none">
//       {shapes.map((s, i) =>
//         s.type === "icon" ? (
//           <motion.div
//             key={i}
//             className="absolute opacity-40"
//             style={{
//               top: s.top,
//               left: s.left,
//             }}
//             animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
//             transition={{
//               duration: 5,
//               delay: s.delay,
//               repeat: Infinity,
//               repeatType: "loop",
//             }}
//           >
//             {s.icon}
//           </motion.div>
//         ) : (
//           <motion.div
//             key={i}
//             className={cn("absolute border border-accent opacity-30")}
//             style={{
//               top: s.top,
//               left: s.left,
//             }}
//             animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
//             transition={{
//               duration: 5,
//               delay: s.delay,
//               repeat: Infinity,
//               repeatType: "loop",
//             }}
//           />
//         ),
//       )}
//     </div>
//   );
// }
