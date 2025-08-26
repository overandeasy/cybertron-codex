// Quick validation script to test currency Zod refine logic
const { z } = require('zod');

const ALLOWED_CURRENCIES = [
  'USD','EUR','CNY','GBP','AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB','BRL','BSD','BTN','BWP','BYN','BZD','CAD','CDF','CHF','CLP','COP','CRC','CUC','CUP','CVE','CZK','DJF','DKK','DOP','DZD','EGP','ERN','ETB','FJD','FKP','FOK','GEL','GGP','GHS','GIP','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS','IMP','INR','IQD','IRR','ISK','JMD','JOD','JPY','KES','KGS','KHR','KID','KMF','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MXN','MYR','MZN','NAD','NGN','NIO','NOK','NPR','NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG','SEK','SGD','SHP','SLL','SOS','SRD','SSP','STN','SYP','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TVD','TWD','TZS','UAH','UGX','UYU','UZS','VES','VND','VUV','WST','XAF','XCD','XOF','XPF','YER','ZAR','ZMW','ZWL'
];

const collectionSchema = z.object({
  price: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const n = Number(val);
    return isNaN(n) ? undefined : Math.round(n * 100) / 100;
  }, z.number().min(0).optional()),
  currency: z.preprocess((val) => {
    if (!val) return 'USD';
    try { return String(val).toUpperCase(); } catch { return 'USD'; }
  }, z.string().default('USD').refine((c) => ALLOWED_CURRENCIES.includes(String(c).toUpperCase()), { message: 'Invalid currency code' })),
});

const examples = [
  { price: '10.239', currency: 'usd' },
  { price: '5', currency: 'JPY' },
  { price: '', currency: '' },
  { price: null, currency: 'XXX' },
];

examples.forEach((ex) => {
  const res = collectionSchema.safeParse(ex);
  console.log('Input:', ex, '=> success:', res.success);
  if (!res.success) console.log('Error:', res.error.format());
  else console.log('Parsed:', res.data);
});

process.exit(0);
