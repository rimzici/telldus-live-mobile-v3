/**
 * Copyright 2016-present Telldus Technologies AB.
 *
 * This file is part of the Telldus Live! app.
 *
 * Telldus Live! app is free : you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Telldus Live! app is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 */

// @flow

'use strict';

import React from 'react';
import { connect } from 'react-redux';

import { Text, View, ListDataSource } from 'BaseComponents';
import { StyleSheet, ListView, Dimensions } from 'react-native';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

import { getDeviceHistory } from 'Actions_Devices';
import moment from 'moment';

type Props = {
};

type State = {
};

const listDataSource = new ListDataSource({
	rowHasChanged: (r1, r2) => r1 !== r2,
	sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
});

class HistoryTab extends View {
	props: Props;
	state: State;

	constructor(props: Props) {
		super(props);
		this.state = {
			dataSource: props.history ? listDataSource
			.cloneWithRowsAndSections(this.getRowAndSectionData(props.history.data)) : false,
			isListEmpty: props.history && props.history.data.length === 0 ? true : false,
		};
		this.renderRow = this.renderRow.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			dataSource: nextProps.history ? listDataSource
			.cloneWithRowsAndSections(this.getRowAndSectionData(nextProps.history.data)) : false,
			isListEmpty: nextProps.history && nextProps.history.data.length === 0 ? true : false,
		});
	}

	// prepares the row and section data required for the List.
	getRowAndSectionData(data) {
		let rowSectionData = data.reduce((result, key) => {
			let date = moment.unix(key.ts).format('dddd, MMMM Do');
			if (!result[date]) {
				result[date] = [];
			}
			result[date].push(key);
			return result;
		}, {});
		return rowSectionData;
	}

	renderRow(item, id) {
		let time = moment.unix(item.ts).format('HH:mm:ss');
		return (
			<View style={styles.rowItemsContainer}>
				<View style={styles.circularViewCover}>
					<View style={styles.verticalLineView}/>
					<View style={styles.circularView}>
					</View>
					<View style={styles.verticalLineView}/>
				</View>
				<View style={styles.timeCover}>
					<Text style={styles.timeText}>
						{time}
					</Text>
				</View>
				<View style={styles.statusView}>
				</View>
				<View style={styles.locationCover}>
				<Text style={styles.originText} numberOfLines={1}>{item.origin}</Text>
				</View>
			</View>
		);
	}

	renderSectionHeader(sectionData, timestamp) {
		return (
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionHeaderText}>{timestamp}</Text>
			</View>
		);
	}

	componentDidMount() {
		// if history data not received yet make an API call.[previous call's result will reach, just a matter of time
		// and this one is just for precaution, can remove if seems unnecessary]
		if (!this.props.history) {
			this.props.dispatch(getDeviceHistory(this.props.device));
		}
	}

	render() {
		// Loader message when data has not received yet.
		if (!this.state.dataSource) {
			return (
			<View style={styles.container}>
				<Text>
					Loading...
				</Text>
			</View>
			);
		}
		// response received but, no history for the requested device, so empty list message.
		if (this.state.dataSource && this.state.isListEmpty) {
			return (
			<View style={styles.container}>
				<Text>
					No history found for this device.
				</Text>
			</View>
			);
		}
		return (
			<View style={styles.container}>
				<ListView
					dataSource={this.state.dataSource}
					renderRow={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
				/>
			</View>
		);
	}

}

HistoryTab.propTypes = {
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	sectionHeader: {
		width: deviceWidth,
		height: deviceHeight * 0.04,
		backgroundColor: '#ffffff',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowRadius: 1,
		shadowOpacity: 1.0,
		elevation: 2,
		justifyContent: 'center',
	},
	sectionHeaderText: {
		color: '#A59F9A',
		marginLeft: 5,
	},
	rowItemsContainer: {
		flexDirection: 'row',
		height: deviceHeight * 0.09,
		width: deviceWidth,
		justifyContent: 'center',
		alignItems: 'center',
	},
	circularViewCover: {
		width: deviceWidth * 0.15,
		height: deviceHeight * 0.095,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
	circularView: {
		backgroundColor: '#A59F9A',
		borderRadius: 30,
		height: deviceHeight * 0.05,
		width: deviceWidth * 0.08,
	},
	verticalLineView: {
		backgroundColor: '#A59F9A',
		height: deviceHeight * 0.022,
		width: 2,
	},
	timeCover: {
		width: deviceWidth * 0.3,
		height: deviceHeight * 0.08,
		justifyContent: 'center',
		alignItems: 'center',
	},
	timeText: {
		color: '#A59F9A',
		fontSize: 16,
	},
	statusView: {
		backgroundColor: '#A59F9A',
		width: deviceWidth * 0.15,
		height: deviceHeight * 0.07,
	},
	locationCover: {
		width: deviceWidth * 0.4,
		height: deviceHeight * 0.07,
		justifyContent: 'center',
		backgroundColor: '#fff',
		alignItems: 'center',
		paddingLeft: 10,
	},
	originText: {
		color: '#A59F9A',
	},
});

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

function mapStateToProps(state, ownProps) {
	// some times the history data might not have received yet, so passing 'false' value.
	let data = state.devices.byId[ownProps.screenProps.device.id].history ? state.devices.byId[ownProps.screenProps.device.id].history : false;
	return {
		history: data,
		device: ownProps.screenProps.device,
		state,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HistoryTab);
