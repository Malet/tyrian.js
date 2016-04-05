let React = require('react');
let ReactDOM = require('react-dom');
let SceneComponent = require('./components/scene_component.jsx');

ReactDOM.render(
  <SceneComponent width="320" height="240"/>,
  document.getElementById('main')
);
