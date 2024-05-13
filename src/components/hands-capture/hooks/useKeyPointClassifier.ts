import { useEffect, useRef } from 'react';
import { Results } from '@mediapipe/hands';
import * as tf from '@tensorflow/tfjs';
import _ from 'lodash';
import mod from './tf-models/key-point-classifier-3/model.json';
const calcLandmarkList = (image:any, landmarks:any) => {
  const { width: imageWidth, height: imageHeight } = image;

  const landmarkPoint: any = [];

  // Keypoint
  Object.values(landmarks).forEach((landmark: any) => {
    const landmarkX = Math.min(landmark.x * imageWidth, imageWidth - 1);
    const landmarkY = Math.min(landmark.y * imageHeight, imageHeight - 1);

    landmarkPoint.push([landmarkX, landmarkY]);
  });

  return landmarkPoint;
};

const preProcessLandmark = (landmarkList:any) => {
  let tempLandmarkList = _.cloneDeep(landmarkList);
  let baseX = 0;
  let baseY = 0;

  //convert to realtive coordinates
  Object.values(tempLandmarkList).forEach((landmarkPoint: any, index) => {
    if (!index) {
      baseX = parseInt(landmarkPoint[0]);
      baseY = parseInt(landmarkPoint[1]);
    }

    tempLandmarkList[index][0] = tempLandmarkList[index][0] - baseX;
    tempLandmarkList[index][1] = tempLandmarkList[index][1] - baseY;
  });

  //convert to one-dimensional list
  tempLandmarkList = _.flatten(tempLandmarkList);

  //normalize
  const maxValue = Math.max(
    ...tempLandmarkList.map((value:any) => Math.abs(value))
  );
  tempLandmarkList = tempLandmarkList.map((value:any) => value / maxValue);
  return tempLandmarkList;
};

function useKeyPointClassifier() {
  const model = useRef<any>();

  const keyPointClassifier = async (landmarkList:any) => {
    const result = await model.current
      .execute(tf.tensor2d([landmarkList]))
      .squeeze()
      .argMax()
      .data();

    return result;
  };

  const processLandmark = async (handLandmarks: Results, image:any) => {
    const landmarkList = calcLandmarkList(image, handLandmarks);
    const preProcessedLandmarkList = preProcessLandmark(landmarkList);
    const handSignId = await keyPointClassifier(preProcessedLandmarkList);
    return handSignId[0];
  };
  var fetchPromise = function(url:string) {
    return new Promise(function(resolve, reject) {
        fetch(url)
                .then(response => {
                    resolve(response);
                }).catch(err =>{
                    reject();
                });
    });
};
const  getData= () :any =>{
  fetch('tf-models/key-point-classifier-2/model.json'
  ,{
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
     }
  }
  )
    .then(function(response){
      console.log(response)
      return response.json();
    })
    .then(function(myJson) {
      console.log(myJson);

      //return myJson
    });
}
const loadModel = async () => {
  model.current = await tf.loadGraphModel(
    'https://cdn.jsdelivr.net/gh/IhebChaaraoui2021/cdn-file/model.json'
  );
};
  useEffect(() => {
    loadModel();
    //console.log(mod)
  }, []);
  return { processLandmark };
}

export default useKeyPointClassifier;