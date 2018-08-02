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
import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';

import { List, ListDataSource, View } from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import { DeviceRow } from './SubViews';
import i18n from '../../Translations/common';
interface Props extends ScheduleProps {
	devices: Object,
	resetSchedule: () => void,
}

type State = {
	dataSource: Object,
};

export default class Device extends View<void, Props, State> {

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		devices: PropTypes.object,
		onDidMount: PropTypes.func,
		schedule: PropTypes.object,
		resetSchedule: PropTypes.func,
	};

	state = {
		dataSource: new ListDataSource({
			rowHasChanged: (r1: Object, r2: Object): boolean => r1 !== r2,
		}).cloneWithRows(orderBy(this.props.devices.byId, [(device: Object): any => device.name.toLowerCase()], ['asc'])),
	};

	constructor(props: Props) {
		super(props);

		let { formatMessage } = this.props.intl;

		this.h1 = `1. ${formatMessage(i18n.labelDevice)}`;
		this.h2 = formatMessage(i18n.posterChooseDevice);
	}

	componentDidMount() {
		const { actions, onDidMount } = this.props;
		actions.getDevices();
		onDidMount(this.h1, this.h2);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'InitialScreen';
	}

	componentWillUnmount() {
		this.props.actions.resetSchedule();
	}

	onRefresh = () => {
		this.props.actions.getDevices();
	};

	selectDevice = (row: Object) => {
		const { actions, navigation } = this.props;
		navigation.navigate('Action');
		actions.selectDevice(row.id);
	};

	render(): React$Element<List> {
		return (
			<List
				dataSource={this.state.dataSource}
				renderRow={this._renderRow}
				onRefresh={this.onRefresh}
			/>
		);
	}

	_renderRow = (row: Object): Object => {
		const { appLayout, intl } = this.props;
		// TODO: use device description
		const preparedRow = Object.assign({}, row, { description: '' });

		return <DeviceRow row={preparedRow} onPress={this.selectDevice} appLayout={appLayout}
			intl={intl} labelPostScript={intl.formatMessage(i18n.defaultDescriptionButton)}
			containerStyle = {{
				flex: 1,
				alignItems: 'stretch',
				justifyContent: 'space-between',
			}}/>;
	};

}
