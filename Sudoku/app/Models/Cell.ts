/// <reference path="../Utilities/BitUtilities.ts" />

module Solver {
    export enum SetMethod {
        loaded,
        user,
        calculated
    }

    export interface IJsonCellColumn {
        symbol: string;
        strikeOut?: boolean;
    }

    export interface IJsonCellRow {
        columns: IJsonCellColumn[];
    }

    export interface IJsonCell {
        rows?: IJsonCellRow[];
        symbol?: string;
        setMethod?: SetMethod;
    }

    export interface ICell {
        setMethod: SetMethod;
        options: number;
        json: IJsonCell;
        totalOptionsRemaining: number;

        equale(cell: ICell): boolean;

        symbol(): string;
        getColumn(): number;
        getRow(): number;
        solved(): boolean;
        removeOption(option: number): boolean;
        removeOptionAtPosition(column: number, row: number): boolean;
        removeOptions(remove: number): boolean;
        setByPosition(column: number, row: number, setMethod: SetMethod);
        setByOption(option: number, setMethod: SetMethod);
        setBySymbol(symbol: string, setMethod: SetMethod);
        reset();
        containsOption(option: number): boolean;
        containsOptionAtPosition(column: number, row: number): boolean;
        containsOptions(checkOptions: number): boolean;
        containsSymbol(symbol: string): boolean;
        removedOptionsPerRow(row: number): number[];
        setJson(json: IJsonCell);
    }

    export class Cell implements ICell {
        private static symbols: string;
        private static columns: number;
        private static rows: number;

        public setMethod: SetMethod;
        public options: number;
        public setColumn: number;
        public setRow: number;
        public json: IJsonCell;

        public totalOptionsRemaining: number;

        static Constructor(columns: number, rows: number) {                                         // Static constructor
            Cell.symbols = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0"
            Cell.columns = columns;
            Cell.rows = rows;
        }

        //static Copy(cells: ICell[]): ICell[]{
        //    var copy: ICell[] = [];
        //    cells.forEach(function (e) {
        //        copy.push(new Cell(<Cell>e));
        //    });
        //    return copy;
        //}

        constructor(column: number, row: number);
        constructor(copy: ICell);
        constructor(public column: any, public row?: number) {
            if (typeof column === "number")
                this.reset();
            else {                                                                                  // Copy constructor
                var copy: Cell = <Cell>column;
                this.column = copy.column;
                this.row = copy.row;
                this.setMethod = copy.setMethod;

                this.options = copy.options;
                this.setColumn = copy.setColumn;
                this.setRow = copy.setRow;
                this.totalOptionsRemaining = copy.totalOptionsRemaining;

                if (copy.json.rows) {
                    this.json = { rows: [] };
                    for (var row: number = 0; row < copy.json.rows.length; row++) {
                        this.json.rows[row] = { columns: [] };
                        var jsonColumns: IJsonCellColumn[] = copy.json.rows[row].columns;
                        for (var column = 0; column < jsonColumns.length; column++) {
                            this.json.rows[row].columns[column] = { symbol: jsonColumns[column].symbol };
                            if (jsonColumns[column].strikeOut)
                                this.json.rows[row].columns[column].strikeOut = jsonColumns[column].strikeOut;
                        }
                    }
                }
                else 
                    this.json = { symbol: copy.json.symbol, setMethod: copy.json.setMethod };
            }
        }

        public reset() {
            this.setMethod = null;

            this.options = (1 << Cell.columns * Cell.rows) - 1;                                     // Set all bits
            this.setColumn = -1;
            this.setRow = -1;
            this.totalOptionsRemaining = Cell.columns * Cell.rows;

            this.json = { rows: [] };                                                               // Set JSON representation to all options available 
            for (var row: number = 0, index: number = 0; row < Cell.rows; row++) {
                var columns: IJsonCellColumn[] = [];
                for (var column = 0; column < Cell.columns; column++)
                    columns.push({ symbol: Cell.symbols[index++] });
                this.json.rows.push({ columns: columns });
            }
        }

        public equale(cell: Cell): boolean {
            return (this.setColumn === cell.setColumn || cell.setColumn === -1) && (this.setRow === cell.setRow || cell.setRow === -1) && this.options === cell.options;
            //return this.options === cell.options;
        }

        public symbol(): string {
            return Cell.symbols[this.setRow * Cell.columns + this.setColumn];
        }

        public getColumn(): number {
            return this.column;
        }

        public getRow(): number {
            return this.row;
        }

        public solved(): boolean {
            return this.totalOptionsRemaining === 1;
        }

        public removeOptionAtPosition(column: number, row: number): boolean {                       // Return if last option left after removing this option
            var lastOptionFound: boolean = false;

            var bit: number = 1 << Cell.columns * row + column;
            if (this.options & bit) {                                                               // Check if option to remove exists
                this.options &= ~bit;
                if (--this.totalOptionsRemaining === 1) {
                    this.setRemainingOption(this.options);                                          // Set last remaining option's column and row 
                    this.json = { symbol: Cell.symbols[BitUtilities.powerOf2BitPositions[this.options]] };
                    this.setMethod = SetMethod.calculated;
                    lastOptionFound = true;
                }
                else
                    this.json.rows[row].columns[column].strikeOut = true;                           // Only set strikeOut to true if option removed - else leave empty   
            }

            return lastOptionFound;
        }

