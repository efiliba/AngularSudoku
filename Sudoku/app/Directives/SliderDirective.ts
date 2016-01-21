/// <reference path="../../../../DefinitelyTyped-master/angularjs/angular.d.ts" />
/// <reference path="../../../../DefinitelyTyped-master/greensock/greensock.d.ts" />

'use strict';

module Sudoku {
    export interface ISliderViewModel {
        sliderOpen: boolean;
        slide: () => void;
    }

    export interface ISliderScope extends ng.IScope {
        viewModel: ISliderViewModel;
    }

    export class SliderDirective {
        public static $inject: Array<string> = ['$animate'];
        constructor($animate) {
            var directive: ng.IDirective = {
                restrict: 'EA',
                replace: false,
                transclude: true,
                templateUrl: 'sliderTemplate.html',
                controller: ['$scope', function ($scope: ISliderScope) {
                    $scope.viewModel = this;
                    $scope.viewModel.sliderOpen = false;
                    $scope.viewModel.slide = function () {
                        $scope.viewModel.sliderOpen = !$scope.viewModel.sliderOpen;
                    }
                }],

                link: function (scope: ISliderScope, element: JQuery, attributes: ng.IAttributes): void {
                    scope.$on('closeSlider', function (event: ng.IAngularEvent) {
                        $animate.removeClass(element, "sliderOpen");
                        scope.viewModel.sliderOpen = false;
                    });
                }
            };
            return directive;
        }
    }

    export class SliderOpenAnimation {
        public static $inject: Array<string> = [];
        constructor() {
            return {
                addClass: function (element: JQuery) {
                    TweenMax.set(element.find('settings').eq(0), { css: { marginLeft: '0px', opacity: '1' } });
                    TweenMax.to(element, 1, {
                        right: '0px',
                        backgroundColor: 'gray',
                        onComplete: function () { element.find('input').eq(0).val('»'); }
                    });
                },
                removeClass: function (element) {
                    TweenMax.set(element, { width: '194px' });                                      // Increase width to accommodate margin
                    var timeline = new TimelineMax({
                        tweens: [new TweenMax(element, 1, { right: '-177px', backgroundColor: 'transparent' }), ]
                    });
                    timeline.insert(new TweenMax(element.find('settings').eq(0), 0.5, { opacity: '0' }), 0.5);
                    timeline.addCallback(function () {                                              // onComplete
                        element.find('input').eq(0).val('«');
                        TweenMax.set(element, { width: '177px', right: '-160px' });
                        TweenMax.set(element.find('settings').eq(0), { marginLeft: '17px' });
                    }, 1);
                }
            };
        }
    }
}