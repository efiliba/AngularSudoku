/// <reference path="Cell.ts" />

module Solver {
    export interface IOption {
        subGridColumn: number;
        subGridRow: number;
        cellColumn: number;
        cellRow: number;
        bits: number;
    }

    // Arrays of last options found and options removed from all columns / rows in the sub grid
    export interface IStruckOutCells {
        lastOptionsFound: IOption[];
        removedOptionsFromColumn: IOption[];
        removedOptionsFromRow: IOption[];
    }

    export interface IJsonSubGridRow {
        columns: IJsonCell[];
    }

    export interface IJsonSubGrid {
        rows: IJsonSubGridRow[];
    }

    export interface ISubGrid {
        reset();
        get(column: number, row: number): ICell;
        toJson(): IJsonSubGrid;
        setJson(json: IJsonSubGrid);
        setByPosition(column: number, row: number, optionColumn: number, optionRow: number, setMethod: SetMethod): boolean;
        setByOption(column: number, row: number, option: number, setMethod: SetMethod): boolean;
        setBySymbol(column: number, row: number, symbol: string, setMethod: SetMethod): number;
        compare(items: ICell[][]): boolean;
        simplify();

        solved(): boolean;
        getAvailableOptionsMatrix(): number[][];
        getCellsMatrix(): ICell[][];
        getUnsetCells(): ICell[];
        unsetCells(totalUnsetOptions: number): ICell[];
        getAvailableOptions(): number[];
        strikeOutCell(cellColumn: number, cellRow: number, option: number): IStruckOutCells;
        isStruckOut(cellColumn: number, cellRow: number, symbol: string): boolean;
        removeOptionsFromColumn(cellColumn: number, options: number): IOption[];
        removeOptionsFromRow(cellRow: number, options: number): IOption[];
        removeOptionsExceptFromColumn(excludeColumn: number, options: number): IOption[];
        removeOptionsExceptFromRow(excludeRow: number, options: number): IOption[];
        removeIfExtraOptionsFromColumn(column: number, options: number): IOption[];
        removeIfExtraOptionsFromRow(row: number, options: number): IOption[];
        removeIfExtraOptions(options: number): IOption[];
        optionExistsInColumn(column: number, option: number): boolean;
        optionExistsInRow(row: number, option: number): boolean;
        optionRemovedFromColumn(cellColumn: number, cellRow: number, option: number): boolean;
        optionRemovedFromRow(cellColumn: number, cellRow: number, removedOption: number): boolean;
        setCells(subGrid: ICell[][]);
    }

    export class SubGrid implements ISubGrid {
        private static columns: number;
        private static rows: number;

        private cells: ICell[][];                                                                   // Jagged array used for efficiency ???
//        private remainingCells: number;                                                             // Track how many unset cells are left

        static Constructor(columns: number, rows: number) {
            Cell.Constructor(rows, columns);                                                        // Swop columns and rows
            SubGrid.columns = columns;
            SubGrid.rows = rows;
        }

        constructor(public column: number, public row: number) {
            this.reset();
        }

        public reset() {
            this.cells = [];
            for (var row: number = 0; row < SubGrid.rows; row++) {
                this.cells[row] = [];
                for (var column: number = 0; column < SubGrid.columns; column++)
                    this.cells[row][column] = new Cell(column, row);
            }

//            this.remainingCells = SubGrid.columns * SubGrid.rows;
        }

        public get(column: number, row: number): ICell {                                            // grids called by [column, row] but accessed by [row][column] for efficiency
            return this.cells[row][column];
        }                                                      

        public toJson(): IJsonSubGrid {
            var json: IJsonSubGrid = { rows: [] };
            for (var row: number = 0; row < SubGrid.rows; row++) {
                var jsonCells: IJsonCell[] = [];
                for (var column: number = 0; column < SubGrid.columns; column++)
                    jsonCells.push(this.cells[row][column].json);
                json.rows.push({ columns: jsonCells });
            }

            return json;
        }

