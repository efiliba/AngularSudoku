/// <reference path="../../../../DefinitelyTyped-master/angularjs/angular.d.ts" />

'use strict';

module Sudoku {
    export interface IBoardScope extends ng.IScope {
        viewModel: BoardController;
        settings: ISettings;
    }

    export class BoardController {
        board: Solver.IJsonGrid;
        reset;
        
        public static $inject: Array<string> = ['$scope', 'SettingsService'];
        constructor(private $scope: IBoardScope, private settings: ISettings) {
            $scope.settings = settings;
            $scope.viewModel = this;

            Solver.Grid.Constructor(settings.selectedColumns, settings.selectedRows);
            var grid: Solver.IGrid = new Solver.Grid();

            //grid.setByOption(0, 0, 0, 0, 1, Solver.SetMethod.loaded);
            //grid.setByOption(0, 0, 1, 1, 2, Solver.SetMethod.loaded);
            //grid.setByOption(1, 1, 0, 0, 4, Solver.SetMethod.loaded);
            //grid.setByOption(1, 1, 1, 1, 8, Solver.SetMethod.loaded);

//            grid.setByOption(1, 0, 1, 0, 2, Solver.SetMethod.loaded);

            //grid.setByOption(1, 0, 1, 0, 1, Solver.SetMethod.loaded);
            //grid.setByOption(1, 0, 0, 1, 2, Solver.SetMethod.loaded);
            //grid.setByOption(0, 1, 1, 0, 2, Solver.SetMethod.loaded);
            //grid.setByOption(0, 1, 0, 1, 4, Solver.SetMethod.loaded);

            //this.hard2x3(grid);
            //this.test3x2(grid);
            //this.diabolical3x3(grid);

            //this.unsolved3x3(grid);       // http://www.efamol.com/uploads/2012sudoku-solved.jpg
            //grid.solve(0, 2);

            $scope.viewModel.board = grid.toJson();

            $scope.$on('symbolSelected', function (event: ng.IAngularEvent, subGridColumn: number, subGridRow: number, cellColumn: number, cellRow: number, symbol: string) {
                if (settings.autoSolve && !grid.isStruckOut(subGridColumn, subGridRow, cellColumn, cellRow, symbol)) {
                    grid.setBySymbol(subGridColumn, subGridRow, cellColumn, cellRow, symbol, Solver.SetMethod.user);
                    var solved: boolean = grid.solve(17, 1);
                    $scope.viewModel.board = grid.toJson();
                }
            });

            $scope.$on('resetSelected', function (event: ng.IAngularEvent) {
                Solver.Grid.Constructor(settings.selectedColumns, settings.selectedRows);
                grid.reset();
                $scope.viewModel.board = grid.toJson();
                $scope.$apply();
            });
        }

        private test3x2(grid: Solver.IGrid) {
            grid.setByOption(0, 0, 0, 0, 1, Solver.SetMethod.loaded);
            grid.setByOption(0, 0, 1, 1, 2, Solver.SetMethod.loaded);

            grid.setByOption(1, 0, 0, 2, 4, Solver.SetMethod.loaded);

            grid.setByOption(1, 1, 1, 0, 8, Solver.SetMethod.loaded);

            grid.setByOption(2, 1, 0, 1, 16, Solver.SetMethod.loaded);
            grid.setByOption(2, 1, 1, 2, 32, Solver.SetMethod.loaded);

            grid.setByOption(2, 0, 1, 0, 2, Solver.SetMethod.loaded);
            grid.setByOption(2, 0, 0, 1, 4, Solver.SetMethod.loaded);
        }

        private hard2x3(grid: Solver.IGrid) {
            grid.setByOption(0, 0, 0, 1, 1, Solver.SetMethod.loaded);

            grid.setByOption(0, 0, 2, 0, 32, Solver.SetMethod.loaded);

            grid.setByOption(0, 1, 0, 0, 4, Solver.SetMethod.loaded);
            grid.setByOption(0, 1, 0, 1, 16, Solver.SetMethod.loaded);

            grid.setByOption(0, 2, 1, 0, 16, Solver.SetMethod.loaded);
            grid.setByOption(0, 2, 1, 1, 8, Solver.SetMethod.loaded);

            grid.setByOption(1, 0, 1, 0, 4, Solver.SetMethod.loaded);
            grid.setByOption(1, 0, 1, 1, 2, Solver.SetMethod.loaded);

            grid.setByOption(1, 1, 2, 0, 32, Solver.SetMethod.loaded);
            grid.setByOption(1, 1, 2, 1, 2, Solver.SetMethod.loaded);

            grid.setByOption(1, 2, 0, 1, 2, Solver.SetMethod.loaded);
            grid.setByOption(1, 2, 2, 0, 4, Solver.SetMethod.loaded);
        }

