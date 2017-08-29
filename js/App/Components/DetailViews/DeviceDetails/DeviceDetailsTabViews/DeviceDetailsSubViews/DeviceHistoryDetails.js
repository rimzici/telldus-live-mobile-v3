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

import { View, Text, Icon, Modal } from 'BaseComponents';
import { StyleSheet, Dimensions } from 'react-native';
import ExtraDimensions from 'react-native-extra-dimensions-android';

import moment from 'moment';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

import { states, statusMessage } from '../../../../../../Config';

let statusBarHeight = ExtraDimensions.get('STATUS_BAR_HEIGHT');
let stackNavHeaderHeight = deviceHeight * 0.1;
let deviceIconCoverHeight = (deviceHeight * 0.2);
let tabViewHeaderHeight = (deviceHeight * 0.085);
let totalTop = statusBarHeight + stackNavHeaderHeight + deviceIconCoverHeight + tabViewHeaderHeight;
let screenSpaceRemaining = deviceHeight - totalTop;

class DeviceHistoryDetails extends View {
	constructor(props) {
		super(props);
	}

	render() {
		let textState = '', textDate = '', textStatus = '';
		if (this.props.detailsData.state) {
			let state = states[this.props.detailsData.state];
			textState = state === 'Dim' ? `${state} ${this.props.detailsData.stateValue}%` : state;
		}
		if (this.props.detailsData.ts) {
			textDate = moment.unix(this.props.detailsData.ts).format('ddd, MMMM D HH:mm:ss');
		}
		if (this.props.detailsData.successStatus >= 0) {
			let message = statusMessage[this.props.detailsData.successStatus];
			textStatus = this.props.detailsData.successStatus === 0 ? message : `Failed (${message})`;
		}


		return (
			<Modal
				modalStyle={styles.container}
				entry= "SlideInY"
				exit= "SlideOutY"
				entryDuration= {300}
				exitDuration= {100}
				startValue= {-screenSpaceRemaining}
				endValue= {0}
				showModal={this.props.showDetails}>
				<View style={styles.titleTextCover}>
					<Text style={styles.titleText}>
						Details
					</Text>
				</View>
				<View style={styles.detailsContainer}>
					<View style={styles.detailsRow}>
						<View style={styles.detailsLabelCover}>
							<Text style={styles.detailsLabel}>
								State
							</Text>
						</View>
						<View style={styles.detailsValueCover}>
							<Text style={styles.detailsText}>
								{textState}
							</Text>
						</View>
					</View>
					<View style={styles.detailsRow}>
						<View style={styles.detailsLabelCover}>
							<Text style={styles.detailsLabel}>
								Time
							</Text>
						</View>
						<View style={styles.detailsValueCover}>
							<Text style={styles.detailsText} >
								{textDate}
							</Text>
						</View>
					</View>
					<View style={styles.detailsRow}>
						<View style={styles.detailsLabelCover}>
							<Text style={styles.detailsLabel}>
								Origin
							</Text>
						</View>
						<View style={styles.detailsValueCover}>
							<Text style={styles.detailsText} numberOfLines={1}>
								{this.props.detailsData.origin}
							</Text>
						</View>
					</View>
					<View style={styles.detailsRow}>
						<View style={styles.detailsLabelCover}>
							<Text style={styles.detailsLabel}>
								Status
							</Text>
						</View>
						<View style={[styles.detailsValueCover, { flexDirection: 'row-reverse' }]}>
							<Text style={this.props.detailsData.successStatus === 0 ? styles.detailsText : styles.detailsTextError} >
								{textStatus}
							</Text>
							{this.props.detailsData.successStatus === 0 ?
								null
								:
								<Icon name="exclamation-triangle" size={24} color="#d32f2f" />
							}
						</View>
					</View>
				</View>
			</Modal>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'absolute',
		backgroundColor: '#eeeeef',
		width: deviceWidth,
		height: screenSpaceRemaining,
	},
	titleTextCover: {
		width: deviceWidth,
		height: deviceHeight * 0.09,
		borderBottomWidth: 1,
		borderBottomColor: '#A59F9A',
		justifyContent: 'flex-end',
	},
	titleText: {
		marginLeft: 10,
		color: '#A59F9A',
		fontSize: 16,
	},
	detailsContainer: {
		backgroundColor: '#ffffff',
		alignItems: 'center',
		justifyContent: 'flex-end',
		flexDirection: 'column',
		height: Math.floor(deviceHeight * 0.09 * 4),
		width: deviceWidth,
	},
	detailsRow: {
		flexDirection: 'row',
		width: deviceWidth,
		height: deviceHeight * 0.09,
		borderBottomWidth: 1,
		borderBottomColor: '#A59F9A',
		alignItems: 'center',
		justifyContent: 'center',
	},
	detailsLabelCover: {
		alignItems: 'flex-start',
		width: deviceWidth * 0.3,
	},
	detailsLabel: {
		marginLeft: 10,
		fontSize: 16,
		color: '#4C4C4C',
	},
	detailsValueCover: {
		alignItems: 'flex-end',
		width: deviceWidth * 0.7,
	},
	detailsText: {
		marginRight: 15,
		color: '#A59F9A',
		fontSize: 16,
	},
	detailsTextError: {
		marginRight: 15,
		color: '#d32f2f',
		fontSize: 16,
	},
});

function mapStateToProps(state) {
	return {
		showDetails: state.modal.openModal,
		detailsData: state.modal.data,
	};
}

export default connect(mapStateToProps, null)(DeviceHistoryDetails);
