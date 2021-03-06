import $ from 'jQuery';

class RecordingsClient {
	constructor(baseUrl, username, password, srid = 3857, proxy) {
		this.baseUrl = baseUrl;
		this.username = username;
		this.password = password;
		this.srid = srid;
		this.proxy = proxy;
	}

	// this takes leaflet map bonds and an EPSG coordinate system id, e.g. 3857
	// and returns an array of cyclomedia recording points
	getRecordings(bounds, callback) {
		// console.log('get recordings', bounds);

		const swCoord = bounds.getSouthWest();
		const neCoord = bounds.getNorthEast();
		const data = `<wfs:GetFeature service="WFS" version="1.1.0" resultType="results" outputFormat="text/xml; subtype=gml/3.1.1" xmlns:wfs="http://www.opengis.net/wfs">
											<wfs:Query typeName="atlas:Recording" srsName="EPSG:${this.srid}" xmlns:atlas="http://www.cyclomedia.com/atlas">
												<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">
						    					<ogc:And>
						      					<ogc:BBOX>
											        <gml:Envelope srsName="EPSG:${this.srid}" xmlns:gml="http://www.opengis.net/gml">
											          <gml:lowerCorner>${swCoord.lng} ${swCoord.lat}</gml:lowerCorner>
											          <gml:upperCorner>${neCoord.lng} ${neCoord.lat}</gml:upperCorner>
											        </gml:Envelope>
											      </ogc:BBOX>
											      <ogc:PropertyIsNull>
											        <ogc:PropertyName>expiredAt</ogc:PropertyName>
											      </ogc:PropertyIsNull>
											    </ogc:And>
											  </ogc:Filter>
											 </wfs:Query>
											</wfs:GetFeature>`;
		const url = (this.proxy || '') + this.baseUrl;
		// TEMP
		// const url = ((this.proxy || '') + this.baseUrl).replace('//', 'https://');
		const self = this;

		$.ajax({
	    url,
	    data,
	    type: 'POST',
	    contentType: 'text/xml',
	    // dataType: 'text',
			headers: {
				// 'Content-length': data.length,
				'Authorization': 'Basic ' + window.btoa(this.username + ':' + this.password)
			},
	    success(data) {
				// console.log('got recordings', data);

				// this is a list of xml elements representing recordings
				const recordingElsCollection = data.getElementsByTagNameNS('*', 'Recording');
				const recordingEls = [].slice.call(recordingElsCollection);

				// check for > 1
				if (recordingEls.length < 1) {
					console.log('no cyclomedia recordings for bounds');
					return;
				}

				// check if authorized
				// const firstRecordingEl = recordingEls[0];
				// const isAuthorizedEls = firstRecordingEl.firstChild.getElementsByTagNameNS('*', 'isAuthorized');
				// const isAuthorized = isAuthorizedEls.length > 0 && isAuthorizedEls[0].firstChild.data === 'true';
				// if (!isAuthorized) {
				// 	throw 'not authorized to get cyclomedia recordings';
				// 	return;
				// }

				const recordings = recordingEls.map(recordingEl => {
					const imageId = recordingEl.getElementsByTagNameNS('*', 'imageId')[0].firstChild.data;
					const coords = recordingEl.getElementsByTagNameNS('*', 'pos')[0].firstChild.data;
					const [lng, lat] = coords.split(' ').map(parseFloat);

					return {
						imageId,
						lng,
						lat
					};
				});

				callback(recordings);
			},
	    error(xhr, ajaxOptions, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
	    }
		});
	}
}

export default RecordingsClient;
