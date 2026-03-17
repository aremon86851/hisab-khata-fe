export const taka = (n: number) => '৳' + Number(n).toLocaleString('en');

export const relativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'এইমাত্র';
  if (m < 60) return `${m} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ঘন্টা আগে`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'গতকাল';
  if (d < 7)  return `${d} দিন আগে`;
  return new Date(dateStr).toLocaleDateString('bn-BD');
};

export const getApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { message?: string } } };
    return e.response?.data?.message || 'কিছু একটা ভুল হয়েছে';
  }
  return 'কিছু একটা ভুল হয়েছে';
};

export const banglaMonth = (m: number) =>
  ['','জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'][m];

export const repLabel = (score: number) => {
  if (score >= 4.5) return { label: 'অসাধারণ',        color: 'text-teal-400'  };
  if (score >= 3.5) return { label: 'ভালো পেয়ার',     color: 'text-green-400' };
  if (score >= 2.5) return { label: 'গড়পড়তা',        color: 'text-amber-400' };
  return               { label: 'উন্নতি প্রয়োজন',   color: 'text-red-400'   };
};
