let numbers = require("numbers")
let functions = require("./PCA.js");
let matrix = [[0,0,0],
              [-1.1,-1.1,-1.15],
              [1.05,1.15,1.1],
              [.5,.5,.5],
              [-.5,-.5,-.5]];

let defaultBasis = [[[1,0,0]],
                    [[0,1,0]],
                    [[0,0,1]]];

let filteredData = functions.filter(matrix, defaultBasis);
//console.log('first least component', filteredData[0]);
//console.log('first basis', filteredData[1]);

/*let testBasis =  [
  [ [ 0.6154836261389978, 0.13708606403288362, -0.7761361459194919 ] ],
  [ [ 0.10545849415347704, 0.9615777103422497, 0.25346955040761354 ] ],
  [ [ 0.7810623611246874, -0.2378565072074525, 0.5773784460935476 ] ]
];*/


let newBasis = filteredData[1].slice(1);

let filteredData2 = functions.filter(matrix, newBasis);

//console.log(filteredData2[0]);
//console.log(filteredData2[1]);
let principleComponent = numbers.matrix.multiply(filteredData2[1][1],[newBasis[0][0],newBasis[1][0]]);
console.log('principle component', principleComponent);
/// to use power iteration, find a vector that really moves on its first go
/// could possibly do better than random vectors in the orthonormalBasis function
