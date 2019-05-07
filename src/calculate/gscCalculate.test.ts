import Field from "../Field";
import Move from "../Move";
import Pokemon from "../Pokemon";
import { Generation, Stat, Status, Weather } from "../utilities";
import gscCalculate from "./gscCalculate";

const gen = Generation.GSC;

let field = new Field();
beforeEach(() => {
  field = new Field({ gen });
});

describe("crit", () => {
  let machamp = new Pokemon();
  let starmie = new Pokemon();
  let crossChopCrit = new Move();
  beforeEach(() => {
    machamp = new Pokemon({ name: "Machamp", gen });
    starmie = new Pokemon({ name: "Starmie", gen });
    crossChopCrit = new Move({
      name: "Cross Chop",
      critical: true,
      gen
    });
  });

  it("doubles damage", () => {
    const damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toBe(168);
  });

  it("ignores modifiers only if boosts are the same or worse", () => {
    machamp.boosts[Stat.ATK] = 6;
    starmie.boosts[Stat.DEF] = 5;
    let damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toBe(135);

    machamp.boosts[Stat.ATK] = 6;
    starmie.boosts[Stat.DEF] = 6;
    damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toBe(168);

    machamp.boosts[Stat.ATK] = 5;
    starmie.boosts[Stat.DEF] = 6;
    damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toBe(168);
  });

  it("ignores Reflect", () => {
    starmie.reflect = true;

    let damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toBe(168);

    machamp.boosts[Stat.ATK] = 1;
    damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toBe(127);
  });

  it("ignores Light Screen", () => {
    starmie.lightScreen = true;
    const thunderCrit = new Move({
      name: "Thunder",
      critical: true,
      gen
    });

    let damage = gscCalculate(machamp, starmie, thunderCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toBe(344);

    machamp.boosts[Stat.SATK] = 1;
    damage = gscCalculate(machamp, starmie, thunderCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toBe(256);
  });

  it("ignores Burn", () => {
    machamp.status = Status.BURNED;

    let damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toBe(168);

    machamp.boosts[Stat.ATK] = 1;
    damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toBe(127);
  });
});

describe("weather", () => {
  let rain = new Field();
  let sand = new Field();
  let sun = new Field();
  beforeEach(() => {
    rain = new Field({ weather: Weather.RAIN, gen });
    sand = new Field({ weather: Weather.SAND, gen });
    sun = new Field({ weather: Weather.SUN, gen });
  });

  it("reduces Solar Beam damage in rain", () => {
    const houndoom = new Pokemon({ name: "Houndoom", gen });
    const cloyster = new Pokemon({ name: "Cloyster", gen });
    const solarBeam = new Move({ name: "Solar Beam", gen });

    const damage = gscCalculate(houndoom, cloyster, solarBeam, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toBe(342);

    const sandDamage = gscCalculate(houndoom, cloyster, solarBeam, sand);
    expect(sandDamage).toHaveLength(39);
    expect(Math.max(...sandDamage)).toBe(342);

    const rainDamage = gscCalculate(houndoom, cloyster, solarBeam, rain);
    expect(rainDamage).toHaveLength(39);
    expect(Math.max(...rainDamage)).toBe(170);
  });

  it("reduces Fire-type and Water-type damage in Rain and Sun", () => {
    const moltres = new Pokemon({ name: "Moltres", gen });
    const suicune = new Pokemon({ name: "Suicune", gen });
    const fireBlast = new Move({ name: "Fire Blast", gen });
    const hydroPump = new Move({ name: "Hydro Pump", gen });
    const doubleEdge = new Move({ name: "Double-Edge", gen });

    const sunBoosted = gscCalculate(moltres, suicune, fireBlast, sun);
    expect(sunBoosted).toHaveLength(39);
    expect(Math.max(...sunBoosted)).toBe(121);

    const sunReduced = gscCalculate(moltres, suicune, fireBlast, rain);
    expect(sunReduced).toHaveLength(39);
    expect(Math.max(...sunReduced)).toBe(40);

    const rainBoosted = gscCalculate(suicune, moltres, hydroPump, rain);
    expect(rainBoosted).toHaveLength(39);
    expect(Math.max(...rainBoosted)).toBe(470);

    const rainReduced = gscCalculate(suicune, moltres, hydroPump, sun);
    expect(rainReduced).toHaveLength(39);
    expect(Math.max(...rainReduced)).toBe(156);

    const rainUnboosted = gscCalculate(moltres, suicune, doubleEdge, rain);
    expect(rainUnboosted).toHaveLength(39);
    expect(Math.max(...rainUnboosted)).toBe(92);

    const sunUnboosted = gscCalculate(moltres, suicune, doubleEdge, sun);
    expect(sunUnboosted).toHaveLength(39);
    expect(Math.max(...sunUnboosted)).toBe(92);
  });
});

test("sanity check", () => {
  const doubleEdge = new Move({ name: "Double-Edge", gen });

  const snorlax = new Pokemon({ name: "Snorlax", gen });
  const zapdos = new Pokemon({ name: "Zapdos", gen });
  let damage = gscCalculate(snorlax, zapdos, doubleEdge, field);
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toBe(180);

  const umbreon = new Pokemon({ name: "Umbreon", gen });
  const blissey = new Pokemon({ name: "Blissey", gen });
  damage = gscCalculate(umbreon, blissey, doubleEdge, field);
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toBe(196);
});

test("Pursuit doubles after variance", () => {
  const tyranitar = new Pokemon({ name: "Tyranitar", gen });
  const misdreavus = new Pokemon({ name: "Misdreavus", gen });
  const pursuit = new Move({ name: "Pursuit", gen });

  expect(gscCalculate(tyranitar, misdreavus, pursuit, field)).toMatchSnapshot();

  misdreavus.switchedOut = true;
  expect(gscCalculate(tyranitar, misdreavus, pursuit, field)).toMatchSnapshot();
});

test("Explosion halves Defense", () => {
  const cloyster = new Pokemon({ name: "Cloyster", gen });
  const snorlax = new Pokemon({ name: "Snorlax", gen });
  const explosion = new Move({ name: "Explosion", gen });
  const damage = gscCalculate(cloyster, snorlax, explosion, field);
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toBe(542);
});

test("Hidden Power is physical for certain types", () => {
  const marowak = new Pokemon({
    name: "Marowak",
    item: "Thick Club",
    ivs: [15, 13, 13, 15, 15, 15],
    gen
  });
  const exeggutor = new Pokemon({ name: "Exeggutor", gen });
  const hiddenPower = new Move({ name: "Hidden Power", gen });
  const damage = gscCalculate(marowak, exeggutor, hiddenPower, field);
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toBe(452);
});

test("Light Ball doubles Special Attack", () => {
  const pikachu = new Pokemon({
    name: "Pikachu",
    item: "Light Ball",
    gen
  });
  const zapdos = new Pokemon({ name: "Zapdos", gen });
  const thunder = new Move({ name: "Thunder", gen });
  const damage = gscCalculate(pikachu, zapdos, thunder, field);
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toBe(219);
});

test("Reversal and Flail have no damage variance", () => {
  const reversal = new Move({ name: "Reversal", gen });
  const flail = new Move({ name: "Flail", gen });
  const heracross = new Pokemon({
    name: "Heracross",
    currentHp: 1,
    gen
  });
  const skarmory = new Pokemon({ name: "Skarmory", gen });
  expect(gscCalculate(heracross, skarmory, reversal, field)).toEqual([235]);
  expect(gscCalculate(heracross, skarmory, flail, field)).toEqual([78]);
});

test("Type boosting items increase damage by 10%", () => {
  const moltres = new Pokemon({
    name: "Moltres",
    item: "Charcoal",
    gen
  });
  const snorlax = new Pokemon({ name: "Snorlax", gen });
  const fireBlast = new Move({ name: "Fire Blast", gen });
  const damage = gscCalculate(moltres, snorlax, fireBlast, field);
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toBe(186);
});

test("Type immunity", () => {
  const snorlax = new Pokemon({ name: "Snorlax", gen });
  const gengar = new Pokemon({ name: "Gengar", gen });
  const bodySlam = new Move({ name: "Body Slam", gen });
  expect(gscCalculate(snorlax, gengar, bodySlam, field)).toEqual([0]);
});

test("status moves do no damage", () => {
  const snorlax = new Pokemon({ name: "Snorlax", gen });
  const zapdos = new Pokemon({ name: "Zapdos", gen });
  const rest = new Move({ name: "Rest", gen });
  expect(gscCalculate(snorlax, zapdos, rest, field)).toEqual([0]);
});