        private diabolical3x3(grid: Solver.IGrid) {
            grid.setByOption(0, 0, 1, 1, 2, Solver.SetMethod.loaded);

            grid.setByOption(1, 0, 0, 0, 64, Solver.SetMethod.loaded);
            grid.setByOption(1, 0, 2, 0, 8, Solver.SetMethod.loaded);
            grid.setByOption(1, 0, 1, 1, 1, Solver.SetMethod.loaded);
            grid.setByOption(1, 0, 1, 2, 128, Solver.SetMethod.loaded);

            grid.setByOption(2, 0, 2, 0, 16, Solver.SetMethod.loaded);
            grid.setByOption(2, 0, 1, 1, 64, Solver.SetMethod.loaded);
            grid.setByOption(2, 0, 2, 2, 2, Solver.SetMethod.loaded);

            grid.setByOption(0, 1, 1, 0, 256, Solver.SetMethod.loaded);
            grid.setByOption(0, 1, 0, 1, 32, Solver.SetMethod.loaded);
            grid.setByOption(0, 1, 1, 2, 16, Solver.SetMethod.loaded);
            grid.setByOption(0, 1, 2, 2, 4, Solver.SetMethod.loaded);

            grid.setByOption(1, 1, 2, 0, 32, Solver.SetMethod.loaded);
            grid.setByOption(1, 1, 1, 1, 64, Solver.SetMethod.loaded);
            grid.setByOption(1, 1, 0, 2, 2, Solver.SetMethod.loaded);

            grid.setByOption(2, 1, 0, 0, 2, Solver.SetMethod.loaded);
            grid.setByOption(2, 1, 1, 0, 16, Solver.SetMethod.loaded);
            grid.setByOption(2, 1, 2, 1, 128, Solver.SetMethod.loaded);
            grid.setByOption(2, 1, 1, 2, 1, Solver.SetMethod.loaded);

            grid.setByOption(0, 2, 0, 0, 8, Solver.SetMethod.loaded);
            grid.setByOption(0, 2, 1, 1, 4, Solver.SetMethod.loaded);
            grid.setByOption(0, 2, 0, 2, 2, Solver.SetMethod.loaded);

            grid.setByOption(1, 2, 1, 0, 256, Solver.SetMethod.loaded);
            grid.setByOption(1, 2, 1, 1, 32, Solver.SetMethod.loaded);
            grid.setByOption(1, 2, 0, 2, 8, Solver.SetMethod.loaded);
            grid.setByOption(1, 2, 2, 2, 64, Solver.SetMethod.loaded);

            grid.setByOption(2, 2, 1, 1, 256, Solver.SetMethod.loaded);
        }

        private unsolved3x3(grid: Solver.IGrid) {
            grid.setByOption(0, 0, 0, 0, 128, Solver.SetMethod.loaded);
            grid.setByOption(0, 0, 2, 1, 4, Solver.SetMethod.loaded);
            grid.setByOption(0, 0, 1, 2, 64, Solver.SetMethod.loaded);

            grid.setByOption(1, 0, 0, 1, 32, Solver.SetMethod.loaded);
            grid.setByOption(1, 0, 1, 2, 256, Solver.SetMethod.loaded);

            grid.setByOption(2, 0, 0, 2, 2, Solver.SetMethod.loaded);

            grid.setByOption(0, 1, 1, 0, 16, Solver.SetMethod.loaded);

            grid.setByOption(1, 1, 2, 0, 64, Solver.SetMethod.loaded);
            grid.setByOption(1, 1, 1, 1, 8, Solver.SetMethod.loaded);
            grid.setByOption(1, 1, 2, 1, 16, Solver.SetMethod.loaded);
            grid.setByOption(1, 1, 0, 2, 1, Solver.SetMethod.loaded);

            grid.setByOption(2, 1, 0, 1, 64, Solver.SetMethod.loaded);
            grid.setByOption(2, 1, 1, 2, 4, Solver.SetMethod.loaded);

            grid.setByOption(0, 2, 2, 0, 1, Solver.SetMethod.loaded);
            grid.setByOption(0, 2, 2, 1, 128, Solver.SetMethod.loaded);
            grid.setByOption(0, 2, 1, 2, 256, Solver.SetMethod.loaded);

            grid.setByOption(1, 2, 0, 1, 16, Solver.SetMethod.loaded);

            grid.setByOption(2, 2, 1, 0, 32, Solver.SetMethod.loaded);
            grid.setByOption(2, 2, 2, 0, 128, Solver.SetMethod.loaded);
            grid.setByOption(2, 2, 1, 1, 1, Solver.SetMethod.loaded);
            grid.setByOption(2, 2, 0, 2, 8, Solver.SetMethod.loaded);
        }

/*        public static $inject: Array<string> = ['$scope', 'Puzzle'];
        constructor(private $scope: IBoardScope, private Puzzle) {
            $scope.viewModel = this;
            var puzzle = Puzzle.get({}, function () {
                Solver.Grid.Constructor(puzzle.columns, puzzle.rows);

                var grid = new Solver.Grid();
                grid.setJson(<Solver.IJsonGrid>puzzle.board);
                //grid.setByOption(0, 0, 0, 0, 1);
                //grid.setByOption(0, 0, 1, 1, 2);
                //grid.setByOption(1, 1, 0, 0, 4);
                //grid.setByOption(1, 1, 1, 1, 8);

                //grid.setByOption(1, 0, 1, 0, 2);

                $scope.viewModel.grid = grid;
                $scope.viewModel.board = grid.toJson();

                //$scope.viewModel.board = <Solver.IJsonGrid>puzzle.board;
            });
        }*/
    }
}