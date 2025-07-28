import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, User, Warehouse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import type { OrderHistory } from '@/types/order';

const statusConfig: { [key: string]: { icon: React.ElementType; color: string } } = {
  'Dikonfirmasi Sales': { icon: User, color: 'text-blue-500' },
  'Disiapkan Gudang': { icon: Warehouse, color: 'text-yellow-500' },
  'Siap Kirim': { icon: Package, color: 'text-green-500' },
  'Menugaskan Driver': { icon: Truck, color: 'text-purple-500' },
  Selesai: { icon: CheckCircle, color: 'text-emerald-500' },
  default: { icon: CheckCircle, color: 'text-gray-500' },
};

export default function OrderTimeline({ history }: { history: OrderHistory[] }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-muted-foreground">No history available.</p>;
  }

  return (
    <div className="space-y-4">
      {history.map((entry, index) => {
        const config = statusConfig[entry.status] || statusConfig.default;
        const Icon = config.icon;

        return (
          <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }} className="relative pl-8 pb-4 border-l-2 border-muted last:border-l-transparent last:pb-0">
            <div className={`absolute -left-3 top-0 h-6 w-6 rounded-full bg-background flex items-center justify-center`}>
              <div className={`h-4 w-4 rounded-full ${config.color} flex items-center justify-center`}>
                <Icon className="h-4 w-4 text-white bg-current rounded-full p-0.5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`${config.color} border-current`}>
                  {entry.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{format(new Date(entry.timestamp), 'dd MMM, HH:mm', { locale: indonesiaLocale })}</span>
              </div>
              <p className="text-sm text-muted-foreground">{entry.notes}</p>
              {entry.user && (
                <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                  <User className="h-3 w-3" />
                  <span>{entry.user.name}</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
