let numbers = require('numbers');

//reflectionVector has norm 1
function housholderReflection(reflectionVector, vector){
  result = numbers.matrix.subtraction(
    [reflectionVector], numbers.matrix.scalar([vector],2*numbers.matrix.dotproduct(reflectionVector,vector))
  );
  return result[0];
}

// $matrix is a array of basis vectors
// $vector is the vector with coordinates cooresponding to the basis basisVectors
// in a sense the inverse of $transform()
function matrixVectorMultiply(matrix, vector){
  let dimension = matrix[0].length;
  let result = new Array(dimension).fill(0);
  for (let i = 0; i<vector.length; i++){
    let vectorEntry = vector[i];
    let currentRow = matrix[i];
    let entry = 0;
    for (let j = 0; j<dimension; j++){
      result[j] += currentRow[j]*vectorEntry;
    }
  }
  return result;
}


// matrix is an array of arrays, each inner array should satisfy array.length = dimension
// SHOULD return an array containing the mean of each dimension (average vector basically)
function findMeans (dataset, dimension) {
  let result = new Array(dimension).fill(0);
  for (let dataPoint of dataset){
    for (let i = 0; i<dimension; i++){
      result[i] += dataPoint[i];
    }
  }
  for (let i = 0; i<dimension; i++){
    result[i] = result[i]/dataset.length;
  }
  return result;
}

// SHOULD return variance vector
function findVariance (dataset, dimension, meanVector){
  let result = new Array(dimension).fill(0);
  for (let dataPoint of dataset){
    for (let i = 0; i<dimension; i++){
      result[i] += (dataPoint[i]-meanVector[i])**2;
    }
  }
  for (let i = 0; i<dimension; i++){
    result[i] = result[i]/dataset.length;
  }
  return result;
}

// matrix is an array of arrays, each inner array should satisfy array.length = dimension
// SHOULD return the normalized and standardized dataset, and SHOULD not change the original dataset.
function normalizeMatrix (dataset, dimension, toStandardize) {
  let meanVector = findMeans(dataset, dimension);
  let result = new Array(dataset.length).fill().map(() => new Array(dimension).fill(0));
  if (toStandardize){
    let varianceVector = findVariance(dataset, dimension, meanVector);
    for (let i = 0; i<dataset.length; i++){
      for (let j = 0; j<dimension; j++){
        result[i][j] = (dataset[i][j]-meanVector[j])/varianceVector[j];
      }
    }
  }else{
    for (let i = 0; i<dataset.length; i++){
      for (let j = 0; j<dimension; j++){
        result[i][j] = (dataset[i][j]-meanVector[j])
      }
    }
  }
  return result;
}

// computes the covariance matrix given a normalized and standardized dataset
function computeCovariance (dataset, dimension) {
  let result = new Array(dimension).fill().map(() => new Array(dimension).fill(0));
  console.log("created array of zeros for covariance matrix");
  for (let i = 0; i<dimension; i++){
    let resultRowi = result[i];
    for (let k = 0; k<dataset.length; k++){
      let datasetRowk = dataset[k];
      for (let j = 0; j<dimension; j++){
        resultRowi[j] += datasetRowk[i]*datasetRowk[j];
      }
    }
  }
  result = numbers.matrix.scalar(result, 1/(dataset.length-1));
  return result;
}

// used in $computeEigenvalues()$, does not change value of $vector$
function powerIteration (vector, covariance, iterations) {
  let dimension = vector.length;
  for (let i = 0; i<iterations; i++){
    let temporaryVector = matrixVectorMultiply(covariance, vector);
    let norm = Math.sqrt(numbers.matrix.dotproduct(temporaryVector,temporaryVector));

    temporaryVector = numbers.matrix.scalar([temporaryVector], 1/norm);
    console.log("powerIteration round", i);
    vector = temporaryVector[0];

  }

  return vector;
}

// dataset in this case must already be normalized and standardized
// given a covariance matrix SHOULD compute the the first n eigenvectors and their corresponding eigenvalues
// DONT USE THIS FUNCTION it isnt finished yet
function computeEigenvalues (covariance, iterations) {
  let dimension = covariance.length;
  let basisArray = new Array(dimension).fill().map(() => new Array(dimension).fill(0));
  for (let i = 0; i<dimension; i++){
    basisArray[i][i] = 1;
  }

  for (let i = 0; i<dimension; i++){
    basisArray[i] = powerIteration(basisArray[i], covariance, iterations);

  }
  return basisArray;
}

function specialPowerIteration (vector, covariance, iterations, bound) {
  let dimension = vector.length;
  for (let i = 0; i<iterations; i++){
    let temporaryVector = matrixVectorMultiply(covariance, vector);
    temporaryVector = (numbers.matrix.subtraction(numbers.matrix.scalar([vector], bound),[temporaryVector]))[0];

    let norm = Math.sqrt(numbers.matrix.dotproduct(temporaryVector,temporaryVector));
    temporaryVector = numbers.matrix.scalar([temporaryVector], 1/norm);

    vector = temporaryVector[0];

    console.log("specialPowerIteration: on iteration", i);
  }

  return vector;
}

//must be a square matrix
function findTrace(matrix){
  let trace = 0;
  for (let i = 0; i< matrix.length; i++){
    trace += matrix[i][i];
  }
  return trace;
}

