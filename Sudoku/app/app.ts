/// <reference path='../../../DefinitelyTyped-master/angularjs/angular.d.ts' />
/// <reference path='../../../DefinitelyTyped-master/angularjs/angular-route.d.ts' />
/// <reference path='../../../DefinitelyTyped-master/jquery/jquery.d.ts' />

/// <reference path='Models/Grid.ts' />
/// <reference path='Models/SubGrid.ts' />
/// <reference path='Models/Cell.ts' />

/// <reference path='Services/SettingsService.ts' />

/// <reference path='Controllers/BoardController.ts' />

/// <reference path='Directives/SubGridDirective.ts' />
/// <reference path='Directives/CellDirective.ts' />
/// <reference path='Directives/SliderDirective.ts' />
/// <reference path='Directives/SettingsDirective.ts' />

'use strict';

module Sudoku {
    var app: ng.IModule = angular.module('sudoku', ['ngRoute', 'ngAnimate', 'sudoku.service']);

    app.run(function ($http, $templateCache) {
        //    $http.get('app/Views/subGridTemplate.html', { cache: $templateCache });
        $http({ method: 'GET', url: 'app/Views/subGridTemplate.html' }).
            success(function (data) {
                $templateCache.put('subGridTemplate.html', data);
            });

        $http({ method: 'GET', url: 'app/Views/cellTemplate.html' }).
            success(function (data) {
                $templateCache.put('cellTemplate.html', data);
            });

        $http({ method: 'GET', url: 'app/Views/symbolTemplate.html' }).
            success(function (data) {
                $templateCache.put('symbolTemplate.html', data);
            });

        $templateCache.put("sliderTemplate.html", '<div ng-transclude />');

        //$http({ method: 'GET', url: 'app/Views/settingsTemplate.html' }).
        //    success(function (data) {
        //        $templateCache.put('settingsTemplate.html', data);
        //    });

        $templateCache.put("settingsTemplate.html", '' +
        //        '<div class="content">' +
            '    Columns:<select ng-model="settings.selectedColumns" ng-options="v for v in viewModel.columnValues" />' +
            '    Rows:<select ng-model="settings.selectedRows" ng-options="v1 for v1 in viewModel.rowValues" />' +
            '    <br /> ' +
            '    <button ng-click="settings.reset();">Reset</button>' +
        //        '</div>');
            '');
    });

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
            when('/', { templateUrl: 'app/Views/board.html', controller: 'Sudoku.BoardController' }).
            otherwise({ redirectTo: '/' });
    }]);

    app.service('SettingsService', SettingsService);
    app.directive('settings', SettingsDirective);

    app.directive('subGrid', SubGridDirective);
    app.directive('cell', CellDirective);

    app.directive('slider', SliderDirective);
    app.animation('.sliderOpen', SliderOpenAnimation);
}