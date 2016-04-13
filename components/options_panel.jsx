let React = require('react');

module.exports = class OptionsPanel extends React.Component {
  render() {
    return <div className="options">
      <h1>Options</h1>
      <label><input type="checkbox" onChange={this._toggleGodMode.bind(this)} checked={this.props.checked}/> God mode</label>
    </div>;
  }

  _toggleGodMode() {
    this.props.onChange();
  }
};
