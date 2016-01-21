'use strict';

module Sudoku {
    export interface ICellViewModel {
        selectSymbol: (symbol: string) => void;
        displayStikeOut: boolean;
        symbol?: string;
        symbolSelected?: () => void;
    }

    export interface ICellScope extends ng.IScope {
        viewModel: ICellViewModel;
        grid: Solver.Grid;
        column: number;
        row: number;
        displayStikeOut: string;
    }

    export class CellDirective {
        public static $inject: Array<string> = ['$templateCache', '$compile'];
        constructor($templateCache: ng.ITemplateCacheService, $compile: ng.ICompileService) {
            var directive: ng.IDirective = {
                restrict: 'EA',
                replace: true,
                scope: {
                    grid: '=',
                    column: '@',
                    row: '@',
                    displayStikeOut: '@'
                },
                templateUrl: 'cellTemplate.html',

                link: function (scope: ICellScope, element: JQuery, attributes: ng.IAttributes): void {
                    scope.viewModel = {
                        selectSymbol: function (symbol: string) {                                   // selectSymbol clicked - on cell scope 
                            scope.viewModel.symbol = symbol;                                        // Add scope value used in compiled template
                            scope.viewModel.symbolSelected = function () {
                                alert('Symbol Selected');
                            }

                            var template = $templateCache.get('symbolTemplate.html');
                            element.replaceWith($compile(template)(scope));

                            scope.$emit('subGridSymbolSelected', scope.column, scope.row, symbol);  // Propagate event to parent
                        },

                        displayStikeOut: scope.displayStikeOut === 'true'
                    };

                    element.on('contextmenu', function (event: any) {                               // Right click
                        try {
                            scope.grid[event.target.parentNode.rowIndex].columns[event.target.cellIndex].strikeOut = true;
                        }
                        catch (e) {                                                                 // Ignore clicks between cells
                        }

                        event.preventDefault();
                    });
                }
            };

            return directive;
        }
    }
}

/*  compile: function CompilingFunction($templateElement, $templateAttributes, transcludeFn) {
    // The compile function hooks you up into the DOM before any scope is applied onto the template.
    // It allows you to read attributes from the directive expression (i.e. tag name, attribute, class name or comment)
    // and manipulate the DOM (and only the DOM) as you wish.

    // When you let Angular generate this portion for you, it basically appends your template into the DOM

    return function LinkingFunction($scope, $element, $attrs) {
        // The link function is usually what we become familiar with when starting to learn how to use directives.
        // It gets fired after the template has been compiled, providing you a space to manipulate the directive's scope and DOM elements.

        var html = '<div ng-repeat="item in items">I should not be red</div>';
        var e = $compile(html)($scope);
        $element.replaceWith(e);
    };}*/
