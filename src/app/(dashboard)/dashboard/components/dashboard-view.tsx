'use client';

import { motion } from 'framer-motion';
import { KPICards } from './kpi-cards';
import { TopProductsTable } from './top-products-table';
import useSWR from 'swr';
import { getDashboardData } from '@/services/dashboarService';
import { DashboardData } from '@/types/dashboard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardView({ initialData }: { initialData: DashboardData }) {
  const { data: dashboardData, isLoading } = useSWR('/dashboard', getDashboardData, {
    fallbackData: initialData,
  });

  if (isLoading || !dashboardData) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants}>
        <KPICards data={dashboardData.kpi_cards} />
      </motion.div>
      <motion.div variants={itemVariants}>
        <TopProductsTable data={dashboardData.charts.top_products} />
      </motion.div>
    </motion.div>
  );
}
