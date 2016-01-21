/// <reference path="jasmine.d.ts" />
/// <reference path="../app/Models/SubGrid.ts" />
describe("SubGrid", function () {
    describe("2x4SubGrid", function () {
        it("should have a 2 x 4 sub grid created", function () {
            var columns = 2;
            var rows = 4;
            Solver.SubGrid.Constructor(columns, rows);
            var subGrid = new Solver.SubGrid(0, 0);
            // Ensure a 2 x 4 sub grid created
            var expectedCells = [];
            for (var row = 0; row < rows; row++) {
                expectedCells[row] = [];
                for (var column = 0; column < columns; column++)
                    expectedCells[row][column] = new Solver.Cell(column, row);
            }
            //expect(subGrid).toEqual(expectedCells);
            expect(subGrid.compare(expectedCells)).toBeTruthy();
        });
    });
    describe("4x2SubGrid", function () {
        var columns;
        var rows;
        var subGrid;
        beforeEach(function () {
            columns = 4;
            rows = 2;
            Solver.SubGrid.Constructor(columns, rows);
            subGrid = new Solver.SubGrid(1, 3); // Bottom right Cell of parent grid
        });
        it("should have a 4 x 2 sub grid created", function () {
            var expectedCells = [];
            for (var row = 0; row < rows; row++) {
                expectedCells[row] = [];
                for (var column = 0; column < columns; column++)
                    expectedCells[row][column] = new Solver.Cell(column, row);
            }
            expect(subGrid.compare(expectedCells)).toBeTruthy();
            expect(subGrid.get(0, 0).options).toBe(255);
            expect(subGrid.get(1, 0).options).toBe(255);
            expect(subGrid.get(2, 0).options).toBe(255);
            expect(subGrid.get(3, 0).options).toBe(255);
            expect(subGrid.get(0, 1).options).toBe(255);
            expect(subGrid.get(1, 1).options).toBe(255);
            expect(subGrid.get(2, 1).options).toBe(255);
            expect(subGrid.get(3, 1).options).toBe(255);
        });
        it("should be solved", function () {
            subGrid.setByPosition(0, 0, 0, 0, 1 /* user */);
            subGrid.setByOption(1, 0, 2, 1 /* user */);
            subGrid.setByPosition(2, 0, 2, 0, 0 /* loaded */);
            subGrid.setByOption(3, 0, 4, 0 /* loaded */);
            subGrid.setByOption(0, 1, 8, 0 /* loaded */);
            subGrid.setByPosition(1, 1, 1, 1, 0 /* loaded */);
            subGrid.setByOption(2, 1, 32, 1 /* user */);
            subGrid.setByPosition(3, 1, 3, 1, 1 /* user */);
            expect(subGrid.solved()).toBeTruthy();
        });
    });
    describe("Remove options", function () {
        var columns;
        var rows;
        var subGrid;
        var expectedCells;
        it("should have a 3 x 2 sub grid created", function () {
            columns = 3;
            rows = 2;
            Solver.SubGrid.Constructor(columns, rows);
            subGrid = new Solver.SubGrid(0, 0);
            expectedCells = [];
            for (var row = 0; row < rows; row++) {
                expectedCells[row] = [];
                for (var column = 0; column < columns; column++)
                    expectedCells[row][column] = new Solver.Cell(column, row);
            }
            expect(subGrid.compare(expectedCells)).toBeTruthy();
        });
        it("should have 1 removed from all cells except top left cell", function () {
            // Remove 1 from all cells except top left cell - check 1 removed from other cells
            var removeBit = 1;
            var testColumn = 0;
            var testRow = 0;
            var struckOutCells = subGrid.strikeOutCell(testColumn, testRow, removeBit);
            expect(struckOutCells.lastOptionsFound.length).toBe(0); // No last options found
            var removeFromColumn = struckOutCells.removedOptionsFromColumn; // Remove 1 from columns 2 and 1
            expect(removeFromColumn.length).toBe(2);
            expect(removeFromColumn[0].cellColumn).toBe(2);
            expect(removeFromColumn[0].bits).toBe(removeBit);
            expect(removeFromColumn[1].cellColumn).toBe(1);
            expect(removeFromColumn[1].bits).toBe(removeBit);
            var removeFromRow = struckOutCells.removedOptionsFromRow; // Remove 1 from row 1
            expect(removeFromRow.length).toBe(1);
            expect(removeFromRow[0].cellRow).toBe(removeBit);
            expect(removeFromColumn[0].bits).toBe(removeBit);
            for (var row = 0; row < rows; row++)
                for (var column = 0; column < columns; column++)
                    expectedCells[row][column].removeOption(removeBit);
            expectedCells[testRow][testColumn].reset(); // No options removed
            expect(subGrid.compare(expectedCells)).toBeTruthy();
        });
        it("should also have 2 removed from all cells except top middle cell", function () {
            var removeBit = 2;
            var testColumn = 1;
            var testRow = 0;
            // Remove 2 from all cells except top middle cell - check 1 & 2 removed from other cells
            var struckOutCells = subGrid.strikeOutCell(testColumn, testRow, removeBit);
            expect(struckOutCells.lastOptionsFound.length).toBe(0); // No last options found
            var removeFromColumn = struckOutCells.removedOptionsFromColumn; // Remove 2 from columns 2 and 0
            expect(removeFromColumn.length).toBe(2);
            expect(removeFromColumn[0].cellColumn).toBe(2);
            expect(removeFromColumn[0].bits).toBe(removeBit);
            expect(removeFromColumn[1].cellColumn).toBe(0);
            expect(removeFromColumn[1].bits).toBe(removeBit);
            var removeFromRow = struckOutCells.removedOptionsFromRow; // Remove 2 from row 1
            expect(removeFromRow.length).toBe(1);
            expect(removeFromRow[0].cellRow).toBe(1);
            expect(removeFromColumn[0].bits).toBe(removeBit);
            for (var row = 0; row < rows; row++)
                for (var column = 0; column < columns; column++)
                    expectedCells[row][column].removeOption(removeBit);
            expectedCells[testRow][testColumn].reset();
            expectedCells[testRow][testColumn].removeOption(1); // Remove previous bit
            expect(subGrid.compare(expectedCells)).toBeTruthy();
        });
        it("should have 4 removed from all cells except top right cell", function () {
            // Remove 4 from top right cell
            var removeBit = 4;
            var testColumn = 2;
            var testRow = 0;
            var struckOutCells = subGrid.strikeOutCell(testColumn, testRow, removeBit);
            expect(struckOutCells.lastOptionsFound.length).toBe(0); // No last options found
            var removeFromColumn = struckOutCells.removedOptionsFromColumn; // Remove 4 from columns 1 and 0
            expect(removeFromColumn.length).toBe(2);
            expect(removeFromColumn[0].cellColumn).toBe(1);
            expect(removeFromColumn[0].bits).toBe(removeBit);
            expect(removeFromColumn[1].cellColumn).toBe(0);
            expect(removeFromColumn[1].bits).toBe(removeBit);
            var removeFromRow = struckOutCells.removedOptionsFromRow; // Remove 4 from row 1
            expect(removeFromRow.length).toBe(1);
            expect(removeFromRow[0].cellRow).toBe(1);
            expect(removeFromColumn[0].bits).toBe(removeBit);
            for (var row = 0; row < rows; row++)
                for (var column = 0; column < columns; column++)
                    expectedCells[row][column].removeOption(removeBit);
            expectedCells[testRow][testColumn].reset();
            expectedCells[testRow][testColumn].removeOptions(1 + 2); // Remove previous bits
            expect(subGrid.compare(expectedCells)).toBeTruthy();
        });
        it("should have 8 removed from all cells except bottom left cell", function () {
            // Remove 8 from bottom left cell
            var removeBit = 8;
            var testColumn = 0;
            var testRow = 1;
            var struckOutCells = subGrid.strikeOutCell(testColumn, testRow, removeBit);
            expect(struckOutCells.lastOptionsFound.length).toBe(0); // No last options found
            var removeFromColumn = struckOutCells.removedOptionsFromColumn; // Remove 8 from columns 2 and 1
            expect(removeFromColumn.length).toBe(2);
            expect(removeFromColumn[0].cellColumn).toBe(2);
            expect(removeFromColumn[0].bits).toBe(removeBit);
            expect(removeFromColumn[1].cellColumn).toBe(1);
            expect(removeFromColumn[1].bits).toBe(removeBit);
            var removeFromRow = struckOutCells.removedOptionsFromRow; // Remove 8 from row 0
            expect(removeFromRow.length).toBe(1);
            expect(removeFromRow[0].cellRow).toBe(0);
            expect(removeFromColumn[0].bits).toBe(removeBit);
            for (var row = 0; row < rows; row++)
                for (var column = 0; column < columns; column++)
                    expectedCells[row][column].removeOption(removeBit);
            expectedCells[testRow][testColumn].reset();
            expectedCells[testRow][testColumn].removeOptions(1 + 2 + 4); // Remove previous bits
            expect(subGrid.compare(expectedCells)).toBeTruthy();
        });
        it("should have 16 removed from all cells except bottom middle cell", function () {
            // Remove 16 from bottom middle cell
            var removeBit = 16;
            var testColumn = 1;
            var testRow = 1;
            var struckOutCells = subGrid.strikeOutCell(testColumn, testRow, removeBit);
            var lastOptions = struckOutCells.lastOptionsFound;
            expect(lastOptions.length).toBe(1);
            ;
            expect(lastOptions[0].cellColumn).toBe(2); // (2, 1) must be 6
            expect(lastOptions[0].cellRow).toBe(1);
            expect(lastOptions[0].bits).toBe(32);
            var removeFromColumn = struckOutCells.removedOptionsFromColumn; // Remove 16 from columns 2 and 0
            expect(removeFromColumn.length).toBe(2);
            expect(removeFromColumn[0].cellColumn).toBe(2);
            expect(removeFromColumn[0].bits).toBe(removeBit);
            expect(removeFromColumn[1].cellColumn).toBe(0);
            expect(removeFromColumn[1].bits).toBe(removeBit);
            var removeFromRow = struckOutCells.removedOptionsFromRow; // Remove 16 from row 0
            expect(removeFromRow.length).toBe(1);
            expect(removeFromRow[0].cellRow).toBe(0);
            expect(removeFromColumn[0].bits).toBe(removeBit);
            for (var row = 0; row < rows; row++)
                for (var column = 0; column < columns; column++)
                    expectedCells[row][column].removeOption(removeBit);
            expectedCells[testRow][testColumn].reset(); //
            expectedCells[testRow][testColumn].removeOptions(1 + 2 + 4 + 8); //  i.e. remove 6 from other cells to solve sub grid
            expect(subGrid.compare(expectedCells)).toBeTruthy();
        });
        it("should have 6 set in bottom right cell and solved", function () {
            // Set cells to those in last options found - i.e. 6 = 32 in bottom right cell
            var removeBit = 32;
            var testColumn = 2;
            var testRow = 1;
            expect(subGrid.solved()).toBeFalsy(); // Not solved yet
            expect(subGrid.get(testColumn, testRow).setMethod).not.toBeNull();
            var struckOutCells = subGrid.strikeOutCell(testColumn, testRow, removeBit);
            var lastOptions = struckOutCells.lastOptionsFound;
            expect(lastOptions.length).toBe(5); // A last option was found
            expect(lastOptions[0].cellColumn).toBe(1); // (1, 1) must be 5
            expect(lastOptions[0].cellRow).toBe(1);
            expect(lastOptions[0].bits == 16);
            expect(lastOptions[1].cellColumn).toBe(0); // (0, 1) must be 4
            expect(lastOptions[1].cellRow).toBe(1);
            expect(lastOptions[1].bits).toBe(8);
            expect(lastOptions[2].cellColumn).toBe(2); // (2, 0) must be 3
            expect(lastOptions[2].cellRow).toBe(0);
            expect(lastOptions[2].bits).toBe(4);
            expect(lastOptions[3].cellColumn).toBe(1); // (1, 0) must be 2
            expect(lastOptions[3].cellRow).toBe(0);
            expect(lastOptions[3].bits).toBe(2);
            expect(lastOptions[4].cellColumn).toBe(0); // (0, 0) must be 1
            expect(lastOptions[4].cellRow).toBe(0);
            expect(lastOptions[4].bits).toBe(1);
            expect(struckOutCells.removedOptionsFromColumn.length).toBe(0); // No options to remove from column nor row
            expect(struckOutCells.removedOptionsFromRow.length).toBe(0);
            expect(subGrid.toJson()).toEqual({
                rows: [
                    { columns: [{ symbol: '1' }, { symbol: '2' }, { symbol: '3' }] },
                    { columns: [{ symbol: '4' }, { symbol: '5' }, { symbol: '6' }] }
                ]
            });
            expect(subGrid.solved()).toBeTruthy(); // Sub grid solved
        });
        it("should be solved", function () {
            // Re-check - cells set by their position 
            expectedCells[0][0].setByPosition(0, 0, 1 /* user */); // Cells transposed to sub-grid i.e. n x m -> m x n
            expectedCells[0][1].setByPosition(1, 0, 1 /* user */);
            expectedCells[0][2].setByPosition(0, 1, 1 /* user */);
            expectedCells[1][0].setByPosition(1, 1, 1 /* user */);
            expectedCells[1][1].setByPosition(0, 2, 1 /* user */);
            expectedCells[1][2].setByPosition(1, 2, 1 /* user */);
            expect(subGrid.compare(expectedCells)).toBeTruthy();
        });
    });
    describe("2x2SubGridCells", function () {
        it("should be solved", function () {
            var columns = 2;
            var rows = 2;
            Solver.SubGrid.Constructor(columns, rows);
            var subGrid = new Solver.SubGrid(0, 0);
            // Ensure a 2 x 2 sub grid created
            var expectedCells = [];
            for (var row = 0; row < rows; row++) {
                expectedCells[row] = [];
                for (var column = 0; column < columns; column++)
                    expectedCells[row][column] = new Solver.Cell(column, row);
            }
            expect(subGrid.compare(expectedCells)).toBeTruthy();
            subGrid.setByPosition(0, 0, 0, 0, 1 /* user */); // Top left cell set to 1
            subGrid.setByPosition(1, 0, 1, 0, 1 /* user */); // Top right cell set to 2
            subGrid.setByPosition(0, 1, 0, 1, 1 /* user */); // Bottom left cell set to 4
            expect(subGrid.get(1, 1).options).toBe(15); // Nothing removed from bottom right cell
            expect(subGrid.solved()).toBeFalsy();
            subGrid.simplify();
            expect(subGrid.get(1, 1).options).toBe(8); // Only option 8 (symbol 4) left 
            expect(subGrid.solved()).toBeTruthy();
        });
    });
    describe("2x3SubGridCells", function () {
        it("should be simplified", function () {
            var columns = 2;
            var rows = 3;
            Solver.SubGrid.Constructor(columns, rows);
            var subGrid = new Solver.SubGrid(0, 0);
            // Ensure a 2 x 3 sub grid created
            var expectedCells = [];
            for (var row = 0; row < rows; row++) {
                expectedCells[row] = [];
                for (var column = 0; column < columns; column++)
                    expectedCells[row][column] = new Solver.Cell(column, row);
            }
            expect(subGrid.compare(expectedCells)).toBeTruthy();
            //            expect('ToDo').toBe('Not Finished yet');
            subGrid.get(0, 0).setByPosition(0, 0, 0 /* loaded */); // Top left cell set to 1
            //topLeftSubGrid[0, 0].set(1);
            //topLeftSubGrid[1, 0].set(2);
            //topLeftSubGrid.simplify(); return ICell[][]
        });
    });
    describe("Json", function () {
        describe("1x2", function () {
            var columns = 1;
            var rows = 2;
            var subGrid;
            it("should be setup", function () {
                Solver.SubGrid.Constructor(columns, rows);
                subGrid = new Solver.SubGrid(0, 0);
                expect(subGrid.toJson()).toEqual({
                    rows: [
                        { columns: [{ rows: [{ columns: [{ symbol: '1' }, { symbol: '2' }] }] }] },
                        { columns: [{ rows: [{ columns: [{ symbol: '1' }, { symbol: '2' }] }] }] }
                    ]
                });
            });
            it("should have cell set", function () {
                subGrid.setByOption(0, 0, 1, 1 /* user */);
                expect(subGrid.toJson()).toEqual({
                    rows: [
                        { columns: [{ symbol: '1', fixed: false }] },
                        { columns: [{ rows: [{ columns: [{ symbol: '1' }, { symbol: '2' }] }] }] }
                    ]
                });
            });
            it("should be solved", function () {
                subGrid.simplify();
                expect(subGrid.toJson()).toEqual({
                    rows: [
                        { columns: [{ symbol: '1', fixed: false }] },
                        { columns: [{ symbol: '2' }] }
                    ]
                });
            });
        });
        describe("2x2", function () {
            var columns = 2;
            var rows = 2;
            var subGrid;
            it("should be setup", function () {
                Solver.SubGrid.Constructor(columns, rows);
                subGrid = new Solver.SubGrid(0, 0);
                expect(subGrid.toJson()).toEqual({
                    //#region 2x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                    ]
                                },
                                {
                                    rows: [
                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                    ]
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                    ]
                                },
                                {
                                    rows: [
                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                    ]
                                }
                            ]
                        }
                    ]
                });
            });
            it("should have top left cell set", function () {
                subGrid.setByPosition(0, 0, 0, 0, 1 /* user */);
                expect(subGrid.toJson()).toEqual({
                    //#region 2x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                { symbol: '1', fixed: false },
                                {
                                    rows: [
                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                    ]
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                    ]
                                },
                                {
                                    rows: [
                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                    ]
                                }
                            ]
                        }
                    ]
                });
            });
            it("should have other cells set", function () {
                subGrid.setByOption(1, 0, 2, 0 /* loaded */);
                subGrid.setByPosition(0, 1, 0, 1, 0 /* loaded */);
                expect(subGrid.toJson()).toEqual({
                    rows: [
                        {
                            columns: [
                                { symbol: '1', fixed: false },
                                { symbol: '2', fixed: true }
                            ]
                        },
                        {
                            columns: [
                                { symbol: '3', fixed: true },
                                {
                                    rows: [
                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                    ]
                                }
                            ]
                        }
                    ]
                });
            });
            it("should be solved", function () {
                subGrid.simplify();
                expect(subGrid.toJson()).toEqual({
                    rows: [
                        { columns: [{ symbol: '1', fixed: false }, { symbol: '2', fixed: true }] },
                        { columns: [{ symbol: '3', fixed: true }, { symbol: '4' }] }
                    ]
                });
            });
        });
        describe("Set", function () {
            var columns = 2;
            var rows = 2;
            var subGrid;
            it("should have 1 symbol set", function () {
                Solver.SubGrid.Constructor(columns, rows);
                subGrid = new Solver.SubGrid(0, 0);
                var json = {
                    //#region 2x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                { symbol: '1' },
                                {
                                    rows: [
                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                    ]
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                    ]
                                },
                                {
                                    rows: [
                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                subGrid.setJson(json);
                expect(subGrid.toJson()).toEqual(json);
            });
            it("should be solved", function () {
                var json = {
                    rows: [
                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                    ]
                };
                subGrid.setJson(json);
                expect(subGrid.toJson()).toEqual(json);
                expect(subGrid.solved()).toBeTruthy();
            });
        });
    });
});
//# sourceMappingURL=TestSubGrid.js.map