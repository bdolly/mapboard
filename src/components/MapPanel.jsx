import React from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

class MapPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: 51.505,
      lng: -0.09,
      zoom: 13
    };
  }

  render () {
    const styles = {
      'mb-panel-map': {
        height: 500
      }
    };

    const position = [this.state.lat, this.state.lng];

    return (
      <div className="large-12 columns mb-panel">
        <Map center={position} zoom={this.state.zoom} style={{height: 500}}>
          <TileLayer
            attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          />
          <Marker position={position}>
            <Popup>
              <span>A pretty CSS3 popup. <br /> Easily customizable.</span>
            </Popup>
          </Marker>
        </Map>
      </div>
    );
  }
}

export default MapPanel;
