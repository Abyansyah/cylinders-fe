export interface KPICardsData {
  total_active_customers: number;
  total_completed_orders: number;
  total_completed_audits: number;
  total_cylinders_at_customer: number;
}

export interface TopProduct {
  product_name: string;
  order_count: number;
}

export interface AssetDistribution {
  warehouse_name: string;
  cylinder_count: number;
}

export interface TopCustomer {
  customer_name: string;
  order_count: number;
}

export interface PendingRequest {
  request_type: string;
  requester: string;
  request_date: string;
}

export interface RecentDelivery {
  surat_jalan_number: string;
  customer_name: string;
  status: string;
}

export interface DashboardData {
  kpi_cards: KPICardsData;
  charts: {
    top_products: TopProduct[];
    asset_distribution_by_warehouse: AssetDistribution[];
  };
  actionable_tables: {
    top_customers: TopCustomer[];
    pending_requests: PendingRequest[];
    retiring_cylinders: any[];
    recent_deliveries: RecentDelivery[];
  };
}
