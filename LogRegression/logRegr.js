function logRegression(coeff1, coeff2, bias) {
	this.bias = bias;
	this.coeff = [coeff1, coeff2];

	this.decisionFunction = function(coordinates) {
		return coordinates[0] * this.coeff[0] + coordinates[1] * this.coeff[1] + this.bias;
	}

	this.probability = function(coordinates) {
		var decision = this.decisionFunction(coordinates);
		return 1 / (1 + Math.exp(-decision));
	}

	this.loglossPenalties = function(coordinates) {
		probabilities = this.probability(coordinates);
		return [-Math.log(1 - probabilities), -Math.log(probabilities)];
	}

	this.decisionLine = function() {
		var cx = this.coeff[0], cy = this.coeff[1];
		var x_1, y_1, x_2, y_2;
		if (Math.abs(this.coeff[0]) > Math.abs(this.coeff[1])) {
			y_1 = -4, y_2 = 4;
			x_1 = - (cy * y_1 + this.bias) / cx;
			x_2 = - (cy * y_2 + this.bias) / cx;
		}
		else {
			x_1 = -4, x_2 = 4;
			y_1 = - (cx * x_1 + this.bias) / cy;
			y_2 = - (cx * x_2 + this.bias) / cy;
		}
		return {x1:x_1, x2: x_2, y1: y_1, y2: y_2};
	}
	
	this.normalVector = function() {
		var c_1 = this.coeff[0], c_2 = this.coeff[1];
		var p = -this.bias / (Math.pow(c_1, 2) + Math.pow(c_2, 2));
		var x_1 = c_1 * p, y_1 = c_2 * p;
		var x_2 = x_1 + c_1, y_2 = y_1 + c_2;
		return {x1:x_1, x2: x_2, y1: y_1, y2: y_2};
	}
}
// создадим вспомогательную функцию, которая будет возвращать bias при входных coeff 
//и (x,y) - точка, через которую проходит decisionLine
function returnBias(x_1, y_1, c_1, c_2) {
	return -x_1 * c_1 - y_1 * c_2;
}