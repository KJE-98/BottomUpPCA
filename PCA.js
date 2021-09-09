let numbers = require('numbers');

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
function normalizeMatrix (dataset, dimension) {
  let meanVector = findMeans(dataset, dimension);
  let varianceVector = findVariance(dataset, dimension, meanVector);
  let result = new Array(dataset.length).fill().map(() => new Array(dimension).fill(0));
  for (let i = 0; i<dataset.length; i++){
    for (let j = 0; j<dimension; j++){
      result[i][j] = (dataset[i][j]-meanVector[j])/varianceVector[j];
    }
  }
  return result;
}

// computes the covariance matrix given a normalized and standardized dataset
function computeCovariance (dataset, dimension) {
  let result = new Array(dimension).fill().map(() => new Array(dimension).fill(0));
  console.log("created array of zeros for covariance matrix");
  for (let i = 0; i<dimension; i++){
    console.log("computeCovariance: i index is", i);
    for (let j = 0; j<dimension; j++){
      for (let k = 0; k<dataset.length; k++){
        result[i][j] += dataset[k][i]*dataset[k][j];
      }
    }
  }
  result = numbers.matrix.scalar(result, 1/(dataset.length-1));
  return result;
}

// used in $computeEigenvalues()$, does not change value of $vector$
//
function powerIteration (vector, covariance, iterations) {
  let dimension = vector.length;
  vector = [vector];
  for (let i = 0; i<iterations; i++){
    let temporaryVector = numbers.matrix.multiply(vector, covariance);
    let norm = Math.sqrt(numbers.matrix.dotproduct(temporaryVector[0],temporaryVector[0]));

    temporaryVector = numbers.matrix.scalar(temporaryVector, 1/norm);
    console.log("vector", temporaryVector, "powerIteration round", i);
    vector = temporaryVector;

  }

  return vector[0];
}

// dataset in this case must already be normalized and standardized
// given a covariance matrix SHOULD compute the the first n eigenvectors and their corresponding eigenvalues
// DONT USE THIS FUNCTION IT DOESNT DO ANYTHING
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
  vector = [vector];
  for (let i = 0; i<iterations; i++){
    let temporaryVector = numbers.matrix.multiply(vector, covariance);
    temporaryVector = numbers.matrix.subtraction(numbers.matrix.scalar(vector, bound),temporaryVector);

    let norm = Math.sqrt(numbers.matrix.dotproduct(temporaryVector[0],temporaryVector[0]));
    temporaryVector = numbers.matrix.scalar(temporaryVector, 1/norm);

    vector = temporaryVector;

    console.log("specialPowerIteration: on iteration", i);
    console.log("specialPowerIteration: current vector", vector);
  }

  return vector[0];
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
  let largestEigenvectorScaled = numbers.matrix.multiply([largestEigenvector], covariance)[0];
  console.log("largestEigenvectorScaled", largestEigenvectorScaled);
  let largestEigenvalue = Math.sqrt(numbers.matrix.dotproduct(largestEigenvectorScaled,largestEigenvectorScaled));
  console.log("computeSmallestEigenvalue: largest eigenvalue found- equal to ", largestEigenvalue);
  let vector = createRandomVector(dimension);
  console.log("createRandomVector");
  // first we find a vector that moves a lot on its first go;
  return specialPowerIteration(vector, covariance, iterations, 2*largestEigenvalue);
}

// takes a direction and calculates an OrthonormalBasis for the hyperplane orthogonal to it
function orthonormalBasis(vector){
  let dimension = vector[0].length
  let basis = [vector];
  for (let i = 1; i<dimension; i++){
    let randomVector = [createRandomVector(dimension)];
    for (basisVector of basis){
      let projection = numbers.matrix.scalar(basisVector, numbers.matrix.dotproduct(basisVector[0], randomVector[0]));
      randomVector = numbers.matrix.subtraction(randomVector, projection);
      let norm = Math.sqrt(numbers.matrix.dotproduct(randomVector[0],randomVector[0]));
      randomVector = numbers.matrix.scalar(randomVector, 1/norm);
    }
    console.log("orthonormalBasis: iteration", i);
    basis.push(randomVector);
  }
  return basis;
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
  let result = new Array(basisVectors.length).fill().map(
    (element,index) => numbers.matrix.dotproduct(vector, basisVectors[index][0]));

  let temp = basisVectors.map((elem) => elem[0]);
  return result;
}

function filter(dataset, basisVectors, toNormalize){
  dimension = basisVectors.length;
  let transformedData = dataset.map((element) => transform(element, basisVectors));
  console.log("transformedData initialized");
  let covarianceMatrix;
  if (toNormalize){
    normalizedData = normalizeMatrix(transformedData, dimension);
    console.log("normalizedData initialized");
    covarianceMatrix = computeCovariance(normalizedData, dimension);
    console.log("covarianceMatrix initialized:", covarianceMatrix);
  }else{
    covarianceMatrix = computeCovariance(transformedData, dimension);
  }
  let smallestComponent = computeSmallestEigenvalue(covarianceMatrix, 100);
  console.log("smallestComponent initialized");
  let newBasis = orthonormalBasis([smallestComponent]);
  console.log("newBasis initialized");
  return [smallestComponent, newBasis];
}

exports.findMeans = findMeans;
exports.computeEigenvalues = computeEigenvalues;
exports.computeSmallestEigenvalue = computeSmallestEigenvalue;
exports.orthonormalBasis = orthonormalBasis;
exports.transformDataMatrix = transformDataMatrix;
exports.filter = filter;
