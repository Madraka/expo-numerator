import type {
  CurrencyCode,
  CurrencyMeta,
  CurrencyRegistration,
} from "./currencyMeta";
import { NumeratorError } from "../core/errors/NumeratorError";

const currencyRegistry = new Map<string, CurrencyMeta>();

const INITIAL_CURRENCIES: CurrencyRegistration[] = [
  currency("AED", 2, "784", "UAE Dirham", "AED"),
  currency("AFN", 2, "971", "Afghani"),
  currency("ALL", 2, "008", "Lek"),
  currency("AMD", 2, "051", "Armenian Dram"),
  currency("AOA", 2, "973", "Kwanza"),
  currency("ARS", 2, "032", "Argentine Peso", "AR$"),
  currency("AUD", 2, "036", "Australian Dollar", "A$"),
  currency("AWG", 2, "533", "Aruban Florin"),
  currency("AZN", 2, "944", "Azerbaijan Manat", "₼"),
  currency("BAM", 2, "977", "Convertible Mark"),
  currency("BBD", 2, "052", "Barbados Dollar"),
  currency("BDT", 2, "050", "Taka", "৳"),
  currency("BHD", 3, "048", "Bahraini Dinar", "BD"),
  currency("BIF", 0, "108", "Burundi Franc"),
  currency("BMD", 2, "060", "Bermudian Dollar"),
  currency("BND", 2, "096", "Brunei Dollar"),
  currency("BOB", 2, "068", "Boliviano"),
  currency("BRL", 2, "986", "Brazilian Real", "R$"),
  currency("BSD", 2, "044", "Bahamian Dollar"),
  currency("BTN", 2, "064", "Ngultrum"),
  currency("BWP", 2, "072", "Pula"),
  currency("BYN", 2, "933", "Belarusian Ruble"),
  currency("BZD", 2, "084", "Belize Dollar"),
  currency("CAD", 2, "124", "Canadian Dollar", "CA$"),
  currency("CDF", 2, "976", "Congolese Franc"),
  currency("CHF", 2, "756", "Swiss Franc", "CHF"),
  currency("CLP", 0, "152", "Chilean Peso", "CLP$"),
  currency("CNY", 2, "156", "Yuan Renminbi", "CN¥"),
  currency("COP", 2, "170", "Colombian Peso", "COL$"),
  currency("CRC", 2, "188", "Costa Rican Colon", "₡"),
  currency("CUP", 2, "192", "Cuban Peso"),
  currency("CVE", 2, "132", "Cabo Verde Escudo"),
  currency("CZK", 2, "203", "Czech Koruna", "Kč"),
  currency("DJF", 0, "262", "Djibouti Franc"),
  currency("DKK", 2, "208", "Danish Krone", "kr"),
  currency("DOP", 2, "214", "Dominican Peso", "RD$"),
  currency("DZD", 2, "012", "Algerian Dinar"),
  currency("EGP", 2, "818", "Egyptian Pound", "E£"),
  currency("ERN", 2, "232", "Nakfa"),
  currency("ETB", 2, "230", "Ethiopian Birr", "Br"),
  currency("EUR", 2, "978", "Euro", "€"),
  currency("FJD", 2, "242", "Fiji Dollar"),
  currency("FKP", 2, "238", "Falkland Islands Pound"),
  currency("GBP", 2, "826", "Pound Sterling", "£"),
  currency("GEL", 2, "981", "Lari", "₾"),
  currency("GHS", 2, "936", "Ghana Cedi", "GH₵"),
  currency("GIP", 2, "292", "Gibraltar Pound"),
  currency("GMD", 2, "270", "Dalasi"),
  currency("GNF", 0, "324", "Guinean Franc"),
  currency("GTQ", 2, "320", "Quetzal", "Q"),
  currency("GYD", 2, "328", "Guyana Dollar"),
  currency("HKD", 2, "344", "Hong Kong Dollar", "HK$"),
  currency("HNL", 2, "340", "Lempira"),
  currency("HTG", 2, "332", "Gourde"),
  currency("HUF", 2, "348", "Forint", "Ft"),
  currency("IDR", 2, "360", "Rupiah", "Rp"),
  currency("ILS", 2, "376", "New Israeli Sheqel", "₪"),
  currency("INR", 2, "356", "Indian Rupee", "₹"),
  currency("IQD", 3, "368", "Iraqi Dinar"),
  currency("IRR", 2, "364", "Iranian Rial"),
  currency("ISK", 0, "352", "Iceland Krona"),
  currency("JMD", 2, "388", "Jamaican Dollar"),
  currency("JOD", 3, "400", "Jordanian Dinar", "JOD"),
  currency("JPY", 0, "392", "Yen", "¥"),
  currency("KES", 2, "404", "Kenyan Shilling", "KSh"),
  currency("KGS", 2, "417", "Som"),
  currency("KHR", 2, "116", "Riel"),
  currency("KMF", 0, "174", "Comorian Franc"),
  currency("KPW", 2, "408", "North Korean Won"),
  currency("KRW", 0, "410", "Won", "₩"),
  currency("KWD", 3, "414", "Kuwaiti Dinar", "KD"),
  currency("KYD", 2, "136", "Cayman Islands Dollar"),
  currency("KZT", 2, "398", "Tenge", "₸"),
  currency("LAK", 2, "418", "Lao Kip"),
  currency("LBP", 2, "422", "Lebanese Pound"),
  currency("LKR", 2, "144", "Sri Lanka Rupee", "Rs"),
  currency("LRD", 2, "430", "Liberian Dollar"),
  currency("LSL", 2, "426", "Loti"),
  currency("LYD", 3, "434", "Libyan Dinar"),
  currency("MAD", 2, "504", "Moroccan Dirham", "MAD"),
  currency("MDL", 2, "498", "Moldovan Leu"),
  currency("MGA", 2, "969", "Malagasy Ariary"),
  currency("MKD", 2, "807", "Denar"),
  currency("MMK", 2, "104", "Kyat"),
  currency("MNT", 2, "496", "Tugrik"),
  currency("MOP", 2, "446", "Pataca"),
  currency("MRU", 2, "929", "Ouguiya"),
  currency("MUR", 2, "480", "Mauritius Rupee"),
  currency("MVR", 2, "462", "Rufiyaa"),
  currency("MWK", 2, "454", "Malawi Kwacha"),
  currency("MXN", 2, "484", "Mexican Peso", "MX$"),
  currency("MYR", 2, "458", "Malaysian Ringgit", "RM"),
  currency("MZN", 2, "943", "Mozambique Metical"),
  currency("NAD", 2, "516", "Namibia Dollar"),
  currency("NGN", 2, "566", "Naira", "₦"),
  currency("NIO", 2, "558", "Cordoba Oro"),
  currency("NOK", 2, "578", "Norwegian Krone", "kr"),
  currency("NPR", 2, "524", "Nepalese Rupee", "रू"),
  currency("NZD", 2, "554", "New Zealand Dollar", "NZ$"),
  currency("OMR", 3, "512", "Rial Omani", "OMR"),
  currency("PAB", 2, "590", "Balboa"),
  currency("PEN", 2, "604", "Sol", "S/"),
  currency("PGK", 2, "598", "Kina"),
  currency("PHP", 2, "608", "Philippine Peso", "₱"),
  currency("PKR", 2, "586", "Pakistan Rupee", "Rs"),
  currency("PLN", 2, "985", "Zloty", "zł"),
  currency("PYG", 0, "600", "Guarani", "₲"),
  currency("QAR", 2, "634", "Qatari Rial", "QAR"),
  currency("RON", 2, "946", "Romanian Leu", "lei"),
  currency("RSD", 2, "941", "Serbian Dinar", "дин"),
  currency("RUB", 2, "643", "Russian Ruble"),
  currency("RWF", 0, "646", "Rwanda Franc"),
  currency("SAR", 2, "682", "Saudi Riyal", "SAR"),
  currency("SBD", 2, "090", "Solomon Islands Dollar"),
  currency("SCR", 2, "690", "Seychelles Rupee"),
  currency("SDG", 2, "938", "Sudanese Pound"),
  currency("SEK", 2, "752", "Swedish Krona", "kr"),
  currency("SGD", 2, "702", "Singapore Dollar", "S$"),
  currency("SHP", 2, "654", "Saint Helena Pound"),
  currency("SLE", 2, "925", "Leone"),
  currency("SOS", 2, "706", "Somali Shilling"),
  currency("SRD", 2, "968", "Surinam Dollar"),
  currency("SSP", 2, "728", "South Sudanese Pound"),
  currency("STN", 2, "930", "Dobra"),
  currency("SVC", 2, "222", "El Salvador Colon"),
  currency("SYP", 2, "760", "Syrian Pound"),
  currency("SZL", 2, "748", "Lilangeni"),
  currency("THB", 2, "764", "Baht", "฿"),
  currency("TJS", 2, "972", "Somoni"),
  currency("TMT", 2, "934", "Turkmenistan New Manat"),
  currency("TND", 3, "788", "Tunisian Dinar"),
  currency("TOP", 2, "776", "Pa'anga"),
  currency("TRY", 2, "949", "Turkish Lira", "₺"),
  currency("TTD", 2, "780", "Trinidad and Tobago Dollar"),
  currency("TWD", 2, "901", "New Taiwan Dollar", "NT$"),
  currency("TZS", 2, "834", "Tanzanian Shilling"),
  currency("UAH", 2, "980", "Hryvnia", "₴"),
  currency("UGX", 0, "800", "Uganda Shilling"),
  currency("USD", 2, "840", "US Dollar", "$"),
  currency("UYU", 2, "858", "Peso Uruguayo", "$U"),
  currency("UYW", 4, "927", "Unidad Previsional"),
  currency("UZS", 2, "860", "Uzbekistan Sum"),
  currency("VED", 2, "926", "Bolívar Soberano"),
  currency("VES", 2, "928", "Bolívar Soberano"),
  currency("VND", 0, "704", "Dong", "₫"),
  currency("VUV", 0, "548", "Vatu"),
  currency("WST", 2, "882", "Tala"),
  currency("XAD", 2, "396", "Arab Accounting Dinar"),
  currency("XAF", 0, "950", "CFA Franc BEAC", "XAF"),
  currency("XCD", 2, "951", "East Caribbean Dollar"),
  currency("XCG", 2, "532", "Caribbean Guilder"),
  currency("XOF", 0, "952", "CFA Franc BCEAO", "XOF"),
  currency("XPF", 0, "953", "CFP Franc", "XPF"),
  currency("YER", 2, "886", "Yemeni Rial"),
  currency("ZAR", 2, "710", "Rand", "R"),
  currency("ZMW", 2, "967", "Zambian Kwacha"),
  currency("ZWG", 2, "924", "Zimbabwe Gold"),
];

