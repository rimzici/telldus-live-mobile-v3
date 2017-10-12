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
import { createSelector } from 'reselect';
import { defineMessages } from 'react-intl';

import { List, ListDataSource, Text, View } from 'BaseComponents';
import { DeviceRow, DeviceRowHidden } from 'TabViews_SubViews';

import { getDevices, getDeviceHistory } from 'Actions_Devices';
import type { Dispatch } from 'Actions_Types';

import { getDeviceType, getTabBarIcon } from 'Lib';

import { parseDevicesForListView } from 'Reducers_Devices';

import Theme from 'Theme';

const messages = defineMessages({
	devices: {
		id: 'pages.devices',
		defaultMessage: 'Devices',
		description: 'The devices tab',
	},
});

type Props = {
	rowsAndSections: Object,
	gatewaysById: Object,
	editMode: boolean,
	devices: Object,
	tab: string,
	dispatch: Dispatch,
	stackNavigator: Object,
};

type State = {
	dataSource: Object,
	deviceId: number,
	dimmer: boolean,
};

class DevicesTab extends View {

	props: Props;
	state: State;

	onCloseSelected: () => void;
	openDeviceDetail: (number) => void;
	setScrollEnabled: (boolean) => void;
	renderSectionHeader: (sectionData: Object, sectionId: number) => Object;
	renderRow: (Object) => Object;
	renderHiddenRow: (Object) => Object;
	onRefresh: () => void;

	static navigationOptions = ({navigation, screenProps}: Object): Object => ({
		title: screenProps.intl.formatMessage(messages.devices),
		tabBarIcon: ({ focused, tintColor }: Object): React$Element<any> => getTabBarIcon(focused, tintColor, 'devices'),
	});

	constructor(props: Props) {
		super(props);

		const { sections, sectionIds } = this.props.rowsAndSections;

		this.state = {
			dataSource: new ListDataSource({
				rowHasChanged: this.rowHasChanged,
				sectionHeaderHasChanged: (s1: Object, s2: Object): boolean => s1 !== s2,
			}).cloneWithRowsAndSections(sections, sectionIds),
			deviceId: -1,
			dimmer: false,
		};
		this.onCloseSelected = this.onCloseSelected.bind(this);
		this.openDeviceDetail = this.openDeviceDetail.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.renderHiddenRow = this.renderHiddenRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
	}

	componentWillReceiveProps(nextProps: Object) {
		const { sections, sectionIds } = nextProps.rowsAndSections;

		this.setState({
			dataSource: this.state.dataSource.cloneWithRowsAndSections(sections, sectionIds),
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.tab === 'devicesTab' || nextProps.editMode !== this.props.editMode;
	}

	rowHasChanged(r1: Object, r2: Object): boolean {
		if (r1 === r2) {
			return false;
		}
		return (
			r1.device !== r2.device ||
			r1.inDashboard !== r2.inDashboard ||
			r1.editMode !== r2.editMode
		);
	}

	render(): React$Element<any> {
		return (
			<View style={{ flex: 1 }}>
				<List
					ref="list"
					dataSource={this.state.dataSource}
					renderHiddenRow={this.renderHiddenRow}
					renderRow={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					leftOpenValue={40}
					editMode={this.props.editMode}
					onRefresh={this.onRefresh}
				/>
			</View>
		);
	}

	renderRow(row: Object): React$Element<any> {
		return (
			<DeviceRow {...row}
			           onSettingsSelected={this.openDeviceDetail}
			           setScrollEnabled={this.setScrollEnabled}
			/>
		);
	}

	renderHiddenRow(row: Object): React$Element<any> {
		return (
			<DeviceRowHidden {...row}/>
		);
	}

	openDeviceDetail(device: Object) {
		this.props.dispatch(getDeviceHistory(device));
		this.props.stackNavigator.navigate('DeviceDetails', { id: device.id });
	}

	onCloseSelected() {
		this.setState({ deviceId: -1 });
	}

	setScrollEnabled(enable: boolean) {
		if (this.refs.list && this.refs.list.setScrollEnabled) {
			this.refs.list.setScrollEnabled(enable);
		}
	}

	renderSectionHeader(sectionData: Object, sectionId: number): React$Element<any> {
		const gateway = this.props.gatewaysById[sectionId];
		return (
			<View style={Theme.Styles.sectionHeader}>
				<Text style={Theme.Styles.sectionHeaderText}>
					{(gateway && gateway.name) ? gateway.name : ''}
				</Text>
			</View>
		);
	}

	onRefresh() {
		this.props.dispatch(getDevices());
	}

	getType(deviceId: number): any {
		const filteredItem = this.props.devices.byId[deviceId];
		if (!filteredItem) {
			return null;
		}

		const supportedMethods = filteredItem.supportedMethods;
		return getDeviceType(supportedMethods);
	}
}

DevicesTab.propTypes = {
	rowsAndSections: React.PropTypes.object,
};

const getRowsAndSections = createSelector(
	[
		({ devices }: Object): Object => devices,
		({ gateways }: Object): Object => gateways,
		({ tabs }: Object): Object => tabs.editModeDevicesTab,
	],
	(devices: Object, gateways: Object, editMode: boolean): Object => {
		const { sections, sectionIds } = parseDevicesForListView(devices, gateways, editMode);
		return {
			sections,
			sectionIds,
		};
	}
);

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		stackNavigator: ownProps.screenProps.stackNavigator,
		rowsAndSections: getRowsAndSections(state),
		gatewaysById: state.gateways.byId,
		editMode: state.tabs.editModeDevicesTab,
		devices: state.devices,
		tab: state.navigation.tab,
	};
}

function mapDispatchToProps(dispatch: Dispatch): Object {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DevicesTab);
