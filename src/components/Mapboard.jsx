import React from 'react';
import TopicPanel from './TopicPanel';
import MapPanel from './MapPanel';

class Mapboard extends React.Component {
  render () {
    const styles = {
      'mb-root': {
        height: 500
      }
    };

    return (
      <div className="row collapse" style={styles['mb-root']}>
        <TopicPanel />
        <MapPanel />
      </div>
    );
  }
}

export default Mapboard;
