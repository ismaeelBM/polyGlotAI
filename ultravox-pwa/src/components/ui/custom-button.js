import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const CustomButton = forwardRef(({
  className,
  variant = "default",
  size = "default",
  isLoading = false,
  disabled,
  children,
  ...props
}, ref) => {
  const variants = {
    default: "bg-white text-[#121212] hover:bg-white/90",
    outline: "bg-transparent border border-white/30 text-white hover:bg-white/10",
    ghost: "bg-transparent text-white hover:bg-white/10",
  };

  const sizes = {
    default: "py-3 px-6",
    sm: "py-2 px-4 text-sm",
    lg: "py-4 px-8 text-lg",
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-1",
        variants[variant],
        sizes[size],
        (isLoading || disabled) && "opacity-70 cursor-not-allowed",
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
});

CustomButton.displayName = "CustomButton";

export default CustomButton; 