export interface SelectListItem {
  value: number;
  label: string;
}

export interface SelectListApiResponse {
  success: boolean;
  data: SelectListItem[];
}
