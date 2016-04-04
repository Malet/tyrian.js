let React = require('react');
let ReactDOM = require('react-dom');
let SceneComponent = require('./components/scene_component.jsx');

ReactDOM.render(
  <SceneComponent width="640" height="480"/>,
  document.getElementById('main')
);
