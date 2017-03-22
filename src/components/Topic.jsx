import React from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

class Topic extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render () {
    const styles = {
      'topic-header': {
        background: '#f5f5f5',
        border: '1px solid #ddd',
        display: 'block',
        fontSize: 18,
        fontWeight: 'normal',
        height: 70,
        lineHeight: '45px',
        padding: 10,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        marginBottom: 8
      },
      //
      // 'topic-header'::hover {
      //   background: '#fff',
      //   color: 'inherit'
      // }

      'topic-body': {
        padding: 10,
        marginBottom: 10
      }
    };

    return (
      <div>
        <a href="#" style={styles['topic-header']}>
          {this.props.label}
        </a>
        <div style={styles['topic-body']}>
          <div>
            I'm a component.
          </div>
        </div>
      </div>
    );
  }
}

export default Topic;
