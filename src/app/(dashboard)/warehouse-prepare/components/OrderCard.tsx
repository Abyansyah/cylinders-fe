'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, User, Calendar, Package, Clock } from 'lucide-react';
import Link from 'next/link';

export const OrderCard = ({ order, delay = 0 }: { order: any; delay?: number }) => {
  const { id, order_number, customer_name, status, company_name, order_type, order_date, order_time, total_cylinders, total_gas_types, items } = order;

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
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">{order_number}</CardTitle>
            <Badge className={status === 'Dikonfirmasi Sales' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>{status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{customer_name}</p>
              <p className="text-xs text-muted-foreground truncate">{company_name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">
                {total_cylinders} Tabung ({total_gas_types} Jenis Gas)
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {items.slice(0, 2).map((item: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item.quantity}x {item.name.split(' ')[1] || 'Gas'}
                  </Badge>
                ))}
                {items.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{items.length - 2} lainnya
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{order_date}</p>
              <p className="text-xs text-muted-foreground">{order_time}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Tipe: {order_type}</p>
              {order_type === 'Sewa' && <p className="text-xs text-muted-foreground">Rental tabung gas</p>}
            </div>
          </div>

          <Button asChild className="w-full mt-4 group-hover:bg-blue-600 transition-colors">
            <Link href={`/warehouse-prepare/${id}`} className="gap-2">
              Siapkan Tabung
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
