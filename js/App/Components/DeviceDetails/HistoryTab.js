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
import { StyleSheet, SectionList, RefreshControl } from 'react-native';
import _ from 'lodash';
import { defineMessages } from 'react-intl';

import { FormattedMessage, Text, View, Icon, FormattedDate, TabBar } from '../../../BaseComponents';
import { DeviceHistoryDetails, HistoryRow } from './SubViews';
import { getDeviceHistory } from '../../Actions/Devices';
import { getDeviceHistory as getDeviceHistoryFromLocal, storeDeviceHistory, getLatestTimestamp } from '../../Actions/LocalStorage';
import { hideModal } from '../../Actions/Modal';
import i18n from '../../Translations/common';
import Theme from '../../Theme';
import {
	getRelativeDimensions,
} from '../../Lib';

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
	dispatch: Function,
	device: Object,
	deviceHistoryNavigator: Object,
	appLayout: Object,
	rowsAndSections: Array<any> | boolean,
	screenProps: Object,
	currentScreen: string,
	currentTab: string,
	showModal: boolean,
};

type State = {
	hasRefreshed: boolean,
	rowsAndSections: Array<any>,
	refreshing: boolean,
	hasLoaded: boolean,
};

class HistoryTab extends View {
	props: Props;
	state: State;

	refreshHistoryData: () => void;
	renderSectionHeader: (Object, string) => void;
	renderRow: (Object, string) => void;
	closeHistoryDetailsModal: () => void;
	_onRefresh: () => void;
	getHistoryDataFromAPI: (Object, number | null) => void;
	getHistoryDataWithLatestTimestamp: () => void;

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="icon_history"
				tintColor={tintColor}
				label={messages.historyHeader}
				accessibilityLabel={i18n.deviceHistoryTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			let {state} = navigation;
			let onPress = (state.params && state.params.actionOnHistoryTabPress) ? state.params.actionOnHistoryTabPress : () => {};
			onPress();
			navigation.navigate('History');
		},
	});

	static getDerivedStateFromProps(props: Object, state: Object): Object {
		const { screenProps } = props;
		if (screenProps.currentTab !== 'History') {
			return {
				hasRefreshed: false,
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);
		this.state = {
			rowsAndSections: [],
			hasRefreshed: false,
			refreshing: true,
			hasLoaded: false,
		};
		this.renderRow = this.renderRow.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.closeHistoryDetailsModal = this.closeHistoryDetailsModal.bind(this);

		this._onRefresh = this._onRefresh.bind(this);
		this.getHistoryDataFromAPI = this.getHistoryDataFromAPI.bind(this);
		this.getHistoryDataWithLatestTimestamp = this.getHistoryDataWithLatestTimestamp.bind(this);
	}

	componentDidMount() {
		let {setParams} = this.props.deviceHistoryNavigator;
		setParams({
			actionOnHistoryTabPress: this.closeHistoryDetailsModal,
		});
		this.getHistoryData(false, true, this.getHistoryDataWithLatestTimestamp());
	}

	closeHistoryDetailsModal() {
		if (this.props.showModal) {
			this.props.dispatch(hideModal());
		}
	}

	/**
	 *
	 * @hasLoaded : Determines if data loading has been complete(incase when no data in local, API fetch makes loading complete)
	 * Used to determine if data is empty or not, if empty show message.
	 * @refreshing : Used to update the refreshControl state.
	 * @callBackWhenNoData : A callback function to be called when no data found local(Usually function that fetches data
	 * from the API)
	 */
	getHistoryData(hasLoaded: boolean = false, refreshing: boolean = false, callBackWhenNoData: Function = () => {}) {
		getDeviceHistoryFromLocal(this.props.device.id).then((data: Object) => {
			if (data && data.length !== 0) {
				let rowsAndSections = parseHistoryForSectionList(data);
				this.setState({
					rowsAndSections,
					hasLoaded: true,
					refreshing: false,
				});
			} else {
				this.setState({
					rowsAndSections: [],
					hasLoaded,
					refreshing,
				});
				callBackWhenNoData();
			}
		}).catch(() => {
			this.setState({
				rowsAndSections: [],
				hasLoaded,
				refreshing,
			});
			callBackWhenNoData();
		});
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		const { screenProps } = this.props;
		const { hasRefreshed } = this.state;
		if (screenProps.currentTab === 'History' && !hasRefreshed) {
			this.refreshHistoryData();
			this.setState({
				hasRefreshed: true,
			});
		}
	}

	keyExtractor(item: Object, index: number): string {
		let key = `${item.ts}${index}`;
		return key;
	}

	refreshHistoryData() {
		let that = this;
		this.delayRefreshHistoryData = setTimeout(() => {
			that.setState({
				refreshing: true,
			});
			that.getHistoryDataWithLatestTimestamp();
		}, 2000);
	}

	getHistoryDataWithLatestTimestamp() {
		let { device } = this.props;
		getLatestTimestamp('device', device.id).then((res: Object) => {
			let prevTimestamp = res.tsMax ? (res.tsMax + 1) : null;
			this.getHistoryDataFromAPI(device, prevTimestamp);
		}).catch(() => {
			this.getHistoryDataFromAPI(device, null);
		});
	}

	getHistoryDataFromAPI(device: Object, prevTimestamp: number) {
		let noop = () => {};
		this.props.dispatch(getDeviceHistory(this.props.device, prevTimestamp))
			.then((response: Object) => {
				if (response.history && response.history.length !== 0) {
					let data = {
						history: response.history,
						deviceId: this.props.device.id,
					};
					storeDeviceHistory(data).then(() => {
						this.getHistoryData(true, false, noop);
					}).catch(() => {
						this.getHistoryData(true, false, noop);
					});
				} else {
					this.getHistoryData(true, false, noop);
				}
			}).catch(() => {
				this.getHistoryData(true, false, noop);
			});
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

	renderRow(item: Object): Object {
		let { screenProps } = this.props;
		let { intl, currentTab, currentScreen } = screenProps;

		return (
			<HistoryRow id={item.index}
				item={item.item} section={item.section.key}
				intl={intl} isFirst={+item.index === 0}
				currentTab={currentTab} currentScreen={currentScreen}
			/>
		);
	}

	renderSectionHeader(item: Object): Object {
		let { appLayout } = this.props;

		let {
			sectionHeader,
			sectionHeaderText,
		} = this.getStyle(appLayout);

		return (
			<View style={sectionHeader}>
				<FormattedDate
					value={item.section.key}
					localeMatcher= "best fit"
					formatMatcher= "best fit"
					weekday="long"
					day="2-digit"
					month="long"
					style={sectionHeaderText} />
			</View>
		);
	}

	componentWillUnmount() {
		clearTimeout(this.delayRefreshHistoryData);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.screenProps.currentTab === 'History';
	}

	_onRefresh() {
		this.setState({
			refreshing: true,
		});
		this.getHistoryDataWithLatestTimestamp();
	}

	render(): Object {
		let { appLayout, screenProps } = this.props;
		let { hasLoaded, refreshing, rowsAndSections } = this.state;
		let { intl, currentTab, currentScreen } = screenProps;
		let { brandPrimary } = Theme.Core;

		let {
			line,
			textWhenNoData,
			iconSize,
		} = this.getStyle(appLayout);

		// response received but, no history for the requested device, so empty list message.
		if (!refreshing && hasLoaded && rowsAndSections.length === 0) {
			return (
				<View style={styles.containerWhenNoData}>
					<Icon name="exclamation-circle" size={iconSize} color="#F06F0C" />
					<Text style={textWhenNoData}>
						<FormattedMessage {...messages.noRecentActivity} style={textWhenNoData}/>...
					</Text>
				</View>
			);
		}
		return (
			<View style={styles.container}>
				<SectionList
					style={{flex: 1}}
					contentContainerStyle={{flexGrow: 1}}
					sections={this.state.rowsAndSections}
					renderItem={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					keyExtractor={this.keyExtractor}
					initialNumToRender={10}
					refreshControl={
						<RefreshControl
						  refreshing={this.state.refreshing}
						  onRefresh={this._onRefresh}
						  colors={[brandPrimary]}
						/>
					  }
				/>
				{this.state.rowsAndSections.length !== 0 && (
					<View style={line}/>
				)}
				<DeviceHistoryDetails intl={intl} currentTab={currentTab} currentScreen={currentScreen}/>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const fontSizeNoData = Math.floor(deviceWidth * 0.03);
		const fontSizeSectionText = Math.floor(deviceWidth * 0.04);
		const iconSize = Math.floor(deviceWidth * 0.06);

		return {
			line: {
				backgroundColor: '#A59F9A',
				height: '100%',
				width: 1,
				position: 'absolute',
				left: deviceWidth * 0.071333333,
				top: 0,
				zIndex: -1,
			},
			sectionHeaderText: {
				color: '#A59F9A',
				fontSize: fontSizeSectionText,
			},
			sectionHeader: {
				paddingVertical: fontSizeSectionText * 0.5,
				backgroundColor: '#ffffff',
				justifyContent: 'center',
				paddingLeft: 5 + (fontSizeSectionText * 0.2),
				...Theme.Core.shadow,
			},
			textWhenNoData: {
				marginLeft: 10 + (fontSizeNoData * 0.2),
				color: '#A59F9A',
				fontSize: fontSizeNoData,
			},
			iconSize,
		};
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 2,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},
	containerWhenNoData: {
		paddingTop: 20,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
});

// prepares the row and section data required for the List.
const parseHistoryForSectionList = (data: Object): Array<any> => {
	let result = _.groupBy(data, (items: Object): any => {
		let date = new Date(items.ts * 1000).toDateString();
		return date;
	});
	result = _.reduce(result, (acc: Array<any>, next: Object, index: number): Array<any> => {
		acc.push({
			key: index,
			data: next,
		});
		return acc;
	}, []);
	return result;
};

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		deviceHistoryNavigator: ownProps.navigation,
		device: ownProps.screenProps.device,
		appLayout: getRelativeDimensions(state.App.layout),
		showModal: state.modal.openModal,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HistoryTab);
