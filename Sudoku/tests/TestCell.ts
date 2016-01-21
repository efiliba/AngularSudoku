/// <reference path="jasmine.d.ts" />
/// <reference path="../app/Models/Cell.ts" />

describe("Cell", function () {
    it("should contain option at position", function () {
        Solver.Cell.Constructor(4, 2);                                                              // Static constructor

        var cell: Solver.ICell = new Solver.Cell(0, 0);                                             //  1 |  2 |  4 |  8      1 | 2 | 3 | 4
        expect(cell.options).toBe(255);                                                             // ------------------  =  --------------
                                                                                                    // 16 | 32 | 64 | 128     5 | 6 | 7 | 8
        expect(cell.containsOptionAtPosition(0, 0)).toBeTruthy();
        expect(cell.containsOptionAtPosition(1, 0)).toBeTruthy();
        expect(cell.containsOptionAtPosition(2, 0)).toBeTruthy();
        expect(cell.containsOptionAtPosition(3, 0)).toBeTruthy();
        expect(cell.containsOptionAtPosition(0, 1)).toBeTruthy();
        expect(cell.containsOptionAtPosition(1, 1)).toBeTruthy();
        expect(cell.containsOptionAtPosition(2, 1)).toBeTruthy();
        expect(cell.containsOptionAtPosition(3, 1)).toBeTruthy();
        expect(cell.containsOptionAtPosition(4, 1)).toBeFalsy();                                    // No bit set - overflow
        expect(cell.containsOptionAtPosition(0, 2)).toBeFalsy();
    });

    it("should be 1", function () {
        Solver.Cell.Constructor(4, 1);

        var cell: Solver.ICell = new Solver.Cell(0, 0);
        cell.setByOption(1, Solver.SetMethod.user);


        expect(cell.symbol()).toBe("1");
    });

    describe("Json", function () {
        var cell: Solver.ICell;

        beforeEach(function () {
            Solver.Cell.Constructor(2, 2);
            cell = new Solver.Cell(0, 0);
        });

        describe("Get", function () {
            it("should contain all symbols", function () {
                expect(cell.json).toEqual({ "rows": [{ "columns": [{ "symbol": "1" }, { "symbol": "2" }] }, { "columns": [{ "symbol": "3" }, { "symbol": "4" }] }] });
            });

            it("should have symbol 1 stuck out", function () {
                cell.removeOption(1);
                expect(cell.json).toEqual({ "rows": [{ "columns": [{ "symbol": "1", "strikeOut": true }, { "symbol": "2" }] }, { "columns": [{ "symbol": "3" }, { "symbol": "4" }] }] });
            });

            it("should be set directly", function () {
                cell.json.rows[0].columns[0].strikeOut = false;
                cell.json.rows[0].columns[1].strikeOut = true;
                expect(cell.json).toEqual({ "rows": [{ "columns": [{ "symbol": "1", "strikeOut": false }, { "symbol": "2", "strikeOut": true }] }, { "columns": [{ "symbol": "3" }, { "symbol": "4" }] }] });
            });

            it("should be set by reference", function () {
                var json: Solver.IJsonCell = cell.json;
                cell.removeOption(1);
                json.rows[0].columns[1].strikeOut = true;
                json.rows[1].columns[0].strikeOut = false;
                json.rows[1].columns[1].strikeOut = false;

                expect(cell.json).toEqual({ "rows": [{ "columns": [{ "symbol": "1", "strikeOut": true }, { "symbol": "2", "strikeOut": true }] }, { "columns": [{ "symbol": "3", "strikeOut": false }, { "symbol": "4", "strikeOut": false }] }] });
            });

            it("should be set to a symbol", function () {
                cell.setByOption(1, Solver.SetMethod.user);
                expect(cell.json).toEqual({ "symbol": "1", "fixed": false });
            });

            it("should have options removed", function () {
                cell.removeOptions(3);
                expect(cell.json).toEqual({ "rows": [{ "columns": [{ "symbol": "1", "strikeOut": true }, { "symbol": "2", "strikeOut": true }] }, { "columns": [{ "symbol": "3" }, { "symbol": "4" }] }] });
            });

            it("should have options removed leaving symbol", function () {
                cell.removeOptions(7);
                expect(cell.json).toEqual({ "symbol": "4" });
            });

        });

        describe("Set", function () {
            it("should be set to default", function () {
                cell.setJson({ "rows": [{ "columns": [{ "symbol": "1", "strikeOut": false }, { "symbol": "2" }] }, { "columns": [{ "symbol": "3" }, { "symbol": "4", "strikeOut": false }] }] });
                expect(cell.json).toEqual({ "rows": [{ "columns": [{ "symbol": "1", "strikeOut": false }, { "symbol": "2" }] }, { "columns": [{ "symbol": "3" }, { "symbol": "4", "strikeOut": false }] }] });

                expect(cell.options).toBe(15);
                expect(cell.containsOptionAtPosition(0, 0)).toBeTruthy();
                expect(cell.containsOptionAtPosition(1, 0)).toBeTruthy();
                expect(cell.containsOptionAtPosition(0, 1)).toBeTruthy();
                expect(cell.containsOptionAtPosition(1, 1)).toBeTruthy();
                expect(cell.totalOptionsRemaining).toBe(4);
                expect(cell.setMethod).toBeNull();
            });

            it("should have struck out options", function () {
                cell.setJson({ "rows": [{ "columns": [{ "symbol": "1", "strikeOut": true }, { "symbol": "2", "strikeOut": false }] }, { "columns": [{ "symbol": "3" }, { "symbol": "4", "strikeOut": true }] }] });
                expect(cell.json).toEqual({ "rows": [{ "columns": [{ "symbol": "1", "strikeOut": true }, { "symbol": "2", "strikeOut": false }] }, { "columns": [{ "symbol": "3" }, { "symbol": "4", "strikeOut": true }] }] });

                expect(cell.options).toBe(15 - 1 - 8);
                expect(cell.containsOptionAtPosition(0, 0)).toBeFalsy();
                expect(cell.containsOptionAtPosition(1, 0)).toBeTruthy();
                expect(cell.containsOptionAtPosition(0, 1)).toBeTruthy();
                expect(cell.containsOptionAtPosition(1, 1)).toBeFalsy();
                expect(cell.totalOptionsRemaining).toBe(2);
                expect(cell.setMethod).toBeNull();
            });

            it("should be a symbol only", function () {
                cell.setJson({ "symbol": "1" });
                expect(cell.json).toEqual({ "symbol": "1" });
            });

            it("should be set by option to a symbol", function () {
                cell = new Solver.Cell(0, 0);
                cell.setByOption(1, Solver.SetMethod.user);
                expect(cell.json).toEqual({ "symbol": "1", "fixed": false });
            });

            it("should be set by position to a symbol", function () {
                cell = new Solver.Cell(0, 0);
                cell.setByPosition(1, 1, Solver.SetMethod.user);
                expect(cell.json).toEqual({ "symbol": "4", "fixed": false });
            });

            it("should be set by symbol to a symbol", function () {
                cell = new Solver.Cell(0, 0);
                cell.setBySymbol("3", Solver.SetMethod.user);
                expect(cell.json).toEqual({ "symbol": "3", "fixed": false });
            });

            it("should be fixed by option to a symbol", function () {
                cell = new Solver.Cell(0, 0);
                cell.setByOption(1, Solver.SetMethod.loaded);
                expect(cell.json).toEqual({ "symbol": "1", "fixed": true });
            });

            it("should be fixed by position to a symbol", function () {
                cell = new Solver.Cell(0, 0);
                cell.setByPosition(1, 1, Solver.SetMethod.loaded);
                expect(cell.json).toEqual({ "symbol": "4", "fixed": true });
            });

            it("should be fixed by symbol to a symbol", function () {
                cell = new Solver.Cell(0, 0);
                cell.setBySymbol("3", Solver.SetMethod.loaded);
                expect(cell.json).toEqual({ "symbol": "3", "fixed": true });
            });
        });

        describe("Deep copy", function () {
            var copy: Solver.ICell;

            it("should be equal as unmodified", function () {
                copy = new Solver.Cell(cell);
                expect(copy.json).toEqual(cell.json);
            });

            it("should not be equal as only one modified", function () {
                cell.json.rows[0].columns[0].symbol = 'x';
                expect(copy.json).toNotEqual(cell.json);
            });

            it("should be equal as both modified", function () {
                copy.json.rows[0].columns[0].symbol = 'x';
                expect(copy.json).toEqual(cell.json);
            });
        });
    });

    describe("3x3", function () {
        var cell: Solver.ICell;

        describe("Set", function () {
            beforeEach(function () {
                Solver.Cell.Constructor(3, 3);
                cell = new Solver.Cell(0, 0);
            });

            it("should be unmodified", function () {
                expect(cell.options).toBe(Math.pow(2, 3 * 3) - 1);                                  // All options available i.e. 511
                expect(cell.totalOptionsRemaining).toBe(3 * 3);
                expect(cell.solved()).toBeFalsy();                                                  // Not solved
                expect(cell.setMethod).toBeNull();

                expect(cell.containsOptionAtPosition(0, 0)).toBeTruthy();                           // Contains option at (0, 0)
                expect(cell.containsOption(0)).toBeFalsy();                                         // Does not contain option 0
                expect(cell.containsOption(1)).toBeTruthy();                                        // Contains option 1
                expect(cell.containsOption(3)).toBeTruthy();                                        // Contain either option 1 or 2
                expect(cell.containsOptions(3)).toBeTruthy();                                       // Contain both options 1 and 2
            });

            it("should have cell (0, 2) set", function () {
                cell.setByPosition(0, 2, Solver.SetMethod.user);                                    // Set cell to column 0 row 2 i.e. symbol 7, bit 64
                expect(cell.totalOptionsRemaining).toBe(1);
                expect(cell.symbol()).toBe("7");
                expect(cell.solved()).toBeTruthy();
                expect(cell.setMethod).not.toBeNull();

                expect(cell.containsOptionAtPosition(0, 0)).toBeFalsy();
                expect(cell.containsOptionAtPosition(0, 2)).toBeTruthy();
                expect(cell.containsOption(0)).toBeFalsy();
                expect(cell.containsOption(32)).toBeFalsy();
                expect(cell.containsOption(64)).toBeTruthy();
                expect(cell.containsOption(65)).toBeTruthy();                                       // bit 1 or 64
                expect(cell.containsOptions(64)).toBeTruthy();
                expect(cell.containsOptions(65)).toBeFalsy();                                       // bit 1 and 64
            });

            it("should have option 4 set", function () {
                cell.setByOption(4, Solver.SetMethod.user);                                         // Set cell to options 4 i.e. highest of bits 1 and 4
                expect(cell.totalOptionsRemaining).toBe(1);
                expect(cell.symbol()).toBe("3");
                expect(cell.solved()).toBeTruthy();                                                 // Only 1 bit set
                expect(cell.setMethod).not.toBeNull();

                expect(cell.containsOptionAtPosition(0, 0)).toBeFalsy();                            // Only contains bit 4
                expect(cell.containsOptionAtPosition(2, 0)).toBeTruthy();
                expect(cell.containsOptionAtPosition(0, 2)).toBeFalsy();
                expect(cell.containsOption(0)).toBeFalsy();
                expect(cell.containsOption(32)).toBeFalsy();
                expect(cell.containsOption(1)).toBeFalsy();
                expect(cell.containsOption(4)).toBeTruthy();
                expect(cell.containsOption(5)).toBeTruthy();                                        // bit 1 or 4
                expect(cell.containsOption(7)).toBeTruthy();                                        // 1, 2 or 4
                expect(cell.containsOptions(5)).toBeFalsy();
                expect(cell.containsOptions(4)).toBeTruthy();
                expect(cell.containsOptions(7)).toBeFalsy();                                        // bit 1, 2 and 4
            });

            it("should have options reset", function () {
                cell.reset();
                expect(cell.options).toBe(Math.pow(2, 3 * 3) - 1);                                  // All options reset i.e. 511
                expect(cell.totalOptionsRemaining).toBe(3 * 3);
                expect(cell.solved()).toBeFalsy();
                expect(cell.setMethod).toBeNull();
            });
        });

        describe("Options removed", function () {
            it("should have bit 16 removed", function () {
                Solver.Cell.Constructor(3, 3);
                cell = new Solver.Cell(0, 0);

                expect(cell.removeOptionAtPosition(1, 1)).toBeFalsy();                              // Remove option bit = 16 - not last option
                expect(cell.totalOptionsRemaining).toBe(8);
                expect(cell.json).toEqual({
                    rows:
                    [
                        { columns: [{ symbol: '1' }, { symbol: '2' }, { symbol: '3' }] },
                        { columns: [{ symbol: '4' }, { symbol: '5', strikeOut: true }, { symbol: '6' }] },
                        { columns: [{ symbol: '7' }, { symbol: '8' }, { symbol: '9' }] }
                    ]
                });
            });

            it("should have bit 16 already  removed", function () {
                expect(cell.removeOption(16)).toBeFalsy();                                          // Already removed
                expect(cell.totalOptionsRemaining).toBe(8);
            });

            it("should have bits 1 + 2 + 4 removed", function () {
                expect(cell.removeOptions(7)).toBeFalsy();                                          // Removed 4, 2 and 1
                expect(cell.totalOptionsRemaining).toBe(5);
                expect(cell.json).toEqual({
                    rows:
                    [
                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2', strikeOut: true }, { symbol: '3', strikeOut: true }] },
                        { columns: [{ symbol: '4' }, { symbol: '5', strikeOut: true }, { symbol: '6' }] },
                        { columns: [{ symbol: '7' }, { symbol: '8' }, { symbol: '9' }] }
                    ]
                });
            });

            it("should not contain bit 2", function () {
                var options: number = cell.options;                                                 // 488 = 000 101 111
                expect(cell.containsOption(2)).toBeFalsy();
                expect(cell.removeOptionAtPosition(1, 0)).toBeFalsy();                              // 2 already removed
                expect(cell.options).toBe(options);
                expect(cell.totalOptionsRemaining).toBe(5);
            });

            it("should have options removed", function () {
                expect(cell.removedOptionsPerRow(0)).toEqual([0, 1, 2]);                            // 0 0 0    - all removed from row 0
                expect(cell.removedOptionsPerRow(1)).toEqual([1]);                                  // 1 0 1    - only 2nd option removed
                expect(cell.removedOptionsPerRow(2)).toEqual([]);                                   // 1 1 1    - no options removed
            });

            it("should have nothing removed", function () {
                expect(cell.removeOptions(488)).toBeFalsy();                                        // Attempt to remove all
                expect(cell.removeOptions(511)).toBeFalsy();
                expect(cell.totalOptionsRemaining).toBe(5);                                         // Nothing removed
            });

            it("should have bottom row removed", function () {
                expect(cell.removeOptions(256 + 128 + 64)).toBeFalsy();                             // Remove bottom row
                expect(cell.removedOptionsPerRow(2)).toEqual([0, 1, 2]);                            // All removed
                expect(cell.json).toEqual({
                    rows:
                    [
                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2', strikeOut: true }, { symbol: '3', strikeOut: true }] },
                        { columns: [{ symbol: '4' }, { symbol: '5', strikeOut: true }, { symbol: '6' }] },
                        { columns: [{ symbol: '7', strikeOut: true }, { symbol: '8', strikeOut: true }, { symbol: '9', strikeOut: true }] }
                    ]
                });
                expect(cell.totalOptionsRemaining).toBe(2);
                expect(cell.solved()).toBeFalsy();
                expect(cell.setMethod).toBeNull();
            });

            it("should have bit 32 removed leaving bit 8", function () {
                expect(cell.removeOptions(32 + 4 + 2 + 1)).toBeTruthy();                            // Only 32 removed leaving 8 - RETURNS last remaining
                expect(cell.removedOptionsPerRow(1)).toEqual([1, 2]);                               // Only first bit in row left
                expect(cell.json).toEqual({ symbol: '4' });

                expect(cell.totalOptionsRemaining).toBe(1);
                expect(cell.containsOptionAtPosition(0, 1)).toBeTruthy();
                expect(cell.containsOption(8)).toBeTruthy();
                expect(cell.symbol()).toBe("4");
            });

            it("should be solved", function () {
                expect(cell.solved()).toBeTruthy();
                expect(cell.setMethod).not.toBeNull();
            });
        });
    });

    describe("Symbol", function () {
        Solver.Cell.Constructor(6, 6);
        var cell: Solver.ICell = new Solver.Cell(0, 0);        

        describe("Set by option", function () {
            it("should be 1", function () {
                cell.setByOption(1, Solver.SetMethod.user);
                expect(cell.symbol()).toBe("1");
            });

            it("should be 2", function () {
                cell.setByOption(2, Solver.SetMethod.user);                                         // 1 << 1 = 2
                expect(cell.symbol()).toBe("2");
            });

            it("should be A", function () {
                cell.setByOption(1 << 9, Solver.SetMethod.user);
                expect(cell.symbol()).toBe("A");
            });

            it("should be V", function () {
                cell.setByOption(1 << 30, Solver.SetMethod.user);
                expect(cell.symbol()).toBe("V");
            });

            it("should be W", function () {2147483648
                cell.setByOption(2147483648, Solver.SetMethod.user);                                // 1 << 31 over max int size
                expect(cell.symbol()).toBe("W");
            });
        });

        describe("Set by position", function () {
            it("should be Z", function () {
                Solver.Cell.Constructor(6, 6);
                cell.setByPosition(4, 5, Solver.SetMethod.user);
                expect(cell.symbol()).toBe("Z");
            });

            it("should be 0", function () {                                                         // Max symbol
                cell.setByPosition(5, 5, Solver.SetMethod.user);
                expect(cell.symbol()).toBe("0");
            });
        });

        describe("Set by symbol", function () {
            it("should be set to 1", function () {
                cell.setBySymbol("1", Solver.SetMethod.user);
                expect(cell.symbol()).toBe("1");
                expect(cell.solved()).toBeTruthy();
                expect(cell.setMethod).not.toBeNull();
            });

            it("should be symbol", function () {
                var symbols: string = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0";
                for (var index: number; index < symbols.length; index++) {
                    cell.setBySymbol(symbols[index], Solver.SetMethod.user);
                    expect(cell.symbol()).toBe(symbols[index]);
                }
            });
        });
    });
});