        public removeOption(option: number): boolean {                                              // Return if last option left after removing this option
            var lastOptionFound: boolean = false;

            if (this.options & option && this.totalOptionsRemaining > 1) {                          // Check if option to remove exists and not last option
                this.options &= ~option;
                if (--this.totalOptionsRemaining === 1) {
                    this.setRemainingOption(this.options);                                          // Set last remaining option's column and row 
                    this.json = { symbol: Cell.symbols[BitUtilities.powerOf2BitPositions[this.options]] };
                    this.setMethod = SetMethod.calculated;
                    lastOptionFound = true;
                }
                else {
                    var index: number = BitUtilities.powerOf2BitPositions[option];
                    this.json.rows[index / Cell.columns >> 0].columns[index % Cell.columns].strikeOut = true;
                }
            }

            return lastOptionFound;
        }

        public removeOptions(remove: number): boolean {
            var lastOptionFound: boolean = false;

            var removeOptions: number = this.options & remove;
            if (removeOptions && this.totalOptionsRemaining > 1 && this.options & ~remove) {      // Remove options iff cell contains other options
                this.options -= removeOptions;
                this.totalOptionsRemaining -= BitUtilities.numberOfBitsSet(removeOptions);

                if (this.totalOptionsRemaining === 1) {
                    this.setRemainingOption(this.options);                                          // Set last remaining option's column and row 
                    this.json = { symbol: Cell.symbols[BitUtilities.powerOf2BitPositions[this.options]] };
                    this.setMethod = SetMethod.calculated;
                    lastOptionFound = true;
                }
                else
                    while (removeOptions) {
                        var highestBitPos: number = BitUtilities.highestBitPosition(removeOptions);
                        this.json.rows[highestBitPos / Cell.columns >> 0].columns[highestBitPos % Cell.columns].strikeOut = true;
                        removeOptions -= 1 << highestBitPos;
                    }
            }

            return lastOptionFound;
        }

        public setByPosition(column: number, row: number, setMethod: SetMethod) {
            this.clearAllExceptAtPosition(this.setColumn = column, this.setRow = row, this.setMethod = setMethod);
        }

        private setByIndex(index: number, setMethod: SetMethod) {
            this.clearAllExceptAtPosition(this.setColumn = index % Cell.columns, this.setRow = index / Cell.columns >> 0, this.setMethod = setMethod);
        }

        public setByOption(option: number, setMethod: SetMethod) {
            this.setByIndex(BitUtilities.powerOf2BitPositions[option], setMethod);
        }

        public setBySymbol(symbol: string, setMethod: SetMethod){
            this.setByIndex(Cell.symbols.indexOf(symbol), setMethod);
        }

        public containsOption(option: number): boolean {
            return (this.options & option) > 0;
        }

        public containsOptionAtPosition(column: number, row: number): boolean {
            var bit: number = 1 << row * Cell.columns + column;
            return (this.options & bit) > 0;
        }

        public containsOptions(checkOptions: number): boolean {
            return (this.options & checkOptions) === checkOptions;
        }

        public containsSymbol(symbol: string): boolean {
            var index: number = Cell.symbols.indexOf(symbol);
            return (this.options & 1 << index) > 0;
        }

        private setRemainingOption(options: number) {
            var index: number = BitUtilities.highestBitPosition(options);
            this.setColumn = index % Cell.columns;
            this.setRow = index / Cell.columns >> 0;
        }

        private clearAllExcept(option: number, fix: boolean) {
            this.options = option;
            this.json = { symbol: Cell.symbols[BitUtilities.powerOf2BitPositions[option]], fixed: fix };
            this.totalOptionsRemaining = 1;
        }

        private clearAllExceptAtPosition(column: number, row: number, setMethod: SetMethod) {
            this.options = 1 << Cell.columns * row + column;
            this.json = { symbol: Cell.symbols[BitUtilities.powerOf2BitPositions[this.options]], setMethod: setMethod };
            this.totalOptionsRemaining = 1;
        }

        public removedOptionsPerRow(row: number): number[] {
            var removedOptions: number[] = [];
            for (var column: number = 0, bit: number = 1 << row * Cell.columns; column < Cell.columns; column++, bit <<= 1) // bit = 1 << row * columns + column
                if (!(this.options & bit))
                    removedOptions.push(column);

            return removedOptions;
        }

        // Remove options iff cell contains other options
        public removeIfExtraOptions(options: number): boolean {
            return this.totalOptionsRemaining > 1 && (this.options & ~options) > 0 && this.removeOptions(options);
        }

        public setJson(json: IJsonCell) {
            if (json.rows) {
                this.options = 0;
                this.totalOptionsRemaining = 0;
                for (var row: number = 0, option: number = 1; row < json.rows.length; row++) {
                    var columns: IJsonCellColumn[] = json.rows[row].columns;
                    for (var column = 0; column < columns.length; column++, option <<= 1)
                        if (!columns[column].strikeOut) {
                            this.options += option;
                            this.totalOptionsRemaining++;
                        }
                }
            }
            else
                this.setBySymbol(json.symbol, json.setMethod);

            this.json = json;
        }
    }
}