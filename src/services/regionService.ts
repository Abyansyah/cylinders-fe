const API_BASE_URL = process.env.NEXT_PUBLIC_API_REGION_URL;

export const regionFetcher = (url: string) => fetch(`${API_BASE_URL}${url}`).then((res) => res.json());
