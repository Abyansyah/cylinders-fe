'use client';

import { motion } from 'framer-motion';
import { Users, CheckCircle, ClipboardCheck, Package } from 'lucide-react';
import type { KPICardsData } from '@/types/dashboard';
import { StatCard } from '@/components/stat-card';

interface KPICardsProps {
  data: KPICardsData;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function KPICards({ data }: KPICardsProps) {
  const kpiItems = [
    {
      title: 'Pelanggan Aktif',
      value: data.total_active_customers,
      icon: Users,
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
      description: 'Total pelanggan yang aktif',
    },
    {
      title: 'Order Selesai',
      value: data.total_completed_orders,
      icon: CheckCircle,
      gradient: 'bg-gradient-to-r from-green-500 to-green-600',
      description: 'Total pesanan yang telah selesai',
    },
    {
      title: 'Audit Selesai',
      value: data.total_completed_audits,
      icon: ClipboardCheck,
      gradient: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      description: 'Total audit yang telah selesai',
    },
    {
      title: 'Tabung di Pelanggan',
      value: data.total_cylinders_at_customer,
      icon: Package,
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
      description: 'Total tabung yang sedang dipinjam',
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {kpiItems.map((item, index) => (
        <motion.div key={index}>
          <StatCard title={item.title} value={item.value} icon={item.icon} subtitle={item.description} gradient={item.gradient} />
        </motion.div>
      ))}
    </motion.div>
  );
}
