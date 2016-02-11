angular
	.module('Math', [])
	.factory('math', [function(){
		'use strict';
		
		function isPrime(n){
			if (isNaN(n) || !isFinite(n) || n % 1 || n < 2) return false;
			if (n % 2 === 0) return n === 2;
			if (n % 3 === 0) return n === 3;
			var m = Math.sqrt(n);
			for (var i = 5; i <= m; i += 6) {
				if (n % i === 0 || n % (i + 2) === 0) return false;
			}
			return true;
		}
		
		function leastFactor(n){
			if (isNaN(n) || !isFinite(n)) return NaN;  
			if (n == 0) return 0;
			if (n % 1 || n * n < 2) return 1;
			if (n % 2 == 0) return 2;
			if (n % 3 == 0) return 3;
			if (n % 5 == 0) return 5;
			var m = Math.sqrt(n);
			for (var i = 7; i <= m; i += 30) {
				if (n % i == 0)        return i;
				if (n % (i + 4) == 0)  return i + 4;
				if (n % (i + 6) == 0)  return i + 6;
				if (n % (i + 10) == 0) return i + 10;
				if (n % (i + 12) == 0) return i + 12;
				if (n % (i + 16) == 0) return i + 16;
				if (n % (i + 22) == 0) return i + 22;
				if (n % (i + 24) == 0) return i + 24;
			}
			return n;
		}
		
		function getPrimeFactors(n){
			if(isNaN(n) || !isFinite(n) || n % 1 || n === 0){
				return [];
			}
			if(n < 0){
				var factors = getPrimeFactors(-n);
				factors[0] *= -1;
				return factors;
			}
			var minFactor = leastFactor(n);
			if(n === minFactor){
				return [n];
			}
			return [minFactor].concat(getPrimeFactors(n / minFactor));
		}
		
		function greatestCommonDivisor(/*num1, num2, ...*/){
			var numbers = Array.prototype.slice.call(arguments);
			var numbersSize = numbers.length;
			var factors = [];
			var i = numbersSize;
			var gcd = 1;
			var j, firstNumber, factor, notContaining;
			
			while(i--){
				numbers[i] = getPrimeFactors(numbers[i]);
			}
			numbers.sort(function(a, b){
				return a.length - b.length;
			});
			
			numbersSize--;
			firstNumber = numbers.shift();
			i = firstNumber.length;
			while(i--){
				factor = firstNumber[i];
				notContaining = numbers.some(function(number){
					return number.indexOf(factor) === -1;
				});
				if(!notContaining){
					j = numbersSize;
					while(j--){
						numbers[j].splice(numbers[j].indexOf(factor), 1);
					}
					factors.push(factor);
				}
			}
			
			i = factors.length;
			while(i--){
				gcd *= factors[i];
			}
			return gcd;
		}
		
		// http://stackoverflow.com/a/10803250/1806628
		function getRepeatingDecimal(fraction){
			fraction += '';
			var RE_PatternInRepeatDec = /(?:[^\.]+\.\d*)(\d{2,})+(?:\1)$/;
			var RE_RepeatingNums = /^(\d+)(?:\1)$/;
			var match = RE_PatternInRepeatDec.exec(fraction);

			if(!match){
				// Try again but take off last digit incase of precision error.
				fraction = fraction.replace(/\d$/, '');
				match = RE_PatternInRepeatDec.exec(fraction);
			}
			
			if(match && match.length > 1){
				// Reset the match[1] if there is a pattern inside the matched pattern.
				match[1] = RE_RepeatingNums.test(match[1]) ? RE_RepeatingNums.exec(match[1])[1] : match[1];
			}
			
			return match ? match[1] : null;
		}
		
		function fractionToCents(fraction){
			return 1200 * Math.log(fraction) / Math.log(2);
		}
		
		function centsToFraction(cents){
			return Math.pow(2, (cents / 1200))
		}
		
		function fractionToRatio(fraction){
			if(Number.isInteger(fraction)){
				return [fraction, 1];
			}
			
			var repetition = getRepeatingDecimal(fraction);
			var multiplier = (
				repetition !== null
				? Math.pow(10, repetition.length) - 1
				: Math.pow(10, (fraction + '').split('.')[1].length)
			);
			
			var gcd = greatestCommonDivisor(fraction * multiplier, multiplier);
			
			multiplier /= gcd;
			
			return [fraction * multiplier, multiplier];
		}
		
		function ratioToFraction(f1, f2){
			return f2 > f1 ? (f2 / f1) : (f1 / f2);
		}
		
		return {
			isPrime : isPrime,
			leastFactor : leastFactor,
			getPrimeFactors : getPrimeFactors,
			greatestCommonDivisor : greatestCommonDivisor,
			getRepeatingDecimal : getRepeatingDecimal,
			fractionToCents : fractionToCents,
			centsToFraction : centsToFraction,
			fractionToRatio : fractionToRatio,
			ratioToFraction : ratioToFraction
		};
	}])
;