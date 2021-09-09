let numbers = require("numbers")
let functions = require("./PCA.js");
let pgmjs = require("./pgmjs/pgmjs.js");
let fsPromises = require("fs").promises


/*let matrix = [[0,0,0],
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

let testBasis =  [
  [ [ 0.6154836261389978, 0.13708606403288362, -0.7761361459194919 ] ],
  [ [ 0.10545849415347704, 0.9615777103422497, 0.25346955040761354 ] ],
  [ [ 0.7810623611246874, -0.2378565072074525, 0.5773784460935476 ] ]
];


let newBasis = filteredData[1].slice(1);

let filteredData2 = functions.filter(matrix, newBasis);

//console.log(filteredData2[0]);
//console.log(filteredData2[1]);
let principleComponent = numbers.matrix.multiply(filteredData2[1][1],[newBasis[0][0],newBasis[1][0]]);
console.log('principle component', principleComponent);
*/

/// to use power iteration, find a vector that really moves on its first go
/// could possibly do better than random vectors in the orthonormalBasis function
let dataArray;
let defaultBasis = numbers.matrix.identity(10304).map((element) => [element]);
let files = fsPromises.readdir("./images");
let array = files.then((result) => randomlyChooseFiles(result, 50));
let data = array.then((result) => Promise.all(result));
let newData = data.then((data) => {
  let filteredData = runFilter(data, defaultBasis);
  console.log(filteredData);
  dataArray.push(filteredData);
  return filteredData;
});
for (let i = 1; i < 1000; i++){
  data = newData.then(
    (filteredData) => {
      let randomFiles = randomlyChooseFiles(array.state, numberOfFilesGiveni(i));
      return randomFiles;
    }
  );
  newData = data.then(
    (result) => {
      let filteredData = runFilter(data, dataArray[i-1]);
      dataArray.push(filteredData);
      console.log(filteredData);
      return filteredData;
    }
  );
}
console.log("done");
/*for (let i = 0; i<1000; i++){
  let tempArray = newData.then((result)=> randomlyChooseFiles(result))
}*/

function numberOfFilesGiveni(i){
  if (i<500){
    return 35;
  }else if (i<5000){
    return 40;
  }else{
    return 100;
  }
}


function randomlyChooseFiles (arrayOfFiles, numberOfFiles){
  let array = [];
  for(let i = 0; i<numberOfFiles; i++){
    let randomIndex = Math.floor(Math.random()*arrayOfFiles.length);
    let randomImagePromise = pgmjs.readPgm("./images/"+arrayOfFiles[randomIndex]).then((result) => result.pixels);
    array.push(randomImagePromise);
  }
  return array;
}

function runFilter(data, basis){
  console.log("starting runFilter");
  let result = functions.filter(data, basis, false);
  return result;
}
//dataPoint.then((result) => console.log(result));
