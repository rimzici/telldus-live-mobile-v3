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
import { StyleSheet, Dimensions } from 'react-native';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_history from './../../../TabViews/img/selection.json';
const CustomIcon = createIconSetFromIcoMoon(icon_history);

import { FormattedMessage, Text, View, ListDataSource, Icon, FormattedDate, List } from 'BaseComponents';
import { DeviceHistoryDetails, HistoryRow } from 'DeviceDetailsSubView';
import { getDeviceHistory } from 'Actions_Devices';
import type { Dispatch } from 'Actions_Types';
import { defineMessages } from 'react-intl';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const messages = defineMessages({
	historyHeader: {
		id: 'history',
		defaultMessage: 'History',
	},
	loading: {
		id: 'loading',
		defaultMessage: 'Loading',
	},
	noRecentActivity: {
		id: 'deviceSettings.noRecentActivity',
		defaultMessage: 'No recent activity',
	},
});

type Props = {
	dispatch: Dispatch,
	history: Object,
	device: Object,
	tabNavigator: Object,
};

type State = {
};

const listDataSource = new ListDataSource({
	rowHasChanged: (r1: Object, r2: Object): boolean => r1 !== r2,
	sectionHeaderHasChanged: (s1: Object, s2: Object): boolean => s1 !== s2,
});

class HistoryTab extends View {
	props: Props;
	state: State;

	refreshHistoryData: () => void;
	renderSectionHeader: (Object, string) => void;
	renderRow: (Object, string) => void;
	closeHistoryDetailsModal: () => void;

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): React$Element<any> => (<FormattedMessage {...messages.historyHeader} style={{color: tintColor}}/>),
		tabBarIcon: ({ tintColor }: Object): React$Element<any> => (
			<CustomIcon name="icon_history" size={24} color={tintColor}/>
		),
		tabBarOnPress: (scene: Object, jumpToIndex: Function) => {
			let {state} = navigation;
			state.params.actionOnHistoryTabPress();
			jumpToIndex(scene.index);
		},
	});

	constructor(props: Props) {
		super(props);
		this.state = {
			dataSource: props.history ? listDataSource
				.cloneWithRowsAndSections(this.getRowAndSectionData(props.history.data)) : false,
			isListEmpty: props.history && props.history.data.length === 0 ? true : false,
			hasRefreshed: false,
		};
		this.renderRow = this.renderRow.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.closeHistoryDetailsModal = this.closeHistoryDetailsModal.bind(this);

		this.isFirstFlag = null;
	}

	componentDidMount() {
		let {setParams} = this.props.tabNavigator;
		setParams({
			actionOnHistoryTabPress: this.closeHistoryDetailsModal,
		});
	}

	closeHistoryDetailsModal() {
		this.props.dispatch({
			type: 'REQUEST_MODAL_CLOSE',
			payload: {},
		});
	}

	componentWillReceiveProps(nextProps: Object) {
		if (nextProps.history && ((!this.props.history) || (nextProps.history.data.length !== this.props.history.data.length))) {
			this.isFirstFlag = null;
			this.setState({
				dataSource: listDataSource.cloneWithRowsAndSections(this.getRowAndSectionData(nextProps.history.data)),
				isListEmpty: nextProps.history.data.length === 0 ? true : false,
			});
		}
		if (nextProps.screenProps.currentTab === 'History') {
			if (!this.state.hasRefreshed) {
				this.refreshHistoryData();
				this.setState({
					hasRefreshed: true,
				});
			}
		} else {
			this.setState({
				hasRefreshed: false,
			});
		}
	}

	refreshHistoryData() {
		let that = this;
		this.delayRefreshHistoryData = setTimeout(() => {
			that.props.dispatch(getDeviceHistory(that.props.device));
		}, 2000);
	}

	// prepares the row and section data required for the List.
	getRowAndSectionData(data: Array<Object>): Object {
		let rowSectionData = data.reduce((result: Object, key: Object): Object => {
			let date = new Date(key.ts * 1000).toDateString();
			if (!result[date]) {
				result[date] = [];
			}
			result[date].push(key);
			return result;
		}, {});
		return rowSectionData;
	}

	getIcon(deviceState: string): string {
		switch (deviceState) {
			case 'TURNON':
				return 'icon_on';
			case 'TURNOFF':
				return 'icon_off';
			case 'UP':
				return 'icon_up';
			case 'BELL':
				return 'icon_bell';
			case 'DOWN':
				return 'icon_down';
			case 'STOP':
				return 'icon_stop';
			default:
				return '';
		}

	}

	renderRow(item: Object, sectionId: string, rowId: number): React$Element<any> {
		let isFirst = +rowId === 0 && this.isFirstFlag === null;
		this.isFirstFlag = isFirst;
		return (
			<HistoryRow id={rowId} item={item} isFirst={isFirst}/>
		);
	}

	renderSectionHeader(sectionData: Object, timestamp: string): React$Element<any> {
		return (
			<View style={styles.sectionHeader}>
				<FormattedDate
					value={timestamp}
					localeMatcher= "best fit"
					formatMatcher= "best fit"
					weekday="long"
					day="2-digit"
					month="long"
					style={styles.sectionHeaderText} />
			</View>
		);
	}

	componentWillUnmount() {
		clearTimeout(this.delayRefreshHistoryData);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		if (nextProps.screenProps.currentTab !== 'History') {
			return false;
		}
		return true;
	}

	render(): React$Element<any> {
		// Loader message when data has not received yet.
		if (!this.state.dataSource) {
			return (
				<View style={styles.containerWhenNoData}>
					<CustomIcon name="icon_loading" size={20} color="#F06F0C" />
					<Text style={styles.textWhenNoData}>
						<FormattedMessage {...messages.loading} style={styles.textWhenNoData}/>...
					</Text>
				</View>
			);
		}
		// response received but, no history for the requested device, so empty list message.
		if (this.state.dataSource && this.state.isListEmpty) {
			return (
				<View style={styles.containerWhenNoData}>
					<Icon name="exclamation-circle" size={20} color="#F06F0C" />
					<Text style={styles.textWhenNoData}>
						<FormattedMessage {...messages.noRecentActivity} style={styles.textWhenNoData}/>...
					</Text>
				</View>
			);
		}
		return (
			<View style={styles.container}>
				<List
					dataSource={this.state.dataSource}
					renderRow={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
				/>
				<View style={styles.line}/>
				<DeviceHistoryDetails />
			</View>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#eeeeef',
		flexDirection: 'row',
		width: deviceWidth,
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},
	containerWhenNoData: {
		flex: 1,
		paddingTop: 20,
		backgroundColor: '#eeeeef',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	textWhenNoData: {
		marginLeft: 10,
		color: '#A59F9A',
		fontSize: 12,
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
		paddingLeft: 5,
	},
	sectionHeaderText: {
		color: '#A59F9A',
	},
	line: {
		backgroundColor: '#A59F9A',
		height: '100%',
		width: 1,
		position: 'absolute',
		left: deviceWidth * 0.069333333,
		top: 0,
		zIndex: -1,
	},
});

function mapDispatchToProps(dispatch: Dispatch): Object {
	return {
		dispatch,
	};
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	// some times the history data might not have received yet, so passing 'false' value.
	let data = state.devices.byId[ownProps.screenProps.device.id].history ? state.devices.byId[ownProps.screenProps.device.id].history : false;
	return {
		tabNavigator: ownProps.navigation,
		history: data,
		device: ownProps.screenProps.device,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HistoryTab);
