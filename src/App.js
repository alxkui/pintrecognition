import logo from './logo.svg';
import * as tf from '@tensorflow/tfjs';
import './App.css';
import { useEffect, useState, useRef } from 'react';
import {Camera} from "react-camera-pro";

const MODEL_URL = process.env.PUBLIC_URL + '/web_model/model.json'
const classes = ["Guinness", "Heverlee", "Hop House 13", "Magners", "Peroni", "San Miguel"];

function App() {
  const camera = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    tf.loadGraphModel(MODEL_URL).then((model) => {
      setModel(model);
      console.log("Model loaded")
    })
  }, [])

  useEffect(() => {
    console.log(predictions);
  }, [predictions]);

  const predict = async (image) => {
    const imageElement = document.createElement("img");
    imageElement.src = image;
    const tensor = tf.browser
      .fromPixels(imageElement, 3)
      .resizeNearestNeighbor([180, 180])
      .expandDims()
      .toFloat();

    const predictionsFromModel = await model.predict(tensor).data();

    const sortedClassifiedPredictions = [];

    predictionsFromModel.forEach((prediction, i) => {
      sortedClassifiedPredictions.push({
        prob: prediction,
        class: classes[i]
      })
    });

    setPredictions(sortedClassifiedPredictions.sort((a, b) => b.prob - a.prob));
  }

  return (
    <div className="App">
      <h1>What pint is this?</h1>
      <Camera ref={camera} facingMode='environment' />      
      <div>
        <img src={photo} alt="Preview" width="400" />
        <br />
      </div>

      <button
        onClick={() => {
            const photo = camera.current.takePhoto();
            setPhoto(photo);
        }}
      />
      {photo && <input type='button' value="Predict" onClick={() => predict(photo)} />}

      <div>
        <h3>Predictions</h3>
        {predictions ?
          <div>
            <h4>{predictions[0].class}</h4>
          </div> : "Try to predict something!"}
      </div>
    </div>
  );
}

export default App;