        public setJson(json: IJsonSubGrid) {
//            this.remainingCells = SubGrid.columns * SubGrid.rows;

            for (var row: number = 0; row < json.rows.length; row++) {
                var columns: IJsonCell[] = json.rows[row].columns;
                for (var column = 0; column < columns.length; column++) {
                    this.cells[row][column].setJson(columns[column]);
//                    if (this.cells[row][column].isSet)
//                        this.remainingCells--;
                }
            }
        }

        public setByPosition(column: number, row: number, optionColumn: number, optionRow: number, setMethod: SetMethod): boolean {
            var cell: ICell = this.cells[row][column];
            if (!cell.setMethod) {                                                                  // cell unset i.e. == SetMethod.unset
                cell.setByPosition(optionColumn, optionRow, setMethod);
                return true;
//                this.remainingCells--;
            }
            else
                return false;
        }

        public setByOption(column: number, row: number, option: number, setMethod: SetMethod): boolean {
            var cell: ICell = this.cells[row][column];
            if (!cell.setMethod) {
                cell.setByOption(option, setMethod);
                return true;
//                this.remainingCells--;
            }
            else
                return false;
        }

        public setBySymbol(column: number, row: number, symbol: string, setMethod: SetMethod): number {
            var cell: ICell = this.cells[row][column];
            if (!cell.setMethod) {                                                                  // cell unset i.e. == SetMethod.unset
                cell.setBySymbol(symbol, setMethod);
                return cell.options;
//                this.remainingCells--;
            }
            else
                return 0;
        }

        public compare(items: ICell[][]): boolean {
            var match: boolean = true;
            var row: number = SubGrid.rows;
            while (match && row--) {
                var column: number = SubGrid.columns;
                while (match && column--)
                    match = this.cells[row][column].equale(items[row][column]);
            }

            return match;
        }

        public simplify() {
            var changed: boolean = true;
            while (changed /*&& this.remainingCells > 0*/) {
                changed = false;

                var row: number = SubGrid.rows;
                while (!changed && row--) {
                    var column: number = SubGrid.columns;
                    while (!changed && column--)
                        changed = this.cells[row][column].setMethod && this.removeIfExtraOptions(this.cells[row][column].options).length > 0;   // cell set i.e. != SetMethod.unset
                }
            }
        }

        public solved(): boolean {
            var solved: boolean = true;

            var row: number = SubGrid.rows;
            while (solved && row--) {
                var column: number = SubGrid.columns;
                while (solved && column--)
                    solved = this.cells[row][column].solved();
            }

            return solved;

            //return !this.remainingCells;
        }

        public getAvailableOptionsMatrix(): number[][] {
            var matrix: number[][] = [];

            var row: number = SubGrid.rows;
            while (row--) {
                matrix[row] = [];
                var column: number = SubGrid.columns;
                while (column--)
                    matrix[row][column] = this.cells[row][column].options;
            }

            return matrix;
        }

        public getCellsMatrix(): ICell[][] {
            var matrix: ICell[][] = [];

            var row: number = SubGrid.rows;
            while (row--) {
                matrix[row] = [];
                var column: number = SubGrid.columns;
                while (column--)
                    matrix[row][column] = new Cell(this.cells[row][column]);
            }

            return matrix;
        }

        public getUnsetCells(): ICell[] {
            var unsetCells: ICell[] = [];

            for (var row: number = 0; row < SubGrid.rows; row++)
                for (var column: number = 0; column < SubGrid.columns; column++)
                    if (!this.cells[row][column].setMethod)                                         // cell unset i.e. == SetMethod.unset
                        unsetCells.push(new Cell(this.cells[row][column]));                         // Set copy of cell

            return unsetCells;
        }

        public unsetCells(totalUnsetOptions: number): ICell[] {
            var cells: ICell[] = this.getUnsetCells();
            var unset: ICell[] = [];
            for (var index: number = 0; index < cells.length; index++)
                if (cells[index].totalOptionsRemaining === totalUnsetOptions)
                    unset.push(cells[index]);

            return unset;
        }

