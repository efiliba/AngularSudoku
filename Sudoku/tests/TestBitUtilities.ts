/// <reference path="jasmine.d.ts" />
/// <reference path="../app/Utilities/BitUtilities.ts" />

describe("BitUtilities", function () {
    it("number of bits set", function () {
        expect(Solver.BitUtilities.numberOfBitsSet(333)).toBe(5);                                   // Population count i.e. 333 = 101001101 i.e. 5 bits set
    });

    describe("Set bits", function () {
        it("should have all bits set", function () {
            var elements: number[] = [1, 2, 4, 8];                                                  // 0001 | 0010 | 0100 | 1000 = 1111
            expect(Solver.BitUtilities.bitwiseOR(elements)).toBe(15);                               // Find bits set within all passed elements
        });

        it("should have duplicate bits set only once", function () {
            var elements: number[] = [1, 2, 3];                                                     // 01 | 10 | 11  = 11
            expect(Solver.BitUtilities.bitwiseOR(elements)).toBe(3);
        });

        it("should only have bits set if any item contains that bit", function () {
            var elements: number[] = [2, 6, 12];                                                    // 0010 | 0110 | 1100 = 1110
            expect(Solver.BitUtilities.bitwiseOR(elements)).toBe(14);
        });
    });

    describe("Only set option", function () {
        it("should not have any bits set", function () {
            var xorBits: number[] = [1, 2, 3];                                                      // 01 ^ 10 ^ 11  = 00 
            expect(Solver.BitUtilities.onlyOption(xorBits).found).toBeFalsy();
        });

        it("should have all bits set", function () {
            var xorBits: number[] = [1, 2, 4, 8];                                                   // 0001 ^ 0010 ^ 0100 ^ 1000 = 1111
            expect(Solver.BitUtilities.onlyOption(xorBits).found).toBeFalsy();                      // All bits set i.e. singulare bit required
        });

        it("should have option found at bit 2", function () {
            var xorBits: number[] = [5, 6, 9, 12];                                                  // 0101 ^ 0110 ^ 1001 ^ 1100 = 0010
            var options: Solver.IOnlyOption = Solver.BitUtilities.onlyOption(xorBits);
            expect(options.found).toBeTruthy();
            expect(options.bit).toBe(2);
        });

        it("should not have a singular option set", function () {
            var xorBits: number[] = [3, 6, 12];                                                     // 0011 ^ 0110 ^ 1100 = 1001
            var options: Solver.IOnlyOption = Solver.BitUtilities.onlyOption(xorBits);
            expect(options.found).toBeFalsy();
        });

        it("should only have bit 8 set", function () {
            var xorBits: number[] = [3, 7, 12];                                                     // 0011 ^ 0111 ^ 1100 = 1000
            var options: Solver.IOnlyOption = Solver.BitUtilities.onlyOption(xorBits);
            expect(options.found).toBeTruthy();
            expect(options.bit).toBe(8);
        });
    });

    describe("First index of item in array containing bit", function () {
        var array: number[];

        beforeEach(function () {
            array = [0, 2, 3, 4];                                                                   // 000, 010, 011, 100
        });

        it("should have bit 1 set i.e. index 2", function () {
            expect(Solver.BitUtilities.containingBitIndex(array, 1)).toBe(2);                       // Index of first item that has bit 1 set i.e. 2
        });

        it("should have bit 2 set i.e. index 2", function () {
            expect(Solver.BitUtilities.containingBitIndex(array, 2)).toBe(1);                       // Index of first item that has bit 2 set i.e. 2
        });

        it("should have bit 4 set i.e. index 3", function () {
            expect(Solver.BitUtilities.containingBitIndex(array, 4)).toBe(3);                       // Index of first item that has bit 4 set i.e. 3
        });

        it("should have index out of range", function () {
            expect(Solver.BitUtilities.containingBitIndex(array, 8)).toBe(array.length);            // Bit 8 not set => index out of range
        });

        it("should not have bit 0 found (out of range)", function () {
            expect(Solver.BitUtilities.containingBitIndex(array, 0)).toBe(array.length);            // Bit 0 not found => index out of range
        });
    });

    describe("Highest bit position", function () {
        it("should not exist", function () {
            expect(Solver.BitUtilities.highestBitPosition(0)).toBe(0);
        });

        it("should be 0 in 1", function () {
            expect(Solver.BitUtilities.highestBitPosition(1)).toBe(0);
        });

        it("should be 1 in 10", function () {
            expect(Solver.BitUtilities.highestBitPosition(2)).toBe(1);
        });

        it("should be 1 in 11", function () {
            expect(Solver.BitUtilities.highestBitPosition(3)).toBe(1);
        });

        it("should be 2 in 100", function () {
            expect(Solver.BitUtilities.highestBitPosition(4)).toBe(2);
        });

        it("should be 2 in 101", function () {
            expect(Solver.BitUtilities.highestBitPosition(5)).toBe(2);
        });

        it("should be 2 in 110", function () {
            expect(Solver.BitUtilities.highestBitPosition(6)).toBe(2);
        });

        it("should be 2 in 111", function () {
            expect(Solver.BitUtilities.highestBitPosition(7)).toBe(2);
        });

        it("should be 3 in 1000", function () {
            expect(Solver.BitUtilities.highestBitPosition(8)).toBe(3);
        });

        it("should be 3 in 1001", function () {
            expect(Solver.BitUtilities.highestBitPosition(9)).toBe(3);
        });

        it("should be 4 in 10000", function () {
            expect(Solver.BitUtilities.highestBitPosition(16)).toBe(4);
        });

        it("should be 4 in 10001", function () {
            expect(Solver.BitUtilities.highestBitPosition(17)).toBe(4);
        });

        it("should be 4 in 10010", function () {
            expect(Solver.BitUtilities.highestBitPosition(18)).toBe(4);
        });

        it("should match highestBitPosition function", function () {
            for (var index: number = 1; index < 32; index++)
                expect(Solver.BitUtilities.highestBitPosition(index)).toBe(highestBitPosition(index));
        });

        function highestBitPosition(value: number): number {
            var index: number = 0;
            var bit: number = 1;
            while (bit <= value) {
                bit <<= 1;
                index++;
            }

            return index - 1;
        }
    });

    describe("Power of 2 bit position", function () {
        it("should match", function () {
            expect(Solver.BitUtilities.powerOf2BitPositions[1]).toBe(0);
            expect(Solver.BitUtilities.powerOf2BitPositions[2]).toBe(1);
            expect(Solver.BitUtilities.powerOf2BitPositions[4]).toBe(2);
            expect(Solver.BitUtilities.powerOf2BitPositions[8]).toBe(3);
            expect(Solver.BitUtilities.powerOf2BitPositions[16]).toBe(4);
            expect(Solver.BitUtilities.powerOf2BitPositions[32]).toBe(5);
            expect(Solver.BitUtilities.powerOf2BitPositions[64]).toBe(6);
            expect(Solver.BitUtilities.powerOf2BitPositions[128]).toBe(7);
            expect(Solver.BitUtilities.powerOf2BitPositions[256]).toBe(8);
            expect(Solver.BitUtilities.powerOf2BitPositions[512]).toBe(9);
            expect(Solver.BitUtilities.powerOf2BitPositions[1024]).toBe(10);

            for (var index: number = 0; index < 31; index++)
                expect(Solver.BitUtilities.powerOf2BitPositions[1 << index]).toBe(index);

            expect(Solver.BitUtilities.powerOf2BitPositions[2147483648]).toBe(31);
        });
    });
});