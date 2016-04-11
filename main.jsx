let React = require('react');
let ReactDOM = require('react-dom');
let SceneComponent = require('./components/scene_component.jsx');
let InterfaceComponent = require('./components/interface_component.jsx');
let $ = require('jquery-browserify');

$(window).load(_ => {
  ReactDOM.render(
    <div className="game">
      <SceneComponent width="263" height="184"/>
      <InterfaceComponent/>
    </div>,
    document.getElementById('main')
  );
});