        public getAvailableOptions(): number[] {
            var array: number[] = [];

            var row: number = SubGrid.rows;
            while (row--) {
                var column: number = SubGrid.columns;
                while (column--)
                    array[row * SubGrid.columns + column] = this.cells[row][column].options;
            }

            return array;
        }

        // Remove option from all other cells in this sub grid - return array of last options found and options removed from all columns / rows in the sub grid
        public strikeOutCell(cellColumn: number, cellRow: number, option: number): IStruckOutCells {
            var lastOptions: IOption[] = [];
            var removedOptionsFromColumn: IOption[] = [];
            var removedOptionsFromRow: IOption[] = [];

            var column: number;
            var row: number = SubGrid.rows;
            while (--row > cellRow) {
                column = SubGrid.columns;
                while (column--)
                    if (this.cells[row][column].removeOption(option))
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                    else {
                        if (this.optionRemovedFromColumn(column, row, option))
                            removedOptionsFromColumn.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: -1, bits: option });
                        if (this.optionRemovedFromRow(column, row, option))
                            removedOptionsFromRow.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: -1, cellRow: row, bits: option });
                    }
            }

            column = SubGrid.columns;
            while (--column > cellColumn)
                if (this.cells[row][column].removeOption(option))
                    lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                else {
                    if (this.optionRemovedFromColumn(column, row, option))
                        removedOptionsFromColumn.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: -1, bits: option });
                    if (this.optionRemovedFromRow(column, row, option))
                        removedOptionsFromRow.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: -1, cellRow: row, bits: option });
                }

            while (column--)
                if (this.cells[row][column].removeOption(option))
                    lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                else {
                    if (this.optionRemovedFromColumn(column, row, option))
                        removedOptionsFromColumn.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: -1, bits: option });
                    if (this.optionRemovedFromRow(column, row, option))
                        removedOptionsFromRow.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: -1, cellRow: -1, bits: option });
                }

            while (row--) {
                column = SubGrid.columns;
                while (column--)
                    if (this.cells[row][column].removeOption(option))
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
                    else {
                        if (this.optionRemovedFromColumn(column, row, option))
                            removedOptionsFromColumn.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: -1, bits: option });
                        if (this.optionRemovedFromRow(column, row, option))
                            removedOptionsFromRow.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: -1, cellRow: row, bits: option });
                    }
            }

            return { lastOptionsFound: lastOptions, removedOptionsFromColumn: removedOptionsFromColumn, removedOptionsFromRow: removedOptionsFromRow };
        }

        public isStruckOut(cellColumn: number, cellRow: number, symbol: string): boolean {
            return !this.cells[cellRow][cellColumn].containsSymbol(symbol);
        }

        public removeOptionsFromColumn(cellColumn: number, options: number): IOption[] {
            var lastOptions: IOption[] = [];

            for (var row: number = 0; row < SubGrid.rows; row++)
                if (this.cells[row][cellColumn].removeOptions(options)) {
                    lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: cellColumn, cellRow: row, bits: this.cells[row][cellColumn].options });
//                    this.remainingCells--;
                }

            return lastOptions;
        }

        public removeOptionsFromRow(cellRow: number, options: number): IOption[] {
            var lastOptions: IOption[] = [];

            for (var column: number = 0; column < SubGrid.columns; column++)
                if (this.cells[cellRow][column].removeOptions(options)) {
                    lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: cellRow, bits: this.cells[cellRow][column].options });