function createRandomVector(dimension){
  return new Array(dimension).fill().map( () => Math.random() );
}

function computeSmallestEigenvalue(covariance, iterations){
  let dimension = covariance.length;
  let tempVector = createRandomVector(dimension);
  let largestEigenvector = powerIteration(tempVector, covariance, iterations);
  let largestEigenvectorScaled = matrixVectorMultiply(covariance, largestEigenvector);
  //console.log("largestEigenvectorScaled", largestEigenvectorScaled);
  let largestEigenvalue = Math.sqrt(numbers.matrix.dotproduct(largestEigenvectorScaled,largestEigenvectorScaled));
  //console.log("computeSmallestEigenvalue: largest eigenvalue found- equal to ", largestEigenvalue);
  let vector = createRandomVector(dimension);
  //console.log("createRandomVector");
  // first we find a vector that moves a lot on its first go;
  return specialPowerIteration(vector, covariance, iterations, 2*largestEigenvalue);
}

// takes a direction and calculates an OrthonormalBasis for the hyperplane orthogonal to it
function orthonormalBasis(vector, originalBasis){
  /*let dimension = vector.length;
  let originalDimension = originalBasis[0][0].length;
  //calculate v in original co-ordinatess
  let vectorInOriginalCoordinates = matrixVectorMultiply(originalBasis.map((element) => element[0]), vector);
  console.log("orthonormalBasis: vectorInOriginalCoordinates has length", vectorInOriginalCoordinates.length);
  // calculate w = v - norm(v)*e_1
  let tempVector = vectorInOriginalCoordinates.map((element, index, vector) => {
    if (index === 0){return element - Math.sqrt(numbers.matrix.dotproduct(vector[0],vector[0]))} else {
      return element;
    }
  });
  //calculation of new basis
  let denominator = numbers.matrix.dotproduct(tempVector, tempVector);
  let numerator = numbers.matrix.multiply(numbers.matrix.transpose([tempVector]),[tempVector]);
  console.log("orthonormalBasis: outer product of tempVector with itself calculated")
  let identity = originalBasis;
  let tempBasis = numbers.matrix.subtraction(
    identity,
    numbers.matrix.scalar(numerator,1/denominator)
  );
  console.log("basis calculated");
  let basis = tempBasis.map((element) => {return [element]});
  console.log("function orthonormalBasis is returning an array of", basis.length, "arrays of length", basis[0][0].length);
  return basis;*/

  //calculate v in original co-ordinatess
  let vectorInOriginalCoordinates = matrixVectorMultiply(originalBasis.map((element) => element[0]), vector);
  // calculate w = v - norm(v)*e_1
  let tempVector = vectorInOriginalCoordinates.map((element, index, vector) => {
    if (index === 0){return element - Math.sqrt(numbers.matrix.dotproduct(vector[0],vector[0]))} else {
      return element;
    }
  });
  let denominator = Math.sqrt(numbers.matrix.dotproduct(tempVector, tempVector));
  tempVector = numbers.matrix.scalar([tempVector], 1/denominator)[0];
  let result = originalBasis.map(
    (element, index) => {console.log("index", index);return [housholderReflection(tempVector, element[0])];}
  );
  console.log("function orthonormalBasis is returning an array of", result.length, "arrays of length", result[0][0].length);
  return result
}

// takes m dimensional data and n normalized vectors and gives coordinates of
// the projected vector in terms of the vectors
function transformDataMatrix(data, basisVectors){
  let newData = [];
  for (point of data){
    let newPoint = new Array(basisVectors.length).fill().map(
      (element, index) =>  numbers.matrix.dotproduct(point, basisVectors[index][0]) );
    newData.push(newPoint);
  }
  return newData;
}

// put all of the pieces together
// takes a dataset, and basis vectors of some subpace to project onto

function transform(vector, basisVectors){
  console.log(vector.length);
  console.log(basisVectors[1][0].length);
  let result = new Array(basisVectors.length).fill().map(
    (element,index) => numbers.matrix.dotproduct(vector, basisVectors[index][0]));

  let temp = basisVectors.map((elem) => elem[0]);
  return result;
}

function filter(dataset, basisVectors, toStandardize){
  dimension = basisVectors.length;
  let transformedData = dataset.map((element) => transform(element, basisVectors));
  console.log("transformedData initialized");
  normalizedData = normalizeMatrix(transformedData, dimension, toStandardize);
  console.log("normalizedData initialized");
  let covarianceMatrix = computeCovariance(normalizedData, dimension);
  console.log("covarianceMatrix initialized:", covarianceMatrix);
  let smallestComponent = computeSmallestEigenvalue(covarianceMatrix, 30);
  console.log("smallestComponent initialized");
  let newBasis = orthonormalBasis(smallestComponent, basisVectors);
  console.log("newBasis initialized");
  return [smallestComponent, newBasis];
}

exports.findMeans = findMeans;
exports.computeEigenvalues = computeEigenvalues;
exports.computeSmallestEigenvalue = computeSmallestEigenvalue;
exports.orthonormalBasis = orthonormalBasis;
exports.transformDataMatrix = transformDataMatrix;
exports.filter = filter;
exports.transform = transform;
