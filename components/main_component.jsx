let React = require('react');
let SceneComponent = require('./scene_component.jsx');
let InterfaceComponent = require('./interface_component.jsx');
let OptionsPanel = require('./options_panel.jsx');

module.exports = class MainComponent extends React.Component {
  render() {
    return <div className="main">
      <div className="game">
        <SceneComponent width="263" height="184"/>
        <InterfaceComponent/>
      </div>
      <OptionsPanel
        checked={this.state.godMode}
        onChange={_ => {
          this.state.godMode = !this.state.godMode;
          this.setState(this.state);
        }}
      />
    </div>;
  }

  constructor() {
    super();
    this.state = { godMode: false };
  }
};
