import {
  getDateAndTimeFromDate,
  validationDateFormat,
  validationDateLogical,
  ValidationDateLogicalErrors,
  validationTimeLogical,
  ValidationTimeLogicalErrors
} from "../controllers/add-task/helpers";

describe("Checking the correct behavior of validation date", (): void => {
  it("Simple test", (): void => {
    expect(((): number => 1 + 1)()).toBe(2);
  });

  it("Test validation format", (): void => {
    expect(validationDateFormat("02.02.2222 - 22:31")).toBe(true);
    expect(validationDateFormat("02.02.2222 - 22:311")).toBe(false);
    expect(validationDateFormat("02.02.2222  - 22:31")).toBe(false);
    expect(validationDateFormat("02.02.2222 - 2:31")).toBe(false);
    expect(validationDateFormat("2.02.2222 - 2:31")).toBe(false);
    expect(validationDateFormat("02.2.2222 - 2:31")).toBe(false);
    expect(validationDateFormat("02.02.123 - 2:31")).toBe(false);
  });

  it("Test get date and time from date", (): void => {
    expect(getDateAndTimeFromDate("02.02.2222 - 22:31")).toEqual({
      date: "02.02.2222",
      time: "22:31"
    });
  });

  it("Test validation date logical", (): void => {
    expect(validationDateLogical("09.08.2015", new Date(2015, 0, 1))).toBe(ValidationDateLogicalErrors.NONE);
    expect(validationDateLogical("00.08.2015", new Date(2015, 0, 1))).toBe(ValidationDateLogicalErrors.INCORRECT_DAY);
    expect(validationDateLogical("32.08.2015", new Date(2015, 0, 1))).toBe(ValidationDateLogicalErrors.INCORRECT_DAY);
    expect(validationDateLogical("30.00.2015", new Date(2015, 0, 1))).toBe(ValidationDateLogicalErrors.INCORRECT_MONTH);
    expect(validationDateLogical("30.13.2015", new Date(2015, 0, 1))).toBe(ValidationDateLogicalErrors.INCORRECT_MONTH);
    expect(validationDateLogical("30.12.2014", new Date(2015, 0, 1))).toBe(ValidationDateLogicalErrors.PAST_YEAR);
    expect(validationDateLogical("30.06.2015", new Date(2015, 5, 1))).toBe(ValidationDateLogicalErrors.NONE);
    expect(validationDateLogical("30.05.2015", new Date(2015, 5, 1))).toBe(ValidationDateLogicalErrors.PAST_MONTH);
    expect(validationDateLogical("30.06.2015", new Date(2015, 5, 25))).toBe(ValidationDateLogicalErrors.NONE);
    expect(validationDateLogical("25.06.2015", new Date(2015, 5, 25))).toBe(ValidationDateLogicalErrors.NONE);
    expect(validationDateLogical("24.06.2015", new Date(2015, 5, 25))).toBe(ValidationDateLogicalErrors.PAST_DAY);
    expect(validationDateLogical("24.06.2023", new Date(2015, 5, 25))).toBe(ValidationDateLogicalErrors.MAX_YEAR);
    expect(validationDateLogical("29.02.2020", new Date(2020, 1, 28))).toBe(ValidationDateLogicalErrors.NONE);
    expect(validationDateLogical("30.02.2020", new Date(2020, 1, 28))).toBe(ValidationDateLogicalErrors.INCORRECT_DAY);
  });

  it("Test validation time logical", (): void => {
    expect(validationTimeLogical("18.04.2020", "19:54", new Date(2020, 3, 18, 19, 53))).toBe(
      ValidationTimeLogicalErrors.NONE
    );
    expect(validationTimeLogical("18.04.2020", "19:60", new Date(2020, 3, 18, 19, 53))).toBe(
      ValidationTimeLogicalErrors.INCORRECT_MIN
    );
    expect(validationTimeLogical("18.04.2020", "00:59", new Date(2020, 3, 18, 19, 53))).toBe(
      ValidationTimeLogicalErrors.PAST_HOURS
    );
    expect(validationTimeLogical("18.04.2020", "23:59", new Date(2020, 3, 18, 19, 53))).toBe(
      ValidationTimeLogicalErrors.NONE
    );
    expect(validationTimeLogical("18.04.2020", "24:59", new Date(2020, 3, 18, 19, 53))).toBe(
      ValidationTimeLogicalErrors.INCORRECT_HOURS
    );
    expect(validationTimeLogical("18.04.2020", "19:53", new Date(2020, 3, 18, 19, 53))).toBe(
      ValidationTimeLogicalErrors.PAST_MIN
    );
    expect(validationTimeLogical("18.04.2020", "19:52", new Date(2020, 3, 18, 19, 53))).toBe(
      ValidationTimeLogicalErrors.PAST_MIN
    );
    expect(validationTimeLogical("18.04.2020", "18:56", new Date(2020, 3, 18, 19, 53))).toBe(
      ValidationTimeLogicalErrors.PAST_HOURS
    );
    expect(validationTimeLogical("19.04.2020", "18:56", new Date(2020, 3, 18, 19, 53))).toBe(
      ValidationTimeLogicalErrors.NONE
    );
  });
});
