/// <reference path="jasmine.d.ts" />
/// <reference path="../app/Models/Grid.ts" />
describe("Grid", function () {
    describe("1x2", function () {
        it("should persist save", function () {
            var columns = 1;
            var rows = 2;
            Solver.Grid.Constructor(columns, rows);
            var grid = new Solver.Grid();
            var saved = grid.save();
            expect(saved[0].json).toEqual({
                rows: [
                    { columns: [{ symbol: '1' }] },
                    { columns: [{ symbol: '2' }] }
                ]
            });
            expect(saved[1].json).toEqual({
                rows: [
                    { columns: [{ symbol: '1' }] },
                    { columns: [{ symbol: '2' }] }
                ]
            });
            grid.fixByPosition(0, 0, 0, 0, 0, 0);
            var saved2 = grid.save();
            expect(saved2[0].json).toEqual({ symbol: '1', fixed: true });
            expect(saved2[1].json).toEqual({ symbol: '2' });
            expect(saved[0].json).toEqual({
                rows: [
                    { columns: [{ symbol: '1' }] },
                    { columns: [{ symbol: '2' }] }
                ]
            });
            expect(saved[1].json).toEqual({
                rows: [
                    { columns: [{ symbol: '1' }] },
                    { columns: [{ symbol: '2' }] }
                ]
            });
        });
    });
    describe("4x1", function () {
        it("should be set", function () {
            var columns = 4;
            var rows = 1;
            Solver.Grid.Constructor(columns, rows);
            var grid = new Solver.Grid();
            // Ensure a 1 x 4 grid created
            var expectedSubGrids = [];
            for (var row = 0; row < rows; row++) {
                expectedSubGrids[row] = [];
                for (var column = 0; column < columns; column++)
                    expectedSubGrids[row][column] = new Solver.SubGrid(column, row);
            }
            expect(grid.compare(expectedSubGrids)).toBeTruthy();
        });
    });
    describe("1x4", function () {
        var grid;
        var expectedSubGrids;
        it("should be set", function () {
            var columns = 1;
            var rows = 4;
            Solver.Grid.Constructor(columns, rows);
            grid = new Solver.Grid();
            // Ensure a 4 x 1 grid created
            expectedSubGrids = [];
            for (var row = 0; row < rows; row++) {
                expectedSubGrids[row] = [];
                for (var column = 0; column < columns; column++)
                    expectedSubGrids[row][column] = new Solver.SubGrid(column, row);
            }
            expect(grid.compare(expectedSubGrids)).toBeTruthy();
            var row = rows;
            while (row--)
                while (expectedSubGrids[row].length)
                    expectedSubGrids[row].pop();
            //var expectedCells: Solver.ICell[][] = [];                                               // Columns & rows swopped i.e. 4x1
            //expectedCells[0] = [];
            //expectedCells[0][0] = new Solver.Cell(columns, rows, 0, 0);
            //expectedCells[0][1] = new Solver.Cell(columns, rows, 1, 0);
            //expectedCells[0][2] = new Solver.Cell(columns, rows, 2, 0);
            //expectedCells[0][3] = new Solver.Cell(columns, rows, 3, 0);
            expectedSubGrids[0][0] = new Solver.SubGrid(0, 0);
            expectedSubGrids[1][0] = new Solver.SubGrid(0, 1);
            expectedSubGrids[2][0] = new Solver.SubGrid(0, 2);
            expectedSubGrids[3][0] = new Solver.SubGrid(0, 3);
            expect(grid.compare(expectedSubGrids)).toBeTruthy();
        });
        it("should be solved", function () {
            grid.setByOption(0, 0, 0, 0, 1, 0 /* loaded */); // Set top left cell to 1
            grid.setByOption(0, 1, 0, 0, 2, 0 /* loaded */); // Set next top cell to 2
            grid.setByOption(0, 2, 0, 0, 4, 0 /* loaded */); // Set 3rd cell to 3
            grid.solve();
            //  1 | 2 | 4 | 8 | [ 15 | 15 | 15 ]             1       | [ 14 | 14 | 14 ]
            //  --------------|-----------------       --------------|-----------------
            //  1 | 2 | 4 | 8 | [ 15 | 15 | 15 ]             2       | [ 13 | 13 | 13 ]
            //  --------------|-----------------  ->   --------------|-----------------
            //  1 | 2 | 4 | 8 | [ 15 | 15 | 15 ]             4       | [ 11 | 11 | 11 ]
            //  --------------|-----------------       --------------|-----------------
            //  1 | 2 | 4 | 8 | [ 15 | 15 | 15 ]         |   |   | 8 | [  7 |  7 |  7 ]
            expectedSubGrids[0][0].setByOption(0, 0, 1, 1 /* user */); // Top left cells set to 1, 2, 4 and 8
            expectedSubGrids[1][0].setByOption(0, 0, 2, 1 /* user */);
            expectedSubGrids[2][0].setByOption(0, 0, 4, 1 /* user */);
            expectedSubGrids[3][0].setByOption(0, 0, 8, 1 /* user */);
            expectedSubGrids[0][0].simplify(); // Sets other cells to 14, 13, 11 and 7
            expectedSubGrids[1][0].simplify();
            expectedSubGrids[2][0].simplify();
            expectedSubGrids[3][0].simplify();
            expect(grid.compare(expectedSubGrids)).toBeTruthy();
        });
    });
    describe("2x2", function () {
        var grid;
        var expectedSubGrids;
        var columns = 2;
        var rows = 2;
        it("should be set", function () {
            Solver.Grid.Constructor(columns, rows);
            grid = new Solver.Grid();
            // Ensure a 2 x 2 grid created
            expectedSubGrids = [];
            for (var row = 0; row < rows; row++) {
                expectedSubGrids[row] = [];
                for (var column = 0; column < columns; column++)
                    expectedSubGrids[row][column] = new Solver.SubGrid(column, row);
            }
            expect(grid.compare(expectedSubGrids)).toBeTruthy();
        });
        it("should be simplified", function () {
            grid.fixByPosition(0, 0, 0, 0, 0, 0); // Set top left cell to 1
            grid.fixByPosition(0, 0, 1, 0, 1, 0); // Set top 2nd cell to 2
            grid.fixByPosition(1, 0, 0, 0, 0, 1); // Set top 3rd cell to 3
            //        |       ||       |       |              |       ||       |       |
            //    1   |   2   ||   3   |   4   |          1   |   2   ||   4   |   8   |
            //        |       ||       |       |              |       ||       |       |
            //  --------------||----------------        --------------||----------------
            //    |   |   |   || 1 | 2 | 1 | 2 |              |       ||       |       |
            //  ----- | ----- || ----- | ----- |         12   |  12   ||   3   |   3   |
            //  3 | 4 | 3 | 4 ||   |   |   |   |              |       ||       |       |
            //  ================================    =   --------------||----------------
            //    | 2 | 1 |   || 1 | 2 | 1 | 2 |              |       ||       |       |
            //  ----- | ----- || ----- | ----- |         14   |  13   ||  11   |   7   |
            //  3 | 4 | 3 | 4 ||   | 4 | 3 |   |              |       ||       |       |
            //  --------------||----------------        --------------||----------------
            //    | 2 | 1 |   || 1 | 2 | 1 | 2 |              |       ||       |       |
            //  ----- | ----- || ----- | ----- |         14   |  13   ||  11   |   7   |
            //  3 | 4 | 3 | 4 ||   | 4 | 3 |   |              |       ||       |       |
            // Top left sub-grid
            expectedSubGrids[0][0].setByPosition(0, 0, 0, 0, 1 /* user */); // Top left cell set to 1
            expectedSubGrids[0][0].setByPosition(1, 0, 1, 0, 1 /* user */); // Top right cell set to 2
            expectedSubGrids[0][0].simplify();
            // Top right sub-grid
            expectedSubGrids[0][1].setByPosition(0, 0, 0, 1, 1 /* user */); // Top left cell set to 4
            expectedSubGrids[0][1].setByPosition(1, 0, 1, 1, 1 /* user */); // Top right cell set to 8
            expectedSubGrids[0][1].simplify();
            // Bottom left sub-grid
            expectedSubGrids[1][0].removeOptionsFromColumn(0, 1); // option 1 removed from column 0
            expectedSubGrids[1][0].removeOptionsFromColumn(1, 2);
            // Bottom right sub-grid
            expectedSubGrids[1][1].removeOptionsFromColumn(0, 4);
            expectedSubGrids[1][1].removeOptionsFromColumn(1, 8);
            expect(grid.compare(expectedSubGrids)).toBeTruthy();
        });
        it("should have bottom right sub-grid, top left cell set to 2", function () {
            grid.setByOption(1, 1, 0, 0, 2, 1 /* user */); // Set bottom right sub-grid, top left cell to 2
            grid.simplify();
            //        |       ||       |       |              |       ||       |       |              |       ||       |       |
            //    1   |   2   ||   3   |   4   |          1   |   2   ||   3   |   4   |          1   |   2   ||   3   |   4   |
            //        |       ||       |       |              |       ||       |       |              |       ||       |       |
            //  --------------||----------------        --------------||----------------        --------------||----------------
            //    |   |   |   || 1 | 2 | 1 | 2 |          |   |   |   ||       |       |          |   |   |   ||       |       |
            //  ----- | ----- || ----- | ----- |        ----- | ----- ||   1   |   2   |        ----- | ----- ||   1   |   2   |
            //  3 | 4 | 3 | 4 ||   |   |   |   |        3 | 4 | 3 | 4 ||       |       |        3 | 4 | 3 | 4 ||       |       |
            //  ================================   ->   ================================   ->   ================================
            //    | 2 | 1 |   ||   -   | 1 | 2 |          |   | 1 |   ||       | 1 |   |          |   | 1 |   ||       | 1 |   |
            //  ----- | ----- ||  |2|  | ----- |        ----- | ----- ||   2   | ----- |        ----- | ----- ||   2   | ----- |
            //  3 | 4 | 3 | 4 ||   -   | 3 |   |        3 | 4 | 3 | 4 ||       | 3 |   |        3 | 4 | 3 | 4 ||       | 3 |   |
            //  --------------||----------------        --------------||----------------        --------------||----------------
            //    | 2 | 1 |   || 1 | 2 | 1 | 2 |          | 2 | 1 |   || 1 |   | 1 |   |              | 1 |   ||       | 1 |   |
            //  ----- | ----- || ----- | ----- |        ----- | ----- || ----- | ----- |          2   | ----- ||   4   | ----- |
            //  3 | 4 | 3 | 4 ||   | 4 | 3 |   |        3 |   | 3 |   ||   | 4 | 3 |   |              | 3 |   ||       | 3 |   |
            // Top right sub-grid
            expectedSubGrids[0][1].setByPosition(0, 1, 0, 0, 1 /* user */); // Bottom left cell set to 1
            expectedSubGrids[0][1].setByPosition(1, 1, 1, 0, 1 /* user */); // Bottom right cell set to 2
            // Bottom left sub-grid
            expectedSubGrids[1][0].removeOptionsFromRow(0, 2); // option 2 removed from row 0
            expectedSubGrids[1][0].removeOptionsFromRow(1, 8);
            expectedSubGrids[1][0].setByPosition(0, 1, 1, 0, 1 /* user */);
            // Bottom right sub-grid
            expectedSubGrids[1][1].setByPosition(0, 0, 1, 0, 1 /* user */); // Top left cell set to 2
            expectedSubGrids[1][1].setByPosition(0, 1, 1, 1, 1 /* user */); // Bottom left cell set to 8
            expectedSubGrids[1][1].removeOptionsFromColumn(1, 2); // Remove 2 from 2nd row
            expect(grid.compare(expectedSubGrids)).toBeTruthy();
        });
        it("should have bottom left sub-grid, top right cell set to 3", function () {
            grid.setByOption(0, 1, 1, 0, 4, 1 /* user */); // Set bottom left sub-grid, top right cell to 4 (symbol 3)
            grid.simplify();
            //        |       ||       |       |              |       ||       |       |
            //    1   |   2   ||   3   |   4   |          1   |   2   ||   3   |   4   |
            //        |       ||       |       |              |       ||       |       |
            //  --------------||----------------        --------------||----------------
            //    |   |   |   ||       |       |              |       ||       |       |
            //  ----- | ----- ||   1   |   2   |          3   |   4   ||   1   |   2   |
            //  3 | 4 | 3 | 4 ||       |       |              |       ||       |       |
            //  ================================   ->   ================================
            //    |   |   -   ||       | 1 |   |              |       ||       |       |
            //  ----- |  |3|  ||   2   | ----- |          4   |   3   ||   2   |   1   |
            //  3 | 4 |   -   ||       | 3 |   |              |       ||       |       |
            //  --------------||----------------        --------------||----------------
            //        | 1 |   ||       | 1 |   |              |       ||       |       |
            //    2   | ----- ||   4   | ----- |          2   |   1   ||   4   |   3   |
            //        | 3 |   ||       | 3 |   |              |       ||       |       |
            // Top left sub-grid
            expectedSubGrids[0][0].setByPosition(0, 1, 0, 1, 1 /* user */); // Bottom left cell set to 4
            expectedSubGrids[0][0].setByPosition(1, 1, 1, 1, 1 /* user */); // Bottom right cell set to 8
            // Bottom left sub-grid
            expectedSubGrids[1][0].setByPosition(0, 0, 1, 1, 1 /* user */);
            expectedSubGrids[1][0].setByPosition(1, 0, 0, 1, 1 /* user */);
            expectedSubGrids[1][0].setByPosition(1, 1, 0, 0, 1 /* user */);
            // Bottom right sub-grid
            expectedSubGrids[1][1].setByPosition(1, 0, 0, 0, 1 /* user */);
            expectedSubGrids[1][1].setByPosition(1, 1, 0, 1, 1 /* user */);
            expect(grid.compare(expectedSubGrids)).toBeTruthy();
        });
        it("should be solved", function () {
            grid = new Solver.Grid();
            grid.setByOption(0, 0, 0, 0, 1, 1 /* user */); // 1 |   |   |
            grid.setByOption(0, 0, 1, 1, 2, 1 /* user */); //   | 2 |   |
            grid.setByOption(1, 1, 0, 0, 4, 1 /* user */); //   |   | 3 |
            grid.setByOption(1, 1, 1, 1, 8, 1 /* user */); //   |   |   | 4
            grid.setByOption(1, 0, 1, 0, 2, 1 /* user */); // top right set to 2
            grid.solve();
            expect(grid.solved()).toBeTruthy();
            expect(grid.toJson()).toEqual({
                //#region 2x2 JSON Grid - all cells set
                rows: [
                    {
                        columns: [
                            {
                                rows: [
                                    { columns: [{ symbol: '1', fixed: false }, { symbol: '3' }] },
                                    { columns: [{ symbol: '4' }, { symbol: '2', fixed: false }] }
                                ]
                            },
                            {
                                rows: [
                                    { columns: [{ symbol: '4' }, { symbol: '2', fixed: false }] },
                                    { columns: [{ symbol: '1' }, { symbol: '3' }] }
                                ]
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                rows: [
                                    { columns: [{ symbol: '2' }, { symbol: '4' }] },
                                    { columns: [{ symbol: '3' }, { symbol: '1' }] }
                                ]
                            },
                            {
                                rows: [
                                    { columns: [{ symbol: '3', fixed: false }, { symbol: '1' }] },
                                    { columns: [{ symbol: '2' }, { symbol: '4', fixed: false }] }
                                ]
                            }
                        ]
                    }
                ]
            });
        });
        it("should have fixed cells", function () {
            grid = new Solver.Grid();
            grid.setByOption(0, 0, 0, 0, 1, 0 /* loaded */); // 1 |   |   |
            grid.setByOption(0, 0, 1, 1, 2, 0 /* loaded */); //   | 2 |   |
            grid.setByOption(1, 1, 0, 0, 4, 0 /* loaded */); //   |   | 3 |
            grid.setByOption(1, 1, 1, 1, 8, 0 /* loaded */); //   |   |   | 4
            grid.setByOption(1, 0, 1, 0, 2, 0 /* loaded */); // top right set to 2
            grid.solve();
            expect(grid.solved()).toBeTruthy();
            expect(grid.toJson()).toEqual({
                //#region 2x2 JSON Grid - cells fixed
                rows: [
                    {
                        columns: [
                            {
                                rows: [
                                    { columns: [{ symbol: '1', fixed: true }, { symbol: '3' }] },
                                    { columns: [{ symbol: '4' }, { symbol: '2', fixed: true }] }
                                ]
                            },
                            {
                                rows: [
                                    { columns: [{ symbol: '4' }, { symbol: '2', fixed: true }] },
                                    { columns: [{ symbol: '1' }, { symbol: '3' }] }
                                ]
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                rows: [
                                    { columns: [{ symbol: '2' }, { symbol: '4' }] },
                                    { columns: [{ symbol: '3' }, { symbol: '1' }] }
                                ]
                            },
                            {
                                rows: [
                                    { columns: [{ symbol: '3', fixed: true }, { symbol: '1' }] },
                                    { columns: [{ symbol: '2' }, { symbol: '4', fixed: true }] }
                                ]
                            }
                        ]
                    }
                ]
            });
        });
        it("should load cells", function () {
            grid = new Solver.Grid();
            var saved = grid.save();
            grid.setByOption(0, 0, 0, 0, 1, 0 /* loaded */);
            grid.setByOption(0, 0, 1, 1, 2, 0 /* loaded */);
            grid.setByOption(1, 1, 0, 0, 4, 0 /* loaded */);
            grid.setByOption(1, 1, 1, 1, 8, 0 /* loaded */);
            grid.setByOption(1, 0, 1, 0, 2, 1 /* user */);
            expect(grid.solve()).toBeTruthy();
            var current = grid.save();
            for (var row = 0; row < rows; row++)
                for (var column = 0; column < columns; column++)
                    expect(current[row * columns + column].json).toNotEqual(saved[row * columns + column].json);
            //grid.load(saved);
            //expect(grid.solve()).toBeFalsy();
            //current = grid.save();
            //for (var row: number = 0; row < rows; row++)
            //    for (var column: number = 0; column < columns; column++)
            //        expect(current[row * columns + column].json).toEqual(saved[row * columns + column].json);
        });
        it("should save cells", function () {
            var saved = grid.save();
            for (var row = 0; row < rows; row++)
                for (var column = 0; column < columns; column++)
                    expect(grid.save()[row * columns + column].json).toEqual(saved[row * columns + column].json);
        });
        it("should eliminate cell", function () {
            grid = new Solver.Grid();
            grid.setByOption(0, 0, 0, 0, 1, 0 /* loaded */); // 1 |   |   |
            grid.setByOption(0, 0, 1, 1, 2, 0 /* loaded */); //   | 2 |   |
            grid.setByOption(1, 1, 0, 0, 2, 0 /* loaded */); //   |   | 2 |
            grid.setByOption(1, 1, 1, 1, 4, 0 /* loaded */); //   |   |   | 3
            //    -   |   |   ||   |   |       |
            //   |1|  | ----- || ----- |   2   |
            //    -   | 3 | 4 || 3 | 4 |       |
            //  --------------||----------------
            //    |   |   -   || 1 |   | 1 |   |
            //  ----- |  |2|  || ----- | ----- |
            //  3 | 4 |   -   || 3 | 4 |   | 4 |
            //  ================================
            //    |   | 1 |   ||   -   | 1 |   |
            //  ----- | ----- ||  |2|  | ----- |
            //  3 | 4 | 3 | 4 ||   -   |   | 4 |
            //  --------------||----------------
            //        | 1 |   || 1 |   |   -   |
            //    2   | ----- || ----- |  |3|  |
            //        |   | 4 ||   | 4 |   -   |
            expect(false).toBeTruthy();
            // Check that solve() == above
            // Eliminate should remove (1, 0, 0, 1, "4") i.e. invalid option
        });
    });
    describe("4x2", function () {
        var grid;
        var expectedSubGrids;
        it("should be set", function () {
            var columns = 4;
            var rows = 2;
            Solver.Grid.Constructor(columns, rows);
            grid = new Solver.Grid();
            // Ensure a 4 x 2 grid created
            expectedSubGrids = [];
            for (var row = 0; row < rows; row++) {
                expectedSubGrids[row] = [];
                for (var column = 0; column < columns; column++)
                    expectedSubGrids[row][column] = new Solver.SubGrid(column, row);
            }
            expect(grid.compare(expectedSubGrids)).toBeTruthy();
        });
        it("should be solved", function () {
            grid.setByOption(0, 0, 1, 0, 128, 0 /* loaded */); //  1 |   | 3 |   |               || 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 || 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 ||               |   | 2 |   | 4 
            grid.setByOption(0, 0, 0, 1, 64, 0 /* loaded */); // ---------------|       8       ||---------------|---------------|| --------------|---------------||       5       |---------------
            grid.setByOption(0, 0, 1, 2, 32, 0 /* loaded */); //    |   |   |   |               ||   | 6 | 7 |   |   | 6 | 7 |   ||   | 6 | 7 |   |   | 6 | 7 |   ||               |   |   |   |   
            grid.setByOption(0, 0, 0, 3, 16, 0 /* loaded */); // -------------------------------||-------------------------------|| ------------------------------||-------------------------------
            //                |   | 2 |   | 4 || 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 || 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 || 1 |   | 3 |   |               
            grid.fixByPosition(0, 1, 0, 0, 3, 0); //        7       | ------------- ||---------------|---------------|| --------------|---------------||---------------|       6       
            grid.fixByPosition(0, 1, 1, 1, 2, 0); //                |   |   |   |   || 5 |   |   | 8 | 5 |   |   | 8 || 5 |   |   | 8 | 5 |   |   | 8 ||   |   |   |   |               
            grid.fixByPosition(0, 1, 0, 2, 1, 0); // ---------------|---------------||---------------|---------------|| --------------|---------------||---------------|---------------
            grid.fixByPosition(0, 1, 1, 3, 0, 0); //  1 |   | 3 |   |               || 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 || 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 ||               |   | 2 |   | 4                                  
            // ---------------|       6       ||---------------|---------------|| --------------|---------------||       7       |---------------
            grid.fixByPosition(3, 0, 0, 0, 0, 1); //    |   |   |   |               || 5 |   |   | 8 | 5 |   |   | 8 || 5 |   |   | 8 | 5 |   |   | 8 ||               |   |   |   |   
            grid.fixByPosition(3, 0, 1, 1, 1, 1); // -------------------------------||-------------------------------|| ------------------------------||-------------------------------
            grid.fixByPosition(3, 0, 0, 2, 2, 1); //                |   | 2 |   | 4 || 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 || 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 || 1 |   | 3 |   |               
            grid.fixByPosition(3, 0, 1, 3, 3, 1); //        5       | ------------- ||---------------|---------------|| --------------|---------------||---------------|       8       
            //                |   |   |   |   ||   | 6 | 7 |   |   | 6 | 7 |   ||   | 6 | 7 |   |   | 6 | 7 |   ||   |   |   |   |               
            grid.setByOption(3, 1, 1, 0, 1, 0 /* loaded */); // ==================================================================================================================================
            grid.setByOption(3, 1, 0, 1, 2, 0 /* loaded */); //                |   |   |   |   ||   | 2 | 3 |   |   | 2 | 3 |   ||   | 2 | 3 |   |   | 2 | 3 |   ||   |   |   |   |               
            grid.setByOption(3, 1, 1, 2, 4, 0 /* loaded */); //        4       |---------------||---------------|---------------|| --------------|---------------||---------------|       1       
            grid.setByOption(3, 1, 0, 3, 8, 0 /* loaded */); //                | 5 |   | 7 |   || 5 | 6 | 7 | 8 | 5 | 6 | 7 | 8 || 5 | 6 | 7 | 8 | 5 | 6 | 7 | 8 ||   | 6 |   | 8 |               
            // -------------------------------||-------------------------------|| ------------------------------||-------------------------------
            //    |   |   |   |               || 1 |   |   | 4 | 1 |   |   | 4 || 1 |   |   | 4 | 1 |   |   | 4 ||               |   |   |   |   
            // ---------------|       3       ||---------------|---------------|| --------------|---------------||       2       |---------------
            //    | 6 |   | 8 |               || 5 | 6 | 7 | 8 | 5 | 6 | 7 | 8 || 5 | 6 | 7 | 8 | 5 | 6 | 7 | 8 ||               | 5 |   | 7 |   
            // ---------------|---------------||---------------|---------------|| --------------|---------------||---------------|---------------
            //                |   |   |   |   || 1 |   |   | 4 | 1 |   |   | 4 || 1 |   |   | 4 | 1 |   |   | 4 ||   |   |   |   |               
            //        2       |---------------||---------------|---------------|| --------------|---------------||---------------|       3       
            //                | 5 |   | 7 |   || 5 | 6 | 7 | 8 | 5 | 6 | 7 | 8 || 5 | 6 | 7 | 8 | 5 | 6 | 7 | 8 ||   | 6 |   | 8 |               
            // -------------------------------||-------------------------------|| ------------------------------||-------------------------------
            //    |   |   |   |               ||   | 2 | 3 |   |   | 2 | 3 |   ||   | 2 | 3 |   |   | 2 | 3 |   ||               |   |   |   |   
            // ---------------|       1       ||---------------|---------------|| --------------|---------------||       4       |---------------
            //    | 6 |   | 8 |               || 5 | 6 | 7 | 8 | 5 | 6 | 7 | 8 || 5 | 6 | 7 | 8 | 5 | 6 | 7 | 8 ||               | 5 |   | 7 |   
            expectedSubGrids[0][0].get(0, 0).options = 1 + 4;
            expectedSubGrids[0][0].get(1, 0).options = 128;
            expectedSubGrids[0][0].get(0, 1).options = 64;
            expectedSubGrids[0][0].get(1, 1).options = 2 + 8;
            expectedSubGrids[0][0].get(0, 2).options = 1 + 4;
            expectedSubGrids[0][0].get(1, 2).options = 32;
            expectedSubGrids[0][0].get(0, 3).options = 16;
            expectedSubGrids[0][0].get(1, 3).options = 2 + 8;
            expectedSubGrids[0][1].get(0, 0).options = 1 + 2 + 4 + 8 + 32 + 64;
            expectedSubGrids[0][1].get(1, 0).options = 1 + 2 + 4 + 8 + 32 + 64;
            expectedSubGrids[0][1].get(0, 1).options = 1 + 2 + 4 + 8 + 16 + 128;
            expectedSubGrids[0][1].get(1, 1).options = 1 + 2 + 4 + 8 + 16 + 128;
            expectedSubGrids[0][1].get(0, 2).options = 1 + 2 + 4 + 8 + 16 + 128;
            expectedSubGrids[0][1].get(1, 2).options = 1 + 2 + 4 + 8 + 16 + 128;
            expectedSubGrids[0][1].get(0, 3).options = 1 + 2 + 4 + 8 + 32 + 64;
            expectedSubGrids[0][1].get(1, 3).options = 1 + 2 + 4 + 8 + 32 + 64;
            expectedSubGrids[0][2].get(0, 0).options = 1 + 2 + 4 + 8 + 32 + 64;
            expectedSubGrids[0][2].get(1, 0).options = 1 + 2 + 4 + 8 + 32 + 64;
            expectedSubGrids[0][2].get(0, 1).options = 1 + 2 + 4 + 8 + 16 + 128;
            expectedSubGrids[0][2].get(1, 1).options = 1 + 2 + 4 + 8 + 16 + 128;
            expectedSubGrids[0][2].get(0, 2).options = 1 + 2 + 4 + 8 + 16 + 128;
            expectedSubGrids[0][2].get(1, 2).options = 1 + 2 + 4 + 8 + 16 + 128;
            expectedSubGrids[0][2].get(0, 3).options = 1 + 2 + 4 + 8 + 32 + 64;
            expectedSubGrids[0][2].get(1, 3).options = 1 + 2 + 4 + 8 + 32 + 64;
            expectedSubGrids[0][3].get(0, 0).options = 16;
            expectedSubGrids[0][3].get(1, 0).options = 2 + 8;
            expectedSubGrids[0][3].get(0, 1).options = 1 + 4;
            expectedSubGrids[0][3].get(1, 1).options = 32;
            expectedSubGrids[0][3].get(0, 2).options = 64;
            expectedSubGrids[0][3].get(1, 2).options = 2 + 8;
            expectedSubGrids[0][3].get(0, 3).options = 1 + 4;
            expectedSubGrids[0][3].get(1, 3).options = 128;
            expectedSubGrids[1][0].get(0, 0).options = 8;
            expectedSubGrids[1][0].get(1, 0).options = 16 + 64;
            expectedSubGrids[1][0].get(0, 1).options = 32 + 128;
            expectedSubGrids[1][0].get(1, 1).options = 4;
            expectedSubGrids[1][0].get(0, 2).options = 2;
            expectedSubGrids[1][0].get(1, 2).options = 16 + 64;
            expectedSubGrids[1][0].get(0, 3).options = 32 + 128;
            expectedSubGrids[1][0].get(1, 3).options = 1;
            expectedSubGrids[1][1].get(0, 0).options = 2 + 4 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][1].get(1, 0).options = 2 + 4 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][1].get(0, 1).options = 1 + 8 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][1].get(1, 1).options = 1 + 8 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][1].get(0, 2).options = 1 + 8 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][1].get(1, 2).options = 1 + 8 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][1].get(0, 3).options = 2 + 4 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][1].get(1, 3).options = 2 + 4 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][2].get(0, 0).options = 2 + 4 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][2].get(1, 0).options = 2 + 4 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][2].get(0, 1).options = 1 + 8 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][2].get(1, 1).options = 1 + 8 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][2].get(0, 2).options = 1 + 8 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][2].get(1, 2).options = 1 + 8 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][2].get(0, 3).options = 2 + 4 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][2].get(1, 3).options = 2 + 4 + 16 + 32 + 64 + 128;
            expectedSubGrids[1][3].get(0, 0).options = 32 + 128;
            expectedSubGrids[1][3].get(1, 0).options = 1;
            expectedSubGrids[1][3].get(0, 1).options = 2;
            expectedSubGrids[1][3].get(1, 1).options = 16 + 64;
            expectedSubGrids[1][3].get(0, 2).options = 32 + 128;
            expectedSubGrids[1][3].get(1, 2).options = 4;
            expectedSubGrids[1][3].get(0, 3).options = 8;
            expectedSubGrids[1][3].get(1, 3).options = 16 + 64;
            expect(grid.compare(expectedSubGrids)).toBeTruthy();
            expect(grid.solve()).toBeFalsy(); // Should modify grid i.e. remove options
            expect(grid.simplify()).toBeFalsy();
            expect(grid.compare(expectedSubGrids)).toBeTruthy();
            var cells = [];
            cells[0] = [];
            cells[1] = [];
            cells[2] = [];
            cells[3] = [];
            cells[0][0] = new Solver.Cell(0, 0);
            cells[0][1] = new Solver.Cell(1, 0);
            cells[1][0] = new Solver.Cell(0, 1);
            cells[1][1] = new Solver.Cell(1, 1);
            cells[2][0] = new Solver.Cell(0, 2);
            cells[2][1] = new Solver.Cell(1, 2);
            cells[3][0] = new Solver.Cell(0, 3);
            cells[3][1] = new Solver.Cell(1, 3);
            cells[0][0].options = 1 | 4;
            cells[0][1].options = 128;
            cells[1][0].options = 64;
            cells[1][1].options = 2 | 8;
            cells[2][0].options = 1 | 4;
            cells[2][1].options = 32;
            cells[3][0].options = 16;
            cells[3][1].options = 2 | 8;
            expect(grid.get(0, 0).compare(cells)).toBeTruthy();
            cells[0][0].options = 1 + 2 + 4 + 8 + 32 + 64;
            cells[0][1].options = 1 + 2 + 4 + 8 + 32 + 64;
            cells[1][0].options = 1 + 2 + 4 + 8 + 16 + 128;
            cells[1][1].options = 1 + 2 + 4 + 8 + 16 + 128;
            cells[2][0].options = 1 + 2 + 4 + 8 + 16 + 128;
            cells[2][1].options = 1 + 2 + 4 + 8 + 16 + 128;
            cells[3][0].options = 1 + 2 + 4 + 8 + 32 + 64;
            cells[3][1].options = 1 + 2 + 4 + 8 + 32 + 64;
            expect(grid.get(1, 0).compare(cells)).toBeTruthy();
            expect(grid.get(2, 0).compare(cells)).toBeTruthy();
            cells[0][0].options = 16;
            cells[0][1].options = 2 + 8;
            cells[1][0].options = 1 + 4;
            cells[1][1].options = 32;
            cells[2][0].options = 64;
            cells[2][1].options = 2 + 8;
            cells[3][0].options = 1 + 4;
            cells[3][1].options = 128;
            expect(grid.get(3, 0).compare(cells)).toBeTruthy();
        });
    });
    describe("Json", function () {
        describe("1x2", function () {
            var columns = 1;
            var rows = 2;
            var grid;
            it("should be setup", function () {
                Solver.Grid.Constructor(columns, rows);
                grid = new Solver.Grid();
                expect(grid.toJson()).toEqual({
                    //#region 1x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }] },
                                                        { columns: [{ symbol: '2' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }] },
                                                        { columns: [{ symbol: '2' }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }] },
                                                        { columns: [{ symbol: '2' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }] },
                                                        { columns: [{ symbol: '2' }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });
            });
            it("should be solved", function () {
                grid.setByOption(0, 0, 0, 0, 1, 1 /* user */);
                expect(grid.toJson()).toEqual({
                    rows: [
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '1', "fixed": false }, { symbol: '2' }] }
                                    ]
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '2' }, { symbol: '1' }] }
                                    ]
                                }
                            ]
                        }
                    ]
                });
            });
        });
        describe("2x2", function () {
            var columns = 2;
            var rows = 2;
            var grid;
            it("should be setup", function () {
                Solver.Grid.Constructor(columns, rows);
                grid = new Solver.Grid();
                expect(grid.toJson()).toEqual({
                    //#region 2x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                {
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
                                },
                                {
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
                                }
                            ]
                        },
                        {
                            columns: [
                                {
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
                                },
                                {
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
                                }
                            ]
                        }
                    ]
                });
            });
            it("should have top left cell set to 1", function () {
                grid.fixByPosition(0, 0, 0, 0, 0, 0);
                expect(grid.toJson()).toEqual({
                    //#region 2x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                {
                                    rows: [
                                        {
                                            columns: [
                                                { symbol: '1', fixed: true },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
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
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
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
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
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
                                },
                                {
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
                                }
                            ]
                        }
                    ]
                });
            });
            it("should have second top left cell set to 2", function () {
                grid.fixByPosition(0, 0, 1, 0, 1, 0);
                expect(grid.toJson()).toEqual({
                    //#region 2x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                {
                                    rows: [
                                        {
                                            columns: [
                                                { symbol: '1', fixed: true },
                                                { symbol: '2', fixed: true }
                                            ]
                                        },
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2', strikeOut: true }] },
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
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
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
                                }
                            ]
                        }
                    ]
                });
            });
            it("should have top left sub grid solved", function () {
                grid.setByOption(0, 0, 0, 1, 4, 1 /* user */);
                expect(grid.toJson()).toEqual({
                    //#region 2x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '1', fixed: true }, { symbol: '2', fixed: true }] },
                                        { columns: [{ symbol: '3', fixed: false }, { symbol: '4' }] }
                                    ]
                                },
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2', strikeOut: true }] },
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
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
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
                                }
                            ]
                        }
                    ]
                });
            });
            it("should have top grid row set", function () {
                grid.setByOption(1, 0, 0, 0, 4, 0 /* loaded */);
                expect(grid.toJson()).toEqual({
                    //#region 2x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '1', fixed: true }, { symbol: '2', fixed: true }] },
                                        { columns: [{ symbol: '3', fixed: false }, { symbol: '4' }] }
                                    ]
                                },
                                {
                                    rows: [
                                        { columns: [{ symbol: '3', fixed: true }, { symbol: '4' }] },
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });
            });
            it("should have top right grid solved", function () {
                grid.setByOption(1, 0, 0, 1, 1, 1 /* user */);
                expect(grid.toJson()).toEqual({
                    //#region 2x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '1', fixed: true }, { symbol: '2', fixed: true }] },
                                        { columns: [{ symbol: '3', fixed: false }, { symbol: '4' }] }
                                    ]
                                },
                                {
                                    rows: [
                                        { columns: [{ symbol: '3', fixed: true }, { symbol: '4' }] },
                                        { columns: [{ symbol: '1', fixed: false }, { symbol: '2' }] }
                                    ]
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3', strikeOut: true }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });
            });
            it("should have left grid row set", function () {
                grid.setByOption(0, 1, 0, 0, 2, 1 /* user */);
                expect(grid.toJson()).toEqual({
                    //#region 2x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '1', fixed: true }, { symbol: '2', fixed: true }] },
                                        { columns: [{ symbol: '3', fixed: false }, { symbol: '4' }] }
                                    ]
                                },
                                {
                                    rows: [
                                        { columns: [{ symbol: '3', fixed: true }, { symbol: '4' }] },
                                        { columns: [{ symbol: '1', fixed: false }, { symbol: '2' }] }
                                    ]
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        {
                                            columns: [
                                                { symbol: '2', fixed: false },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            columns: [
                                                { symbol: '4' },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    rows: [
                                        {
                                            columns: [
                                                { symbol: '4' },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            columns: [
                                                { symbol: '2' },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1' }, { symbol: '2', strikeOut: true }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4', strikeOut: true }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });
            });
            it("should be solved", function () {
                grid.fixByPosition(0, 1, 1, 0, 0, 1);
                expect(grid.toJson()).toEqual({
                    //#region 2x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '1', fixed: true }, { symbol: '2', fixed: true }] },
                                        { columns: [{ symbol: '3', fixed: false }, { symbol: '4' }] }
                                    ]
                                },
                                {
                                    rows: [
                                        { columns: [{ symbol: '3', fixed: true }, { symbol: '4' }] },
                                        { columns: [{ symbol: '1', fixed: false }, { symbol: '2' }] }
                                    ]
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '2', fixed: false }, { symbol: '3', fixed: true }] },
                                        { columns: [{ symbol: '4' }, { symbol: '1' }] }
                                    ]
                                },
                                {
                                    rows: [
                                        { columns: [{ symbol: '4' }, { symbol: '1' }] },
                                        { columns: [{ symbol: '2' }, { symbol: '3' }] }
                                    ]
                                }
                            ]
                        }
                    ]
                });
            });
        });
        describe("Set", function () {
            var columns = 2;
            var rows = 2;
            var grid;
            beforeEach(function () {
                Solver.Grid.Constructor(columns, rows);
                grid = new Solver.Grid();
            });
            it("should have 1 symbol set", function () {
                var json = {
                    //#region 2x2 JSON Grid
                    rows: [
                        {
                            columns: [
                                {
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
                                },
                                {
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
                                }
                            ]
                        },
                        {
                            columns: [
                                {
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
                                },
                                {
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
                                }
                            ]
                        }
                    ]
                };
                grid.setJson(json);
                expect(grid.toJson()).toEqual(json);
            });
            it("should have options struck out", function () {
                grid.setJson({
                    //#region 2x2 JSON Grid - top left sub grid, top left cell set to 1
                    rows: [
                        {
                            columns: [
                                {
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
                                },
                                {
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
                                }
                            ]
                        },
                        {
                            columns: [
                                {
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
                                },
                                {
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
                                }
                            ]
                        }
                    ]
                });
                expect(grid.toJson()).toEqual({
                    //#region 2x2 JSON Grid - option 1 struck out from all top left sub grid cells and left column and top row
                    rows: [
                        {
                            columns: [
                                {
                                    rows: [
                                        {
                                            columns: [
                                                { symbol: '1' },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
                                                        { columns: [{ symbol: '3' }, { symbol: '4' }] }
                                                    ]
                                                },
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
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
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        {
                                            columns: [
                                                {
                                                    rows: [
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
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
                                                        { columns: [{ symbol: '1', strikeOut: true }, { symbol: '2' }] },
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
                                },
                                {
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
                                }
                            ]
                        }
                    ]
                });
            });
            it("should be solved", function () {
                var json = {
                    //#region 2x2 JSON Grid - all cells set
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
                                        { columns: [{ symbol: '3' }, { symbol: '4' }] },
                                        { columns: [{ symbol: '1' }, { symbol: '2' }] }
                                    ]
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    rows: [
                                        { columns: [{ symbol: '2' }, { symbol: '3' }] },
                                        { columns: [{ symbol: '4' }, { symbol: '1' }] }
                                    ]
                                },
                                {
                                    rows: [
                                        { columns: [{ symbol: '4' }, { symbol: '1' }] },
                                        { columns: [{ symbol: '2' }, { symbol: '3' }] }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                grid.setJson(json);
                expect(grid.toJson()).toEqual(json);
                expect(grid.solved()).toBeTruthy();
            });
        });
    });
    describe("Valid", function () {
        var grid;
        beforeEach(function () {
            var columns = 2;
            var rows = 2;
            Solver.Grid.Constructor(columns, rows);
            grid = new Solver.Grid();
        });
        it("should have unmodified valid", function () {
            expect(grid.isValid()).toBeTruthy();
        });
        it("should have modified valid", function () {
            grid.setByOption(0, 0, 0, 0, 1, 1 /* user */); // 1 |   |   |
            grid.setByOption(0, 0, 1, 1, 2, 1 /* user */); //   | 2 |   |
            grid.setByOption(1, 1, 0, 0, 4, 1 /* user */); //   |   | 3 |
            grid.setByOption(1, 1, 1, 1, 8, 1 /* user */); //   |   |   | 4
            expect(grid.isValid()).toBeTruthy();
        });
        it("should have solved valid", function () {
            grid.setByOption(0, 0, 0, 0, 1, 1 /* user */);
            grid.setByOption(0, 0, 1, 1, 2, 1 /* user */);
            grid.setByOption(1, 1, 0, 0, 4, 1 /* user */);
            grid.setByOption(1, 1, 1, 1, 8, 1 /* user */);
            grid.setByOption(1, 0, 1, 0, 2, 1 /* user */); // top right set to 2
            grid.solve();
            expect(grid.solved()).toBeTruthy();
            expect(grid.isValid()).toBeTruthy();
        });
        it("should not be valid", function () {
            grid.setByOption(0, 0, 0, 0, 1, 1 /* user */); // Set top left and top right cells to 1
            grid.setByOption(1, 0, 1, 0, 1, 1 /* user */);
            expect(grid.isValid()).toBeFalsy();
        });
    });
});
//# sourceMappingURL=TestGrid.js.map