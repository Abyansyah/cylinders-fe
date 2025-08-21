export const formatRupiah = (value: string | number) => {
  if (!value) return '';
  const numberString = value.toString().replace(/\D/g, '');
  return new Intl.NumberFormat('id-ID').format(Number(numberString));
};

export const unformatRupiah = (value: string) => {
  return value.replace(/\./g, '').replace(/,/g, '');
};
