import React from 'react';
import Topic from './topic';

class TopicPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTopic: 'trash'
    };
  }

  render() {
    const styles = {
      // 'mb-panel': {
      //   height: '100%'
      // },
      'mb-panel-topics': {
        height: '100%',
        background: '#fff',
        paddingLeft: 12,
        paddingRight: 12,
        overflow: 'auto'
      }
    };

    return (
      <div className="large-12 columns" style={styles['mb-panel-topics']}>
        <h1>1234 Market St</h1>
        <Topic key="trash" label="Trash" />
        <Topic key="recycling" label="Recycling" />
      </div>
    );
  }
}

export default TopicPanel;
