'use strict';

module Sudoku {
    export interface ISubGridViewModel {
        setMethodClasses: Array<string>;
        symbolSelected: (fixed: boolean) => void;
    }

    export interface ISubGridScope extends ng.IScope {
        viewModel: ISubGridViewModel;
        column: number;
        row: number;
    }

    export class SubGridDirective {
        public static $inject: Array<string> = [];
        constructor() {
            var directive: ng.IDirective = {
                restrict: 'EA',
                replace: true,
                scope: {
                    grid: '=',
                    column: '@',
                    row: '@',
                    displayStikeOut: '@'
                },
                templateUrl: 'subGridTemplate.html',

                link: function (scope: ISubGridScope, element: JQuery, attributes: ng.IAttributes): void {
                    scope.$on('subGridSymbolSelected', function (event: ng.IAngularEvent, column: number, row: number, symbol: string) {
                        scope.$emit('symbolSelected', scope.column, scope.row, column, row, symbol);// Add the subGrids row and column and propagate to parent
                    });

                    element.on('contextmenu', function (event: ng.IAngularEvent) {                  // Right click between cells
                        alert('clicked');
                        event.preventDefault();
                    });

                    scope.viewModel = {
                        setMethodClasses: ['loaded', 'user', 'calculated'],
                        symbolSelected: function (fixed: boolean) {
                            alert('Symbol Selected fixed: ' + fixed);
                        }
                    };
                }
            };
            return directive;
        }
    }
}