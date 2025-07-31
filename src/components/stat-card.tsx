'use client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const StatCard = ({ title, value, subtitle, icon: Icon, gradient, delay = 0 }: { title: string; value: string | number; subtitle: string; icon: any; gradient: string; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      <Card className={`relative overflow-hidden border-0 shadow-lg ${gradient} text-white`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-white/80 text-sm font-medium">{title}</p>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + 0.3, type: 'spring', stiffness: 200 }} className="text-3xl font-bold">
                {value}
              </motion.div>
              <p className="text-white/70 text-xs">{subtitle}</p>
            </div>
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.5 }}
              className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full blur-lg" />
        </CardContent>
      </Card>
    </motion.div>
  );
};
