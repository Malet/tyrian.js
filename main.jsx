let React = require('react');
let ReactDOM = require('react-dom');
let MainComponent = require('./components/main_component.jsx');
let $ = require('jquery-browserify');

$(window).load(_ => {
  ReactDOM.render(
    <MainComponent/>,
    document.getElementById('main')
  );
});
