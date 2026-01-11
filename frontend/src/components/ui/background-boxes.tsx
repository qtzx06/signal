"use client";
import React from "react";
import { motion } from "motion/react";

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = new Array(150).fill(1);
  const cols = new Array(100).fill(1);
  const borderColor = '#e5e7eb';

  return (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
        position: 'absolute',
        top: '-25%',
        left: '25%',
        zIndex: 0,
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: '16px',
      }}
      className={className}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div
          key={`row` + i}
          style={{
            position: 'relative',
            height: '32px',
            width: '64px',
            borderLeft: `1px solid ${borderColor}`,
          }}
        >
          {cols.map((_, j) => (
            <motion.div
              whileHover={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              key={`col` + j}
              style={{
                position: 'relative',
                height: '32px',
                width: '64px',
                borderTop: `1px solid ${borderColor}`,
                borderRight: `1px solid ${borderColor}`,
                backgroundColor: '#fff',
              }}
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke={borderColor}
                  style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: '-14px',
                    left: '-22px',
                    height: '24px',
                    width: '40px',
                    strokeWidth: '1px',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
