export interface AWBSettings {
  maxLength: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeHyphen: boolean;
  includeUnderscore: boolean;
  prefix: string;
  suffix: string;
}

export const DEFAULT_SETTINGS: AWBSettings = {
  maxLength: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeHyphen: false,
  includeUnderscore: false,
  prefix: "",
  suffix: "",
};
