export type AppInformationItem = {
  label: string;
  value: string;
  testID: string;
};

export type AppInformationSection = {
  title: string;
  items: readonly AppInformationItem[];
};

export const APP_INFORMATION_SECTIONS: readonly AppInformationSection[] = Object.freeze([
  {
    title: "App Name",
    items: [
      {
        label: "App Name",
        value: "Netsight",
        testID: "app-info-app-name",
      },
    ],
  },
  {
    title: "General Information",
    items: [
      {
        label: "Primary Language",
        value: "English (U.S.)",
        testID: "app-info-primary-language",
      },
      {
        label: "Bundle ID",
        value: "com.anonymous.netsight",
        testID: "app-info-bundle-id",
      },
      {
        label: "SKU",
        value: "EX1762323237758",
        testID: "app-info-sku",
      },
      {
        label: "Apple ID",
        value: "6754904970",
        testID: "app-info-apple-id",
      },
    ],
  },
]);
