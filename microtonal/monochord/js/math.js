(function(){
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
		if (n==0) return 0;
		if (n%1 || n*n<2) return 1;
		if (n%2==0) return 2;
		if (n%3==0) return 3;
		if (n%5==0) return 5;
		var m = Math.sqrt(n);
		for (var i=7;i<=m;i+=30) {
			if (n%i==0)      return i;
			if (n%(i+4)==0)  return i+4;
			if (n%(i+6)==0)  return i+6;
			if (n%(i+10)==0) return i+10;
			if (n%(i+12)==0) return i+12;
			if (n%(i+16)==0) return i+16;
			if (n%(i+22)==0) return i+22;
			if (n%(i+24)==0) return i+24;
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
	
	function greatestCommonDivisor(){
		var numbers = [].slice.call(arguments);
		numbers.forEach(function(number, index, array){
			array[index] = getPrimeFactors(number);
		})
		numbers.sort(function(a, b){
			return a.length - b.length;
		});
		var factors = [];
		numbers.shift().forEach(function(factor){
			var notContaining = numbers.some(function(number){
				return number.indexOf(factor) === -1;
			});
			if(!notContaining){
				numbers.forEach(function(number, index, array){
					array[index].splice(number.indexOf(factor), 1);
				});
				factors.push(factor);
			}
		});
		return factors.reduce(function(previousValue, currentValue){
			return previousValue * currentValue;
		}, 1);
	}
	
	angular
		.module('Math', [])
		.factory('math', function(){
			return {
				isPrime : isPrime,
				leastFactor : leastFactor,
				getPrimeFactors : getPrimeFactors,
				greatestCommonDivisor : greatestCommonDivisor
			};
		})
	;
})();