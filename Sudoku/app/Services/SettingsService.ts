'use strict';

module Sudoku {
    export interface ISettings {
        selectedColumns: number;
        selectedRows: number;
        autoSolve: boolean;
        displayStikeOut: boolean;
    }

    export class SettingsService {
        public static $inject: Array<string> = ['$rootScope'];
        constructor($rootScope: ng.IRootScopeService) {
            var settings: ISettings = {
                selectedColumns: 2,
                selectedRows: 2,
                autoSolve: true,
                displayStikeOut: true,
                reset: function () {
                    $rootScope.$broadcast('resetSelected');
                    $rootScope.$broadcast('closeSlider');
                }
            };

            return settings;
        }
    }
}