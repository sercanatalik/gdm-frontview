'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"


export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (response.ok) {
          router.push('/login');
        } else {
          console.error('Logout failed');
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };

    performLogout();
  }, [router]);

  return  <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
  <Card className="w-[300px] h-[300px] flex flex-col items-center justify-center space-y-4 text-center">
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </motion.div>
    <motion.h2
      className="text-2xl font-semibold text-primary"
      animate={{
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      Loading...
    </motion.h2>
    <p className="text-muted-foreground">Please wait while we prepare your content</p>
  </Card>
</div>;
}
