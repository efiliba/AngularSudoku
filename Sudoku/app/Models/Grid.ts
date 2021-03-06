/// <reference path="../Utilities/Combinations.ts" />
/// <reference path="SubGrid.ts" />

module Solver {
    interface ILimitedOption {                                                                      // Options limited to a column, row or both (sub-grid)
        column: number;
        row: number;
        options: number;
    }

    interface IUnsetCells {
        column: number;
        row: number;
        cells: ICell[];
    }

    export interface IJsonGridRow {
        columns: IJsonSubGrid[];
    }

    export interface IJsonGrid {
        rows: IJsonGridRow[];
    }

    export interface IGrid {
        reset();
        get(column: number, row: number): ISubGrid;
        toJson(): IJsonGrid;
        setJson(json: IJsonGrid);
        compare(items: ISubGrid[][]): boolean;
        solve(eliminateAfter?: number, maxRecursionLevel?: number): boolean;
        solved(): boolean;
        removeOptionAtPosition(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, optionColumn: number, optionRow: number): boolean;
        removeOption(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, option): boolean;
        simplify(): boolean;
        isValid(): boolean;
        save(): ICell[];
        strikeOut(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, option: number);
        isStruckOut(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, symbol: string): boolean;        
        fixByPosition(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, optionColumn: number, optionRow);
        setByOption(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, option: number, setMethod: SetMethod);
        setBySymbol(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, symbol: string, setMethod: SetMethod);
        fixByOptions(fixedOptions: number[]);
        fixByCsv(options: string);
        unfix(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number);
    }

    export class Grid implements IGrid {
        private static columns: number;
        private static rows: number;
        private static combinations: Combinations<ICell>;

        private subGrids: ISubGrid[][];                                                             // Jagged array used for efficiency ???
        private totalSet: number;                                                                   // Track how many cells have been set

        static Constructor(columns: number, rows: number) {
            Grid.combinations = new Combinations<ICell>(columns * rows);
            SubGrid.Constructor(rows, columns);                                                     // Swop columns and rows
            Grid.columns = columns;
            Grid.rows = rows;
        }

        constructor() {
            this.reset();
        }

        public reset() {
            this.subGrids = [];
            for (var row: number = 0; row < Grid.rows; row++) {
                this.subGrids[row] = [];
                for (var column: number = 0; column < Grid.columns; column++)
                    this.subGrids[row][column] = new SubGrid(column, row);
            }

            this.totalSet = 0;
        }

        public get(column: number, row: number): ISubGrid {                                         // sub-grids called by [column, row] but accessed by [row][column] for efficiency
            return this.subGrids[row][column];
        }                                                      

        public toJson(): IJsonGrid {
            var json: IJsonGrid = { rows: [] };
            for (var row: number = 0; row < Grid.rows; row++) {
                var jsonSubGrids: IJsonCell[] = [];
                for (var column: number = 0; column < Grid.columns; column++)
                    jsonSubGrids.push(this.subGrids[row][column].toJson());
                json.rows.push({ columns: jsonSubGrids });
            }

            return json;
        }

        public setJson(json: IJsonGrid) {
            // Set sub grids' json values  
            for (var subGridRow: number = 0; subGridRow < Grid.rows; subGridRow++) {
                var jsonColumns: IJsonSubGrid[] = json.rows[subGridRow].columns;
                for (var subGridColumn: number = 0; subGridColumn < Grid.columns; subGridColumn++)
                    this.subGrids[subGridRow][subGridColumn].setJson(jsonColumns[subGridColumn]);
            }

            // Strike out set cells
            this.totalSet = 0;
            for (var subGridRow: number = 0; subGridRow < Grid.rows; subGridRow++)
                for (var subGridColumn: number = 0; subGridColumn < Grid.columns; subGridColumn++) {
                    var subGrid: ISubGrid = this.subGrids[subGridRow][subGridColumn];
                    for (var cellRow: number = 0; cellRow < Grid.columns; cellRow++)
                        for (var cellColumn: number = 0; cellColumn < Grid.rows; cellColumn++) {
                            var cell: ICell = subGrid.get(cellColumn, cellRow);
                            if (cell.setMethod) {                                                   // cell set i.e. != SetMethod.unset
                                this.totalSet++;
                                this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, cell.options);
                            }
                        }
                }
        }

        public compare(items: ISubGrid[][]): boolean {
            var match: boolean = true;
            var row: number = Grid.rows;
            while (match && row--) {
                var column: number = Grid.columns;
                while (match && column--)
                    match = this.subGrids[row][column].compare(items[row][column].getCellsMatrix());
            }

            return match;
        }

        public solve(eliminateAfter: number = 0, maxRecursionLevel: number = 1): boolean {
            do {                                                                                    // Repeat while an only option found or an option removed
                while (this.simplify())
                    ;
            } while (this.totalSet > eliminateAfter && maxRecursionLevel && this.eliminate(Grid.columns * Grid.rows, maxRecursionLevel));

            return this.solved();// totalSet === columns * rows * columns * rows;
        }

