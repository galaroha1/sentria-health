import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

const variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
};

export const PageTransition = ({ children }: PageTransitionProps) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};
