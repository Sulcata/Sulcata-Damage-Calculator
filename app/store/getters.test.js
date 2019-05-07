import { Generation } from "sulcalc";
import * as getters from "./getters";

jest.mock("../../dist/usage", () => ({
  7: {
    abomasnow: 2,
    snorlax: 1,
    abra: -1
  }
}));

test("reports()", () => {
  expect(
    getters.reports(null, {
      attackerReports: [1, 3, 5, 7],
      defenderReports: [2, 4, 6, 8]
    })
  ).toEqual([1, 3, 5, 7, 2, 4, 6, 8]);
});

test.each([
  // prettier-ignore
  [{ reportOverrideIndex: -1 }, false],
  [{ reportOverrideIndex: 0 }, true],
  [{ reportOverrideIndex: 3 }, true],
  [{ reportOverrideIndex: 4 }, false],
  [{ reportOverrideIndex: NaN }, false]
])("isReportOverrideForAttacker(%p)", (state, expected) => {
  expect(getters.isReportOverrideForAttacker(state)).toBe(expected);
});

test.each([
  // prettier-ignore
  [{ reportOverrideIndex: 3 }, false],
  [{ reportOverrideIndex: 4 }, true],
  [{ reportOverrideIndex: 7 }, true],
  [{ reportOverrideIndex: 8 }, false],
  [{ reportOverrideIndex: NaN }, false]
])("isReportOverrideForDefender(%p)", (state, expected) => {
  expect(getters.isReportOverrideForDefender(state)).toBe(expected);
});

test("sets()", () => {
  const setsName = "my sets";
  const state = {
    enabledSets: { [setsName]: true },
    gen: Generation.SM,
    sets: {
      [setsName]: {
        [Generation.SM]: {
          abomasnow: {
            "abomasnow 1": { set: "abomasnow 1" },
            "abomasnow 2": { set: "abomasnow 2" }
          },
          snorlax: {
            "snorlax 1": { set: "snorlax 1" }
          },
          abra: {
            "abra 1": { set: "abra 1" }
          }
        }
      }
    },
    sortByUsage: false
  };

  const pokes = new Set(["abomasnow", "snorlax", "abra"]);

  state.sortByUsage = false;
  expect(
    getters.sets(state).filter(({ pokemonId }) => pokes.has(pokemonId))
  ).toMatchSnapshot();

  state.sortByUsage = true;
  expect(
    getters.sets(state).filter(({ pokemonId }) => pokes.has(pokemonId))
  ).toMatchSnapshot();
});
