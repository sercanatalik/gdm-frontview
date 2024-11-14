'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from 'framer-motion'; // <--- Added import

export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // <--- Added state and useEffect dependency

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
  }, [router, loading]); // <--- Added dependency on loading state
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
  <Card className="w-[300px] h-[300px] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="loader-container">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    <motion.h2
      className="text-2xl font-semibold text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
      Loading...
    </motion.h2>
    <p className="text-muted-foreground">Please wait while we prepare your content</p>
  </Card>
    </div>
  );
}
