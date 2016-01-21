'use strict';

module Sudoku {
    export interface ISettingsViewModel {
        columnValues: Array<number>;
        rowValues: Array<number>;
    }

    export interface ISettingsScope extends ng.IScope {
        viewModel: ISettingsViewModel;
        settings: ISettings;
    }

    export class SettingsDirective {
        public static $inject: Array<string> = [];
        constructor() {
            var directive: ng.IDirective = {
                restrict: 'E',
                scope: {},
                templateUrl: 'settingsTemplate.html',
                controller: ['$scope', 'SettingsService', function ($scope: ISettingsScope, settings: ISettings) {
                    $scope.settings = settings;
                    $scope.viewModel = this;
                    $scope.viewModel.columnValues = [1, 2, 3, 4];
                    $scope.viewModel.rowValues = [1, 2, 3];
                }]
            };

            return directive;
        }
    }
}
