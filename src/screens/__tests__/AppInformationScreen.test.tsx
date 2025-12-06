import { render, fireEvent, within } from "@testing-library/react-native";
import AppInformationScreen from "../Settings/AppInformationScreen";
import { APP_INFORMATION_SECTIONS } from "../../utils/appMetadata";

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => mockNavigation,
  };
});

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

describe("AppInformationScreen", () => {
  beforeEach(() => {
    mockNavigation.goBack.mockClear();
    mockNavigation.navigate.mockClear();
  });

  it("renders all application metadata", () => {
    const { getAllByText, getByTestId } = render(<AppInformationScreen />);

    APP_INFORMATION_SECTIONS.forEach((section) => {
      expect(getAllByText(section.title).length).toBeGreaterThan(0);
      section.items.forEach((item) => {
        const itemNode = getByTestId(item.testID);
        expect(itemNode).toBeTruthy();
        const utils = within(itemNode);
        expect(utils.getByText(item.label)).toBeTruthy();
        expect(utils.getByText(item.value)).toBeTruthy();
      });
    });
  });

  it("returns to the previous screen when the back button is pressed", () => {
    const { getByTestId } = render(<AppInformationScreen />);

    fireEvent.press(getByTestId("app-info-back-button"));

    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });
});
