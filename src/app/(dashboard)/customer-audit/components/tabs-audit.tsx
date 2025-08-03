'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Package, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditResultItem } from '@/types/customer-audit';

interface CylinderDetails {
  serial_number: string;
}

interface AuditSummary {
  match: number;
  missing: number;
  unexpected: number;
  foreign: number;
}

interface AuditResults {
  MATCH: AuditResultItem[];
  MISSING: AuditResultItem[];
  UNEXPECTED: AuditResultItem[];
  FOREIGN: AuditResultItem[];
}

interface AuditDetailTabsProps {
  summary: AuditSummary;
  results: AuditResults;
  className?: string;
}

type StatusType = 'MATCH' | 'MISSING' | 'UNEXPECTED' | 'FOREIGN';

const AuditDetailTabs: React.FC<AuditDetailTabsProps> = ({ summary, results, className = '' }) => {
  const [activeTab, setActiveTab] = useState<StatusType>('MATCH');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusConfig = (status: StatusType) => {
    const configs = {
      MATCH: {
        icon: CheckCircle,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        badgeColor: 'bg-emerald-100 text-emerald-800',
        label: 'Match',
      },
      MISSING: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        badgeColor: 'bg-red-100 text-red-800',
        label: 'Missing',
      },
      UNEXPECTED: {
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        badgeColor: 'bg-orange-100 text-orange-800',
        label: 'Unexpected',
      },
      FOREIGN: {
        icon: HelpCircle,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        badgeColor: 'bg-purple-100 text-purple-800',
        label: 'Foreign',
      },
    };
    return configs[status];
  };

  const filteredItems =
    results[activeTab]?.filter(
      (item) => item.scanned_barcode.toLowerCase().includes(searchTerm.toLowerCase()) || item.cylinder_details?.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) || item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const TabButton: React.FC<{
    status: StatusType;
    count: number;
    isActive: boolean;
    onClick: () => void;
  }> = ({ status, count, isActive, onClick }) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <button
        onClick={onClick}
        className={`
          flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200
          ${isActive ? `${config.bgColor} ${config.borderColor} ${config.color} shadow-sm` : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}
        `}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{config.label}</span>
        <span
          className={`
          px-2 py-0.5 text-xs font-semibold rounded-full
          ${isActive ? 'bg-white/70 text-current' : 'bg-gray-200 text-gray-700'}
        `}
        >
          {count}
        </span>
      </button>
    );
  };

  const ItemCard: React.FC<{
    item: AuditResultItem;
    status: StatusType;
  }> = ({ item, status }) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <div
        className={`
        group p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md
        ${config.bgColor} ${config.borderColor}
      `}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`
              p-2 rounded-lg ${config.color} bg-white/70 group-hover:bg-white transition-colors
            `}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 text-base">{item.scanned_barcode}</h4>
                <span
                  className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${config.badgeColor}
                `}
                >
                  {config.label}
                </span>
              </div>
              {item.cylinder_details && (
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Serial:</span> {item.cylinder_details.serial_number}
                </p>
              )}
              <p className="text-sm text-gray-700 leading-relaxed">{item.notes}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState: React.FC<{
    hasSearchTerm: boolean;
    statusLabel: string;
  }> = ({ hasSearchTerm, statusLabel }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Package className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{hasSearchTerm ? 'Tidak ada hasil pencarian' : `Tidak ada item ${statusLabel.toLowerCase()}`}</h3>
      <p className="text-gray-500">{hasSearchTerm ? 'Coba ubah kata kunci pencarian Anda' : `Belum ada item dengan status ${statusLabel.toLowerCase()} dalam audit ini`}</p>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          Detail Hasil Audit
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {(Object.entries(summary) as [keyof AuditSummary, number][]).map(([status, count]) => (
            <TabButton key={status} status={status.toUpperCase() as StatusType} count={count} isActive={activeTab === status.toUpperCase()} onClick={() => setActiveTab(status.toUpperCase() as StatusType)} />
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari berdasarkan barcode, serial number, atau catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          {filteredItems.length === 0 ? (
            <EmptyState hasSearchTerm={!!searchTerm} statusLabel={getStatusConfig(activeTab).label} />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Menampilkan {filteredItems.length} dari {results[activeTab]?.length || 0} item
                </p>
              </div>

              <div className="grid gap-4">
                {filteredItems.map((item, index) => (
                  <ItemCard key={`${item.scanned_barcode}-${index}`} item={item} status={activeTab} />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditDetailTabs;