//                    this.remainingCells--;
                }

            return lastOptions;
        }

        public removeOptionsExceptFromColumn(excludeColumn: number, options: number): IOption[] {
            var lastOptions: IOption[] = [];

            var row: number;
            var column: number = SubGrid.columns;
            while (--column > excludeColumn) {
                row = SubGrid.rows;
                while (row--)
                    if (this.cells[row][column].removeOptions(options)) {
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
//                        this.remainingCells--;
                    }
            }

            while (column--) {
                row = SubGrid.rows;
                while (row--)
                    if (this.cells[row][column].removeOptions(options)) {
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
//                        this.remainingCells--;
                    }
            }

            return lastOptions;
        }

        public removeOptionsExceptFromRow(excludeRow: number, options: number): IOption[] {
            var lastOptions: IOption[] = [];

            var column: number;
            var row: number = SubGrid.rows;
            while (--row > excludeRow) {
                column = SubGrid.columns;
                while (column--)
                    if (this.cells[row][column].removeOptions(options)) {
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
//                        this.remainingCells--;
                    }
            }

            while (row--) {
                column = SubGrid.columns;
                while (column--)
                    if (this.cells[row][column].removeOptions(options)) {
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
//                        this.remainingCells--;
                    }
            }

            return lastOptions;
        }

        public removeIfExtraOptionsFromColumn(column: number, options: number): IOption[] {
            var lastOptions: IOption[] = [];

            for (var row: number = 0; row < SubGrid.rows; row++)
                if (this.cells[row][column].removeOptions(options)) {
                    lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
//                    this.remainingCells--;
                }

            return lastOptions;
        }

        public removeIfExtraOptionsFromRow(row: number, options: number): IOption[] {
            var lastOptions: IOption[] = [];

            for (var column: number = 0; column < SubGrid.columns; column++)
                if (this.cells[row][column].removeOptions(options)) {
                    lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
//                    this.remainingCells--;
                }

            return lastOptions;
        }

        public removeIfExtraOptions(options: number): IOption[] {
            var lastOptions: IOption[] = [];

            for (var row: number = 0; row < SubGrid.rows; row++)
                for (var column: number = 0; column < SubGrid.columns; column++)
                    if (this.cells[row][column].removeOptions(options)) {
                        lastOptions.push({ subGridColumn: this.column, subGridRow: this.row, cellColumn: column, cellRow: row, bits: this.cells[row][column].options });
//                        this.remainingCells--;
                    }

            return lastOptions;
        }

        public optionExistsInColumn(column: number, option: number): boolean {
            var found: boolean = false;
            var row: number = SubGrid.rows;
            while (!found && row--)
                found = this.cells[row][column].containsOption(option);

            return found;
        }

        public optionExistsInRow(row: number, option: number): boolean {
            var found: boolean = false;
            var column: number = SubGrid.columns;
            while (!found && column-- > 0)
                found = this.cells[row][column].containsOption(option);

            return found;
        }

        public optionRemovedFromColumn(cellColumn: number, cellRow: number, option: number): boolean {
            // Check if option removed from column
            var optionFound: boolean = false;

            var row: number = SubGrid.rows;
            while (!optionFound && --row > cellRow)
                optionFound = (this.cells[row][cellColumn].options & option) > 0;
            while (!optionFound && row--)
                optionFound = (this.cells[row][cellColumn].options & option) > 0;

            return !optionFound;                                                                    // If option not found then it was removed from this sub grid's column
        }

        public optionRemovedFromRow(cellColumn: number, cellRow: number, removedOption: number): boolean {
            // Check if option removed from row
            var optionFound: boolean = false;
            var column: number = SubGrid.columns;
            while (!optionFound && --column > cellColumn)
                optionFound = (this.cells[cellRow][column].options & removedOption) > 0;
            while (!optionFound && column--)
                optionFound = (this.cells[cellRow][column].options & removedOption) > 0;

            return !optionFound;                                                                    // If option not found then it was removed from this sub grid's row
        }

        public setCells(subGrid: ICell[][]) {
            for (var row: number = 0; row < SubGrid.rows; row++)
                for (var column: number = 0; column < SubGrid.columns; column++)
                    this.cells[row][column] = new Cell(subGrid[row][column]);
        }
    }
}