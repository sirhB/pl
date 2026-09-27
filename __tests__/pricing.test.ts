function calcTaxLocal(subtotalCents: number, taxRateBps: number) {
  return Math.round((subtotalCents * taxRateBps) / 10000);
}

describe("tax math", () => {
  it("calculates 7.5% tax", () => {
    expect(calcTaxLocal(2000, 750)).toBe(150);
  });
  it("rounds via Math.round", () => {
    expect(calcTaxLocal(1001, 750)).toBe(75);
  });
});

describe("money formatting", () => {
  it("formats cents", () => {
    expect(
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(15.99)
    ).toBe("$15.99");
  });
});