for (const currency of INITIAL_CURRENCIES) {
  currencyRegistry.set(currency.code, freezeCurrencyMeta(currency));
}

export function getCurrencyMeta(code: string): CurrencyMeta {
  const normalizedCode = normalizeCurrencyCode(code);
  const meta = currencyRegistry.get(normalizedCode);

  if (!meta) {
    throw new NumeratorError("INVALID_CURRENCY", { currency: code });
  }

  return meta;
}

export function getRegisteredCurrencies(): CurrencyMeta[] {
  return [...currencyRegistry.values()];
}

export function getRegisteredCurrencyCodes(): CurrencyCode[] {
  return [...currencyRegistry.keys()] as CurrencyCode[];
}

export function registerCurrency(currency: CurrencyRegistration): CurrencyMeta {
  const normalizedCode = normalizeCurrencyCode(currency.code);

  if (
    !Number.isInteger(currency.minorUnit) ||
    currency.minorUnit < 0 ||
    currency.minorUnit > 12
  ) {
    throw new NumeratorError("INVALID_CURRENCY", {
      currency: currency.code,
      minorUnit: currency.minorUnit,
    });
  }

  const meta = freezeCurrencyMeta({
    ...currency,
    code: normalizedCode,
  });

  currencyRegistry.set(normalizedCode, meta);
  return meta;
}

export function isCurrencyCode(code: string): code is CurrencyCode {
  return currencyRegistry.has(code.trim().toUpperCase());
}

function normalizeCurrencyCode(code: string): CurrencyCode {
  const normalized = code.trim().toUpperCase();

  if (!/^[A-Z]{3,5}$/.test(normalized)) {
    throw new NumeratorError("INVALID_CURRENCY", { currency: code });
  }

  return normalized as CurrencyCode;
}

function currency(
  code: string,
  minorUnit: number,
  numeric: string,
  name: string,
  symbol?: string,
): CurrencyRegistration {
  return { code, minorUnit, numeric, name, symbol };
}

function freezeCurrencyMeta(currency: CurrencyRegistration): CurrencyMeta {
  return Object.freeze({
    code: currency.code as CurrencyCode,
    numeric: currency.numeric,
    minorUnit: currency.minorUnit,
    name: currency.name,
    symbol: currency.symbol,
  });
}
