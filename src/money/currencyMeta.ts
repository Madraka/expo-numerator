export type CurrencyCode = string & { readonly __currencyCodeBrand?: never };

export interface CurrencyMeta {
  readonly code: CurrencyCode;
  readonly numeric?: string;
  readonly minorUnit: number;
  readonly name?: string;
  readonly symbol?: string;
}

export type CurrencyRegistration = {
  readonly code: string;
  readonly numeric?: string;
  readonly minorUnit: number;
  readonly name?: string;
  readonly symbol?: string;
};
