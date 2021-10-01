let numbers = require("numbers")
let functions = require("./PCA.js");
let pgmjs = require("./pgmjs/pgmjs.js");
let fsPromises = require("fs").promises


let dataArray = [];
let filesOuterVariable;

let defaultBasis = numbers.matrix.identity(10304).map((element) => [element]);
let files = fsPromises.readdir("./images");
let array = files.then((result) => {filesOuterVariable = result;
                                    return randomlyChooseFiles(result, 50);});
let data = array.then((result) => Promise.all(result));
let newData = data.then((data) => {
  //console.log("promise data;", data);
  let filteredData = runFilter(data, defaultBasis);
  //console.log(filteredData);
  dataArray.push(filteredData[1]);
  dataArray.push(filteredData[0]);
  return filteredData;
});
for (let i = 1; i < 10304; i++){
  array = newData.then(
    () => {return randomlyChooseFiles(filesOuterVariable, numberOfFilesGiveni(i));}
  );
  data = array.then((result) => Promise.all(result));
  newData = data.then((data) => {
    let newBasis = dataArray[0].slice(1);
    let newData = data;
    let filteredData = runFilter(data, newBasis, false);
    dataArray.push(filteredData[0]);
    dataArray[0] = filteredData[1];
    //console.log(filteredData);
    return filteredData;
  });
}
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
  let result = functions.filter(data, basis, false);
  return result;
}
//dataPoint.then((result) => console.log(result));
