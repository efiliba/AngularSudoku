/// <reference path="jasmine.d.ts" />
/// <reference path="../app/Utilities/Combinations.ts" />
describe("Combinations", function () {
    var combinations; //: Solver.ICombinations<string>;
    var from;
    beforeEach(function () {
        combinations = new Solver.Combinations(9); // Columns * rows
        from = ["a", "b", "c", "d"];
    });
    it("C(4, 1) = 4", function () {
        var pick = 1;
        var items = combinations.select(from, pick);
        var expected = [];
        expected[0] = ["a"];
        expected[1] = ["b"];
        expected[2] = ["c"];
        expected[3] = ["d"];
        expect(items).toEqual(expected);
    });
    // C(4, 2) = 4 * 3 / 2 = 6
    it("C(4, 2) = 6", function () {
        var pick = 2;
        var items = combinations.select(from, pick);
        var expected = [];
        expected[0] = ["a", "b"];
        expected[1] = ["a", "c"];
        expected[2] = ["b", "c"];
        expected[3] = ["a", "d"];
        expected[4] = ["b", "d"];
        expected[5] = ["c", "d"];
        expect(items).toEqual(expected);
    });
    it("C(4, 3) = 4", function () {
        var pick = 3;
        var items = combinations.select(from, pick);
        var expected = [];
        expected[0] = ["a", "b", "c"];
        expected[1] = ["a", "b", "d"];
        expected[2] = ["a", "c", "d"];
        expected[3] = ["b", "c", "d"];
        expect(items).toEqual(expected);
    });
    it("C(4, 4) = 1", function () {
        var pick = 4;
        var items = combinations.select(from, pick);
        var expected = [];
        expected[0] = ["a", "b", "c", "d"];
        expect(items).toEqual(expected);
    });
});
//# sourceMappingURL=TestCombinations.js.map