        public solved(): boolean {
            var solved: boolean = true;

            var row: number = Grid.rows;
            while (solved && row--) {
                var column: number = Grid.columns;
                while (solved && column--)
                    solved = this.subGrids[row][column].solved();
            }

            return solved;
        }

        public removeOptionAtPosition(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, optionColumn: number, optionRow: number): boolean {
            var cell: ICell = this.subGrids[subGridRow][subGridColumn].get(cellColumn, cellRow);
            if (cell.removeOptionAtPosition(optionColumn, optionRow))                               // Check if last option left
            {
                this.totalSet++;
                this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, cell.options);       // Remaining option
                return true;
            }
            else
                return false;
        }

        public removeOption(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, option): boolean {
            var cell: ICell = this.subGrids[subGridRow][subGridColumn].get(cellColumn, cellRow);
            if (cell.removeOption(option))                                                          // Check if last option left
            {
                this.totalSet++;
                this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, cell.options);       // Remaining option
                return true;
            }
            else
                return false;
        }

        public simplify(): boolean {
            var onlyOptionFound: boolean = false;

            // Check/remove only options in columns/rows/sub-grids and mulitipe options limited to a certain number of related cells i.e. if 2 cells in a row can only contain 1 or 2 => remove from other cells in row 
            while (this.removeOnlyOptions() || this.checkLimitedOptions())
                onlyOptionFound = true;

            return onlyOptionFound;
        }

        public isValid(): boolean {
            var valid: boolean = this.matrixValid(this.getTransposedCellsMatrix()) && this.matrixValid(this.getCellsMatrix());  // Check columns and rows contain all options and no set cell duplicted 

            return valid;
        }

        private matrixValid(matrix: ICell[][]): boolean {
            var valid: boolean = true;
            var size: number = Grid.columns * Grid.rows;
            var index: number = size;
            while (valid && index--) {
                var setOptions: number[] = this.setDistinctOptions(matrix[index]);                  // Get unique set cells
                var unsetOptions: number[] = this.unsetOptions(matrix[index]);

                valid = setOptions.length + unsetOptions.length === size &&                         // Ensures setOptions did not contain duplicates
                        (BitUtilities.bitwiseOR(setOptions) | BitUtilities.bitwiseOR(unsetOptions)) === (1 << size) - 1; // totalSetOptions | totalUnsetOptions must contain all the options
            }

            return valid;
        }

        private setDistinctOptions(cells: ICell[]): number[] {
            // cells.Where(x => x.IsSet).GroupBy(x => x.Options).Where(x => x.Count() == 1).Select(x => x.Key);
            var distinct: number[] = [];
            var hash = {};
            for (var index: number = 0; index < cells.length; index++) {
                var options: number = cells[index].options;
                if (cells[index].setMethod && !hash[options]) {                                     // cell set i.e. != SetMethod.unset
                    distinct.push(options);
                    hash[options] = true;
                }
            }

            return distinct;
        }

        private unsetOptions(cells: ICell[]): number[] {
            // cells.Where(x => !x.IsSet).Select(x => x.Options)
            var options: number[] = [];
            for (var index: number = 0; index < cells.length; index++)
                if (!cells[index].setMethod)                                                        // cell unset i.e. == SetMethod.unset
                    options.push(cells[index].options);

            return options;
        }

        private load(cells: ICell[]) {
            var subGrid: ICell[][] = [];
            for (var row: number = 0; row < Grid.columns; row++)                                    // Use SubGrid's number of rows i.e. swopped columns
                subGrid[row] = [];

            var size: number = Grid.columns * Grid.rows;

            for (var subGridRow: number = 0; subGridRow < Grid.rows; subGridRow++)
                for (var subGridColumn: number = 0; subGridColumn < Grid.columns; subGridColumn++) {
                    for (var cellRow: number = 0; cellRow < Grid.columns; cellRow++)
                        for (var cellColumn: number = 0; cellColumn < Grid.rows; cellColumn++)
                            subGrid[cellRow][cellColumn] = cells[subGridRow * size * Grid.columns + subGridColumn * Grid.rows + cellRow * size + cellColumn];

                    this.subGrids[subGridRow][subGridColumn].setCells(subGrid);
                }
        }

        public save(): ICell[] {
            var size: number = Grid.columns * Grid.rows;
            var cells: ICell[] = [];

            for (var subGridRow: number = 0; subGridRow < Grid.rows; subGridRow++)
                for (var subGridColumn: number = 0; subGridColumn < Grid.columns; subGridColumn++) {
                    var subMatrix = this.subGrids[subGridRow][subGridColumn].getCellsMatrix();
                    for (var cellRow = 0; cellRow < Grid.columns; cellRow++)
                        for (var cellColumn = 0; cellColumn < Grid.rows; cellColumn++)
                            cells[subGridRow * size * Grid.columns + subGridColumn * Grid.rows + cellRow * size + cellColumn] = subMatrix[cellRow][cellColumn];
                }

            return cells;
        }

        private eliminate(unsetOptionsDepth: number, recursionLevel: number): boolean {
            var cells: ICell[] = this.save();                                                       // Save current state
            var saveTotalSet: number = this.totalSet;

            var valid: boolean = true;
            var totalUnsetOptions: number = 1;
            while (valid && ++totalUnsetOptions < unsetOptionsDepth) {
                var row: number = Grid.rows;
                while (valid && row-- > 0) {
                    var column = Grid.columns;
                    while (valid && column-- > 0) {
                        var unsetCells: IUnsetCells = this.unsetCells(column, row, totalUnsetOptions);  // May reduce column and row indices
                        column = unsetCells.column;
                        row = unsetCells.row;

                        var index: number = unsetCells.cells.length;
                        while (valid && index--) {
                            var cell: ICell = unsetCells.cells[index];

                            var options: number = cell.options;
                            var cellColumn: number = cell.getColumn();
                            var cellRow: number = cell.getRow();

                            var tryOption: number = options & ~(options - 1);                       // lowest set bit value
                            while (tryOption && valid) {
                                this.setByOption(column, row, cellColumn, cellRow, tryOption, SetMethod.calculated);
                                this.solve(unsetOptionsDepth, recursionLevel - 1);
                                valid = this.isValid();
                                this.load(cells);                                                   // Reset
                                this.totalSet = saveTotalSet;

                                if (valid) {
                                    options -= tryOption;                                           // remove tried option
                                    tryOption = options & ~(options - 1);
                                }
                                else
                                    this.removeOption(column, row, cellColumn, cellRow, tryOption); // Remove tryOption i.e. resulted in an invalid state
                            }
                        }
                    }
                }
            }

            return !valid;                                                                          // Option removed?
        }

        private unsetCells(column: number, row: number, totalUnsetOptions: number): IUnsetCells {
            var cells: ICell[] = [];
            var set = false;
            while (!set && row >= 0) {
                while (!set && column >= 0) {
                    cells = this.subGrids[row][column].unsetCells(totalUnsetOptions);
                    if (!(set = cells.length > 0))
                        column--;
                }

                if (!set && row--)
                    column = Grid.columns - 1;
            }

            return { column: column, row: row, cells: cells };
        }

        public strikeOut(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, option: number) {
            var struckOutCells: IStruckOutCells = this.subGrids[subGridRow][subGridColumn].strikeOutCell(cellColumn, cellRow, option);

            var removeOption: IOption;

            var index: number = struckOutCells.removedOptionsFromColumn.length; // Distinct
            while (index--) {  
                removeOption = struckOutCells.removedOptionsFromColumn[index];
                this.join(struckOutCells.lastOptionsFound, this.removeOptionFromOtherColumns(removeOption.subGridColumn, removeOption.subGridRow, removeOption.cellColumn, removeOption.bits));
            }

            index = struckOutCells.removedOptionsFromRow.length;
            while (index--) {  
                removeOption = struckOutCells.removedOptionsFromRow[index];
                this.join(struckOutCells.lastOptionsFound, this.removeOptionFromOtherRows(removeOption.subGridColumn, removeOption.subGridRow, removeOption.cellRow, removeOption.bits));
            }

            this.join(struckOutCells.lastOptionsFound, this.removeOptionsFromColumn(subGridColumn, subGridRow, cellColumn, option));
            this.join(struckOutCells.lastOptionsFound, this.removeOptionsFromRow(subGridColumn, subGridRow, cellRow, option));

            var lastOption: IOption;
            index = struckOutCells.lastOptionsFound.length;
            while (index--) {
                lastOption = struckOutCells.lastOptionsFound[index];
                this.strikeOut(lastOption.subGridColumn, lastOption.subGridRow, lastOption.cellColumn, lastOption.cellRow, lastOption.bits);
//                this.subGrids[lastOption.subGridRow][lastOption.subGridColumn].get(lastOption.cellColumn, lastOption.cellRow).setMethod = SetMethod.calculated;
            }

            this.totalSet += struckOutCells.lastOptionsFound.length;
        }

        public isStruckOut(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, symbol: string): boolean {
            return this.subGrids[subGridRow][subGridColumn].isStruckOut(cellColumn, cellRow, symbol);;
        }       

        public fixByPosition(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, optionColumn: number, optionRow) {
            if (this.subGrids[subGridRow][subGridColumn].setByPosition(cellColumn, cellRow, optionColumn, optionRow, SetMethod.loaded))
                this.totalSet++;

            this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, 1 << Grid.columns * optionRow + optionColumn);
        }

        public setByOption(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, option: number, setMethod: SetMethod) {
            if (this.subGrids[subGridRow][subGridColumn].setByOption(cellColumn, cellRow, option, setMethod))
                this.totalSet++;

            this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, option);
        }

        public setBySymbol(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, symbol: string, setMethod: SetMethod) {
            var option: number;
            if (option = this.subGrids[subGridRow][subGridColumn].setBySymbol(cellColumn, cellRow, symbol, setMethod))
                this.totalSet++;

            this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, option);
        }

        public fixByOptions(fixedOptions: number[]) {
            var option: number;
            for (var subGridRow: number = 0; subGridRow < Grid.rows; subGridRow++)
                for (var subGridColumn: number = 0; subGridColumn < Grid.columns; subGridColumn++)
                    for (var cellRow: number = 0; cellRow < Grid.columns; cellRow++)
                        for (var cellColumn: number = 0; cellColumn < Grid.rows; cellColumn++)
                            if (option = fixedOptions[(subGridRow * Grid.columns + cellRow) * Grid.columns * Grid.rows + subGridColumn * Grid.rows + cellColumn]) {
                                this.totalSet++;
                                this.subGrids[subGridRow][subGridColumn].get(cellColumn, cellRow).setByOption(option, SetMethod.loaded);
                                this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, option);
                            }
        }

        public fixByCsv(options: string) {
            var option: number;
            for (var subGridRow: number = 0; subGridRow < Grid.rows; subGridRow++)
                for (var subGridColumn: number = 0; subGridColumn < Grid.columns; subGridColumn++)
                    for (var cellRow: number = 0; cellRow < Grid.columns; cellRow++)
                        for (var cellColumn: number = 0; cellColumn < Grid.rows; cellColumn++) {
                            //                int.TryParse(options.Substring((subGridRow * columns + cellRow) * columns * rows + subGridColumn * rows + cellColumn, 1), out option);
                            if (option) {
                                this.totalSet++;
                                option = 1 << (option - 1);
                                this.subGrids[subGridRow][subGridColumn].get(cellColumn, cellRow).setByOption(option, SetMethod.loaded);
                                this.strikeOut(subGridColumn, subGridRow, cellColumn, cellRow, option);
                            }
                        }
        }

        public unfix(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number) {
            this.subGrids[subGridRow][subGridColumn].get(cellColumn, cellRow).reset();

            var fixedCells: number[];
            var cells: ICell[] = this.getCellsArray();
            for (var index: number = 0; index < cells.length; index--)
                fixedCells.push(cells[index].setMethod === SetMethod.loaded || cells[index].setMethod === SetMethod.user ? cells[index].options : 0);                   // Get fixed cells i.e. 0, 0, 0, 8, 4, 0, 0, 1, ...

            this.reset();
            this.fixByOptions(fixedCells);
            this.solve();
        }

        private getCellsArray(): ICell[] {
            var array: ICell[] = [];

            var subGridRow: number = Grid.rows;
            while (subGridRow--) {
                var subGridColumn: number = Grid.columns;
                while (subGridColumn--) {
                    var subMatrix = this.subGrids[subGridRow][subGridColumn].getCellsMatrix();

                    var cellColumn: number = Grid.rows;
                    while (cellColumn--) {
                        var cellRow: number = Grid.columns;
                        while (cellRow--)
                            array[(subGridRow * Grid.columns + cellRow) * Grid.columns * Grid.rows + subGridColumn * Grid.rows + cellColumn] = subMatrix[cellRow][cellColumn];
                    }
                }
            }

            return array;
        }

        // Remove option from the other sub grid's columns / rows when the option must belong in a specific sub grid's column / row
        public removeUnavailableOptionsAtPosition(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, optionColumn: number, optionRow: number): boolean {
            return this.removeUnavailableOptions(subGridColumn, subGridRow, cellColumn, cellRow, 1 << Grid.columns * optionRow + optionColumn);
        }

        private removeUnavailableOptions(subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, option: number): boolean {
            var lastOptions: IOption[] = [];

            // Check sub grid's column and if found remove option from other columns
            if (this.subGrids[subGridRow][subGridColumn].optionRemovedFromColumn(cellColumn, cellRow, option))
                lastOptions = this.removeOptionFromOtherColumns(subGridColumn, subGridRow, cellColumn, option);

            // Check sub grid's row and if found remove option from other rows
            if (this.subGrids[subGridRow][subGridColumn].optionRemovedFromRow(cellColumn, cellRow, option))
                lastOptions = this.removeOptionFromOtherRows(subGridColumn, subGridRow, cellRow, option);

            var lastOption: IOption;
            var index: number = lastOptions.length;
            while (index--) {
                lastOption = lastOptions[index];
                this.strikeOut(lastOption.subGridColumn, lastOption.subGridRow, lastOption.cellColumn, lastOption.cellRow, lastOption.bits);
            }

            return lastOptions !== null;
        }

        // Check for mulitipe options limited to a certain number of related cells i.e. 2 cells in a row can only contain 1 or 2 => remove from other cells in row
        private checkLimitedOptions(): boolean {
            var limitedOptions: ILimitedOption[] = this.findOptionsLimitedToMatrix(this.getTransposedCellsMatrix());// Columns
            var limitedOptionFound: boolean = this.removeIfExtraOptionsFromColumn(limitedOptions);  // Remove options iff the cell contains other options

            if (!limitedOptionFound) {
                limitedOptions = this.findOptionsLimitedToMatrix(this.getCellsMatrix());            // Rows
                limitedOptionFound = this.removeIfExtraOptionsFromRow(limitedOptions);
            }

            if (!limitedOptionFound) {
                limitedOptions = this.findOptionsLimitedToSubGrids();
                limitedOptionFound = this.removeIfExtraOptionsFromSubGrid(limitedOptions);
            }

            return limitedOptionFound;
        }

        private findOptionsLimitedToMatrix(cells: ICell[][]): ILimitedOption[] {
            var limitedOptions: ILimitedOption[] = [];
            var unsetCells: ICell[] = [];
            var pickOptions: ICell[] = [];
            var combinationOptions: number[] = [];

            for (var cellIndex: number = 0; cellIndex < Grid.columns * Grid.rows; cellIndex++) {
                while (unsetCells.length)                                                           // Clear array
                    unsetCells.pop();

                // IEnumerable<Cell> unsetCells = cells[index].Where(x => !x.IsSet);                // Get cells that are still to be set
                var checkCells: ICell[] = cells[cellIndex];
                var index: number = checkCells.length;
                while (index--) {
                    if (!checkCells[index].setMethod)                                               // cell unset i.e. == SetMethod.unset
                        unsetCells.push(checkCells[index]);
                }
                var totalUnsetCells: number = unsetCells.length;

                // Find max remaining options, less than totalUnsetCells
                // int maxRemainingOptions = unsetCells.Where(x => x.TotalOptionsRemaining < totalUnsetCells).Max(x => (int?) x.TotalOptionsRemaining) ?? 0;    // Max < totalUnsetCells
                var maxRemainingOptions: number = 0;
                index = totalUnsetCells;
                while (index--) {
                    var totalOptionsRemaining: number = unsetCells[index].totalOptionsRemaining;
                    if (totalOptionsRemaining < totalUnsetCells && totalOptionsRemaining > maxRemainingOptions)
                        maxRemainingOptions = totalOptionsRemaining;
                }

                var found: boolean = false;
                var pick: number = 1;
                while (!found && pick++ < maxRemainingOptions) {
                    while (combinationOptions.length)                                               // Clear arrays
                        combinationOptions.pop();
                    while (pickOptions.length)
                        pickOptions.pop();

                    // Get options with at least the number of bits to pick set
                    // IEnumerable <Cell> options = unsetCells.Where(x => x.TotalOptionsRemaining <= pick); // Get options with at least the number of bits to pick set
                    index = totalUnsetCells;
                    while (index--)
                        if (unsetCells[index].totalOptionsRemaining <= pick)
                            pickOptions.push(unsetCells[index]);

                    var combinations: ICell[][] = Grid.combinations.select(pickOptions, pick);
                    index = combinations.length;
                    while (!found && index--) {
                        // int removeOptions = BitUtilities.BitwiseOR(enumerator.Current.Select(x => x.Options));
                        var combinationsIndex: number = combinations[index].length;
                        while (combinationsIndex--)
                            combinationOptions.push(combinations[index][combinationsIndex].options);
                        var removeOptions: number = BitUtilities.bitwiseOR(combinationOptions);

                        if (found = BitUtilities.numberOfBitsSet(removeOptions) <= pick)
                            limitedOptions.push({ column: cellIndex, row: cellIndex, options: removeOptions });
                    }
                }
            }

            return limitedOptions;
        }

        private findOptionsLimitedToSubGrids(): ILimitedOption[] {
            var limitedOptions: ILimitedOption[] = [];
            var pickOptions: ICell[] = [];
            var combinationOptions: number[] = [];

            for (var row: number = 0; row < Grid.rows; row++)
                for (var column: number = 0; column < Grid.columns; column++) {
                    var unsetCells: ICell[] = this.subGrids[row][column].getUnsetCells();
                    var totalUnsetCells: number = unsetCells.length;

                    // int maxRemainingOptions = unsetCells.Where(x => x.TotalOptionsRemaining < totalUnsetCells).Max(x => (int?) x.TotalOptionsRemaining) ?? 0;    // Max < totalUnsetCells
                    var maxRemainingOptions: number = 0;
                    var index: number = totalUnsetCells;
                    while (index--) {
                        var totalOptionsRemaining: number = unsetCells[index].totalOptionsRemaining;
                        if (totalOptionsRemaining < totalUnsetCells && totalOptionsRemaining > maxRemainingOptions)
                            maxRemainingOptions = totalOptionsRemaining;
                    }

                    var found: boolean = false;
                    var pick: number = 1;
                    while (!found && pick++ < maxRemainingOptions) {
                        while (combinationOptions.length)                                           // Clear arrays
                            combinationOptions.pop();
                        while (pickOptions.length)
                            pickOptions.pop();

                        // Get options with at least the number of bits to pick set
                        // IEnumerable <Cell> options = unsetCells.Where(x => x.TotalOptionsRemaining <= pick); // Get options with at least the number of bits to pick set
                        index = totalUnsetCells;
                        while (index--)
                            if (unsetCells[index].totalOptionsRemaining <= pick)
                                pickOptions.push(unsetCells[index]);

                        var combinations: ICell[][] = Grid.combinations.select(pickOptions, pick);
                        index = combinations.length;
                        while (!found && index--) {
                            // int removeOptions = BitUtilities.BitwiseOR(enumerator.Current.Select(x => x.Options));
                            var combinationsIndex: number = combinations[index].length;
                            while (combinationsIndex--)
                                combinationOptions.push(combinations[index][combinationsIndex].options);
                            var removeOptions: number = BitUtilities.bitwiseOR(combinationOptions);

                            if (found = BitUtilities.numberOfBitsSet(removeOptions) <= pick)
                                limitedOptions.push({ column: column, row: row, options: removeOptions });
                        }
                    }
                }

            return limitedOptions;
        }

        private removeIfExtraOptionsFromColumn(limitedOptions: ILimitedOption[]): boolean {
            var lastOptions: IOption[] = [];

            var limitedOption: ILimitedOption;
            var index: number = limitedOptions.length;
            while (index--) {
                limitedOption = limitedOptions[index];
                for (var row: number = 0; row < Grid.rows; row++)
                    this.join(lastOptions, this.subGrids[row][limitedOption.column / Grid.rows >> 0].removeIfExtraOptionsFromColumn(limitedOption.column % Grid.rows, limitedOption.options));
            }

            var lastOption: IOption;
            index = lastOptions.length;
            while (index--) {
                lastOption = lastOptions[index];
                this.strikeOut(lastOption.subGridColumn, lastOption.subGridRow, lastOption.cellColumn, lastOption.cellRow, lastOption.bits);
            }

            this.totalSet += lastOptions.length;
            return lastOptions.length > 0;
        }

        private removeIfExtraOptionsFromRow(limitedOptions: ILimitedOption[]): boolean {
            var lastOptions: IOption[] = [];

            var limitedOption: ILimitedOption;
            var index: number = limitedOptions.length;
            while (index--) {
                limitedOption = limitedOptions[index];
                for (var column: number = 0; column < Grid.columns; column++)
                    this.join(lastOptions, this.subGrids[limitedOption.row / Grid.columns >> 0][column].removeIfExtraOptionsFromRow(limitedOption.row % Grid.columns, limitedOption.options));
            }

            var lastOption: IOption;
            index = lastOptions.length;
            while (index--) {
                lastOption = lastOptions[index];
                this.strikeOut(lastOption.subGridColumn, lastOption.subGridRow, lastOption.cellColumn, lastOption.cellRow, lastOption.bits);
            }

            this.totalSet += lastOptions.length;
            return lastOptions.length > 0;
        }

        private removeIfExtraOptionsFromSubGrid(limitedOptions: ILimitedOption[]): boolean {
            var lastOptions: IOption[] = [];

            var limitedOption: ILimitedOption;
            var index: number = limitedOptions.length;
            while (index--) {
                limitedOption = limitedOptions[index];
                this.join(lastOptions, this.subGrids[limitedOption.row][limitedOption.column].removeIfExtraOptions(limitedOption.options));
            }

            var lastOption: IOption;
            index = lastOptions.length;
            while (index--) {
                lastOption = lastOptions[index];
                this.strikeOut(lastOption.subGridColumn, lastOption.subGridRow, lastOption.cellColumn, lastOption.cellRow, lastOption.bits);
            }

            this.totalSet += lastOptions.length;
            return lastOptions.length > 0;
        }

        private removeOptionsFromColumn(subGridColumn: number, subGridRow: number, cellColumn: number, options: number): IOption[] {
            var lastOptions: IOption[] = [];

            // Ignore subGridRow
            var row: number = Grid.rows;
            while (--row > subGridRow)
                this.join(lastOptions, this.subGrids[row][subGridColumn].removeOptionsFromColumn(cellColumn, options));
            while (row--)
                this.join(lastOptions, this.subGrids[row][subGridColumn].removeOptionsFromColumn(cellColumn, options));

            return lastOptions;
        }

        private removeOptionsFromRow(subGridColumn: number, subGridRow: number, cellRow: number, options: number): IOption[] {
            var lastOptions: IOption[] = [];

            // Ignore subGridColumn
            var column: number = Grid.columns;
            while (--column > subGridColumn)
                this.join(lastOptions, this.subGrids[subGridRow][column].removeOptionsFromRow(cellRow, options));

            while (column--)
                this.join(lastOptions, this.subGrids[subGridRow][column].removeOptionsFromRow(cellRow, options));

            return lastOptions;
        }

        private removeOnlyOptions(): boolean {
            return this.removeOnlyColumnOptions() || this.removeOnlyRowOptions() || this.removeOnlySubGridOptions();
        }

        private removeOnlyColumnOptions(): boolean {
            var onlyOptionFound: boolean = false;

            var matrix: number[][] = this.getTransposedAvailableOptionsMatrix();

            // Check for only options in each column
            var column: number = Grid.rows * Grid.columns;
            while (!onlyOptionFound && column--) {
                var onlyOption: IOnlyOption = BitUtilities.onlyOption(matrix[column]);
                if (onlyOption.found) {
                    onlyOptionFound = true;
                    var matrixRow: number = BitUtilities.containingBitIndex(matrix[column], onlyOption.bit);// Row within grid where only option found                     
                    this.setByOption(column / Grid.rows >> 0, matrixRow / Grid.columns >> 0, column % Grid.rows, matrixRow % Grid.columns, onlyOption.bit, SetMethod.calculated);
                }
            }

            return onlyOptionFound;
        }

        private removeOnlyRowOptions(): boolean {
            var onlyOptionFound: boolean = false;

            var matrix: number[][] = this.getAvailableOptionsMatrix();

            // Check for only options in each row
            var row: number = Grid.rows * Grid.columns;
            while (!onlyOptionFound && row--) {
                var onlyOption: IOnlyOption = BitUtilities.onlyOption(matrix[row]);
                if (onlyOption.found) {
                    onlyOptionFound = true;
                    var matrixColumn: number = BitUtilities.containingBitIndex(matrix[row], onlyOption.bit);// Column within grid where only option found                     
                    this.setByOption(matrixColumn / Grid.rows >> 0, row / Grid.columns >> 0, matrixColumn % Grid.rows, row % Grid.columns, onlyOption.bit, SetMethod.calculated);
                }
            }

            return onlyOptionFound;
        }

        private removeOnlySubGridOptions(): boolean {
            var onlyOptionFound: boolean = false;

            // Check for only options in each sub grid
            var row: number = Grid.rows;
            while (!onlyOptionFound && row--) {
                var column: number = Grid.columns;
                while (!onlyOptionFound && column--) {
                    var values: number[] = this.subGrids[row][column].getAvailableOptions();
                    var onlyOption: IOnlyOption = BitUtilities.onlyOption(values);
                    if (onlyOption.found) {
                        onlyOptionFound = true;
                        var arrayIndex: number = BitUtilities.containingBitIndex(values, onlyOption.bit);   // Index within array where only option found                     
                        this.setByOption(column, row, arrayIndex % Grid.rows, arrayIndex / Grid.rows >> 0, onlyOption.bit, SetMethod.calculated);
                    }
                }
            }

            return onlyOptionFound;
        }

        // Check options removed from other columns (n - 1) columns must have the options removed i.e. option must exist in only 1 columns
        private removeOptionFromOtherColumns(subGridColumn: number, subGridRow: number, cellColumn: number, option: number): IOption[] {
            var lastOptions: IOption[] = [];

            var totalExistingColumns: number = 0;
            var totalExistingRows: number = 0;

            var existingColumn: number = -1;
            var column: number = Grid.rows;                                                         // Use SubGrid's number of columns i.e. swopped rows
            while (totalExistingColumns < 2 && --column > cellColumn)
                if (this.subGrids[subGridRow][subGridColumn].optionExistsInColumn(column, option)) {
                    existingColumn = column;
                    totalExistingColumns++;
                }
            while (totalExistingColumns < 2 && column-- > 0)
                if (this.subGrids[subGridRow][subGridColumn].optionExistsInColumn(column, option)) {
                    existingColumn = column;
                    totalExistingColumns++;
                }

            if (totalExistingColumns === 1)
                lastOptions = this.removeOptionsFromColumn(subGridColumn, subGridRow, existingColumn, option);
            else {
                // Check other sub grids in same column
                var existingRow: number = -1;
                var row: number = Grid.rows;
                while (totalExistingRows < 2 && --row > subGridRow)
                    if (this.subGrids[row][subGridColumn].optionExistsInColumn(cellColumn, option)) {
                        existingRow = row;
                        totalExistingRows++;
                    }
                while (totalExistingRows < 2 && row-- > 0)
                    if (this.subGrids[row][subGridColumn].optionExistsInColumn(cellColumn, option)) {
                        existingRow = row;
                        totalExistingRows++;
                    }

                if (totalExistingRows === 1)
                    lastOptions = this.subGrids[existingRow][subGridColumn].removeOptionsExceptFromColumn(cellColumn, option);
            }

            return lastOptions;
        }

        // Check options removed from other rows (n - 1) rows must have the options removed i.e. option must exist in only 1 row
        private removeOptionFromOtherRows(subGridColumn: number, subGridRow: number, cellRow: number, option: number): IOption[] {
            var lastOptions: IOption[] = [];

            var totalExistingColumns: number = 0;
            var totalExistingRows: number = 0;

            var existingRow: number = -1;
            var row: number = Grid.columns;                                                         // Use SubGrid's number of rows i.e. swopped columns
            while (totalExistingRows < 2 && --row > cellRow)
                if (this.subGrids[subGridRow][subGridColumn].optionExistsInRow(row, option)) {
                    existingRow = row;
                    totalExistingRows++;
                }
            while (totalExistingRows < 2 && row-- > 0)
                if (this.subGrids[subGridRow][subGridColumn].optionExistsInRow(row, option)) {
                    existingRow = row;
                    totalExistingRows++;
                }

            if (totalExistingRows === 1)
                lastOptions = this.removeOptionsFromRow(subGridColumn, subGridRow, existingRow, option);
            else {
                // Check other sub grids in same row
                var existingColumn: number = -1;
                var column: number = Grid.columns;
                while (totalExistingColumns < 2 && --column > subGridColumn)
                    if (this.subGrids[subGridRow][column].optionExistsInRow(cellRow, option)) {
                        existingColumn = column;
                        totalExistingColumns++;
                    }
                while (totalExistingColumns < 2 && column-- > 0)
                    if (this.subGrids[subGridRow][column].optionExistsInRow(cellRow, option)) {
                        existingColumn = column;
                        totalExistingColumns++;
                    }

                if (totalExistingColumns == 1)
                    lastOptions = this.subGrids[subGridRow][existingColumn].removeOptionsExceptFromRow(cellRow, option);
            }

            return lastOptions;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Convert sub grids to coluns * rows matrix
        ////////////////////////////////////////////////////////////////////////////////////////////

        private getAvailableOptionsMatrix(): number[][] {                                           // Get state of current grid - returned as an n*m matrix (not separated by sub grids)
            var subGridRow: number = Grid.rows;
            var matrixRow: number = subGridRow * Grid.columns;                                      // Use SubGrid's number of rows i.e. swopped columns
            var matrix: number[][] = [];

            var subGridColumns: number = Grid.columns;
            var matrixColumns: number = subGridColumns * Grid.rows;                                 // Use SubGrid's number of columns i.e. swopped rows
            while (matrixRow--)
                matrix[matrixRow] = [];

            while (subGridRow--) {
                var subGridColumn: number = subGridColumns;
                while (subGridColumn--) {
                    var subMatrix = this.subGrids[subGridRow][subGridColumn].getAvailableOptionsMatrix();

                    var cellColumn: number = Grid.rows;
                    while (cellColumn--) {
                        var cellRow: number = Grid.columns;
                        while (cellRow--)
                            matrix[subGridRow * Grid.columns + cellRow][subGridColumn * Grid.rows + cellColumn] = subMatrix[cellRow][cellColumn];
                    }
                }
            }

            return matrix;
        }

        private getTransposedAvailableOptionsMatrix(): number[][] {                                 // Get state of current grid - returned as a transposed n*m matrix (not separated by sub grids)
            var subGridColumn: number = Grid.columns;
            var matrixColumn: number = subGridColumn * Grid.rows;                                   // Use SubGrid's number of rows i.e. swopped columns
            var matrix: number[][] = [];

            var subGridRows: number = Grid.rows;
            var matrixRows: number = subGridRows * Grid.columns;
            while (matrixColumn--)
                matrix[matrixColumn] = [];

            while (subGridColumn--) {
                var subGridRow: number = subGridRows;
                while (subGridRow--) {
                    var subMatrix = this.subGrids[subGridRow][subGridColumn].getAvailableOptionsMatrix();

                    var cellRow: number = Grid.columns;
                    while (cellRow--) {
                        var cellColumn: number = Grid.rows;
                        while (cellColumn--)
                            matrix[subGridColumn * Grid.rows + cellColumn][subGridRow * Grid.columns + cellRow] = subMatrix[cellRow][cellColumn];
                    }
                }
            }

            return matrix;
        }

        private getCellsMatrix(): ICell[][] {                                                       // Get cells in current grid - returned as an n*m matrix (not separated by sub grids)
            var subGridRow: number = Grid.rows;
            var matrixRow: number = subGridRow * Grid.columns;                                      // Use SubGrid's number of rows i.e. swopped columns
            var matrix: ICell[][] = [];

            var subGridColumns: number = Grid.columns;
            var matrixColumns: number = subGridColumns * Grid.rows;                                 // Use SubGrid's number of columns i.e. swopped rows
            while (matrixRow--)
                matrix[matrixRow] = [];

            while (subGridRow--) {
                var subGridColumn: number = subGridColumns;
                while (subGridColumn--) {
                    var subMatrix = this.subGrids[subGridRow][subGridColumn].getCellsMatrix();

                    var cellColumn: number = Grid.rows;
                    while (cellColumn--) {
                        var cellRow: number = Grid.columns;
                        while (cellRow--)
                            matrix[subGridRow * Grid.columns + cellRow][subGridColumn * Grid.rows + cellColumn] = subMatrix[cellRow][cellColumn];
                    }
                }
            }

            return matrix;
        }

        private getTransposedCellsMatrix(): ICell[][] {                                             // Get state of current grid - returned as a transposed n*m matrix (not separated by sub grids)
            var subGridColumn: number = Grid.columns;
            var matrixColumn: number = subGridColumn * Grid.rows;                                   // Use SubGrid's number of rows i.e. swopped columns
            var matrix: ICell[][] = [];

            var subGridRows: number = Grid.rows;
            var matrixRows: number = subGridRows * Grid.columns;
            while (matrixColumn--)
                matrix[matrixColumn] = [];

            while (subGridColumn--) {
                var subGridRow: number = subGridRows;
                while (subGridRow--) {
                    var subMatrix = this.subGrids[subGridRow][subGridColumn].getCellsMatrix();

                    var cellRow: number = Grid.columns;
                    while (cellRow--) {
                        var cellColumn: number = Grid.rows;
                        while (cellColumn--)
                            matrix[subGridColumn * Grid.rows + cellColumn][subGridRow * Grid.columns + cellRow] = subMatrix[cellRow][cellColumn];
                    }
                }
            }

            return matrix;
        }

        private join(a: any[], b: any[]) {
            Array.prototype.splice.apply(a, [0, 0].concat(b));                                      // Add first 2 arguments sent to splice i.e. start index and number of values to delete  
        }
    }
}
